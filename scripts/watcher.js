require('dotenv').config();

const chokidar = require('chokidar');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');
const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────

const WATCH_DIR     = process.env.WATCH_DIR     || '/watch/portfolio-clients';
const OPTIMIZED_DIR = process.env.OPTIMIZED_DIR || '/watch/optimized';
const R2_BUCKET     = process.env.R2_BUCKET;
const CDN_BASE_URL  = process.env.CDN_BASE_URL  || 'https://cdn.kylepayawal.studio';

// Max number of files processed at the same time. Keep this modest —
// each "file" involves an image/video transcode + an R2 upload + 1-2
// Supabase requests, so running hundreds at once is what was causing
// "TypeError: fetch failed" and silently dropped rows.
const CONCURRENCY = parseInt(process.env.WATCHER_CONCURRENCY || '4', 10);

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.cr2', '.nef', '.arw'];
const VIDEO_EXTS = ['.mp4', '.mov', '.mts', '.m2ts'];
const AUDIO_EXTS = ['.mp3', '.wav', '.ogg', '.aac', '.m4a'];

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    // Node 20 has no native WebSocket, and supabase-js initializes a
    // realtime client internally even though we never use realtime
    // subscriptions here. Without this, createClient() throws on startup.
    realtime: {
      transport: ws,
    },
  }
);

// ─── Debug: confirm env vars on startup ──────────────────────────────────────
console.log('🔑 SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ set' : '✗ MISSING');
console.log('🔑 SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✓ set' : '✗ MISSING');
console.log('🔑 TRUENAS_DOWNLOAD_BASE:', process.env.TRUENAS_DOWNLOAD_BASE ? '✓ set' : '✗ MISSING');
console.log('🔑 WATCHER_CONCURRENCY:', CONCURRENCY);

// ─── Tiny concurrency queue ───────────────────────────────────────────────────

class ConcurrencyQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this._next();
    });
  }

  _next() {
    if (this.running >= this.concurrency || this.queue.length === 0) return;
    this.running++;
    const { fn, resolve, reject } = this.queue.shift();
    Promise.resolve()
      .then(fn)
      .then(resolve, reject)
      .finally(() => {
        this.running--;
        this._next();
      });
  }
}

const queue = new ConcurrencyQueue(CONCURRENCY);

// ─── Retry helper ─────────────────────────────────────────────────────────────

async function withRetry(fn, { retries = 3, baseDelayMs = 500, label = 'request' } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const delay = baseDelayMs * 2 ** (attempt - 1);
        console.warn(`  ⚠ ${label} failed (attempt ${attempt}/${retries}): ${err.message}. Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function uploadToR2(localPath, r2Key, contentType) {
  const fileBuffer = fs.readFileSync(localPath);
  await withRetry(
    () =>
      r2.send(
        new PutObjectCommand({
          Bucket:      R2_BUCKET,
          Key:         r2Key,
          Body:        fileBuffer,
          ContentType: contentType,
        })
      ),
    { label: `R2 upload (${r2Key})` }
  );
  console.log(`  ✓ Uploaded to R2: ${r2Key}`);
}

async function deleteFromR2(r2Key) {
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: r2Key }));
    console.log(`  ✓ Deleted from R2: ${r2Key}`);
  } catch (err) {
    // NoSuchKey = already gone, not an error worth surfacing
    if (err?.Code !== 'NoSuchKey' && err?.name !== 'NoSuchKey') throw err;
    console.log(`  ℹ R2 object already absent: ${r2Key}`);
  }
}

function deleteLocal(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    console.warn(`  ⚠ Could not delete temp file ${filePath}:`, err.message);
  }
}

// ─── Parse Path ───────────────────────────────────────────────────────────────

function parsePath(filePath) {
  const relative = path.relative(WATCH_DIR, filePath);
  const segments = relative.split(path.sep).filter(Boolean);

  // clients/{accessCode}/MUSIC/{filename}
  if (segments[0] === 'clients' && segments[2] === 'MUSIC' && segments.length === 4) {
    return { type: 'music', accessCode: segments[1], filename: segments[3] };
  }

  // clients/{accessCode}/{filename}
  if (segments[0] === 'clients' && segments.length === 3) {
    return { type: 'client', accessCode: segments[1], filename: segments[2] };
  }

  // portfolio/{category}/{filename}
  if (segments[0] === 'portfolio' && segments.length === 3) {
    return { type: 'portfolio', category: segments[1], filename: segments[2] };
  }

  return null;
}

// ─── Parse Access Code ────────────────────────────────────────────────────────

function parseAccessCode(accessCode) {
  const parts = accessCode.split('-');
  const clientName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const eventType = parts.slice(1, -1).join('-');
  return { clientName, eventType };
}

// ─── Resolve stored filename ──────────────────────────────────────────────────
// Originals (photo.cr2) are stored in R2/Supabase as converted versions
// (photo.webp / photo.mp4). Derive the stored name from the original ext.

function resolveStoredFilename(filename) {
  const ext  = path.extname(filename).toLowerCase();
  const base = path.basename(filename, ext);
  if (IMAGE_EXTS.includes(ext)) return base + '.webp';
  if (VIDEO_EXTS.includes(ext)) return base + '.mp4';
  if (AUDIO_EXTS.includes(ext)) return filename;          // audio uploaded as-is
  return null;
}

// ─── Image Processing ─────────────────────────────────────────────────────────

async function processImage(filePath, r2Prefix) {
  const baseName = path.basename(filePath, path.extname(filePath));
  const webpName = baseName + '.webp';

  const webDir = path.join(OPTIMIZED_DIR, 'web');
  ensureDir(webDir);

  const webPath = path.join(webDir, webpName);

  await sharp(filePath)
    .webp({ quality: 82 })
    .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
    .toFile(webPath);

  await uploadToR2(webPath, `${r2Prefix}/${webpName}`, 'image/webp');
  deleteLocal(webPath);

  return webpName;
}

// ─── Video Processing ─────────────────────────────────────────────────────────

async function processVideo(filePath, r2Prefix) {
  const baseName   = path.basename(filePath, path.extname(filePath));
  const mp4Name    = baseName + '.mp4';
  const videoDir   = path.join(OPTIMIZED_DIR, 'video');
  ensureDir(videoDir);

  const outputPath = path.join(videoDir, mp4Name);

  console.log(`  → Transcoding to 720p...`);

  await new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .outputOptions([
        '-vf scale=-2:720',
        '-c:v libx264',
        '-crf 28',
        '-preset fast',
        '-c:a aac',
        '-b:a 128k',
        '-movflags +faststart',
      ])
      .save(outputPath)
      .on('progress', (progress) => {
        if (progress.percent) {
          process.stdout.write(`  → ${Math.round(progress.percent)}%\r`);
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log('');

  await uploadToR2(outputPath, `${r2Prefix}/${mp4Name}`, 'video/mp4');
  deleteLocal(outputPath);

  return mp4Name;
}

// ─── Add Handlers ─────────────────────────────────────────────────────────────

async function handleClientFile(accessCode, filename, filePath, ext) {
  console.log(`[client] ${accessCode}/${filename}`);

  const { clientName, eventType } = parseAccessCode(accessCode);
  console.log(`  → Upserting client: ${accessCode} (${clientName} / ${eventType})`);

  try {
    await withRetry(
      () =>
        supabase
          .from('clients')
          .upsert(
            { access_code: accessCode, client_name: clientName, event_type: eventType },
            { onConflict: 'access_code' }
          )
          .then(({ error }) => { if (error) throw error; }),
      { label: `Client upsert (${accessCode})` }
    );
    console.log(`  ✓ Client ensured: ${accessCode}`);
  } catch (err) {
    console.error(`  ✗ Client upsert failed after retries:`, err.message);
  }

  let uploadedName = null;
  let fileType = null;

  if (IMAGE_EXTS.includes(ext)) {
    uploadedName = await processImage(filePath, `clients/${accessCode}`);
    fileType = 'photo';
  } else if (VIDEO_EXTS.includes(ext)) {
    uploadedName = await processVideo(filePath, `clients/${accessCode}`);
    fileType = 'video';
  }

  if (uploadedName) {
    const url         = `${CDN_BASE_URL}/clients/${accessCode}/${uploadedName}`;
    const downloadUrl = `${process.env.TRUENAS_DOWNLOAD_BASE}/dl/${accessCode}/${filename}`;

    console.log(`  → Inserting into files table...`);

    try {
      await withRetry(
        () =>
          supabase
            .from('files')
            .upsert(
              { client_code: accessCode, url, download_url: downloadUrl, filename, type: fileType },
              { onConflict: 'url' }
            )
            .then(({ error }) => { if (error) throw error; }),
        { label: `Files upsert (${filename})` }
      );
      console.log(`  ✓ Inserted into files table: ${filename} [${fileType}]`);
    } catch (err) {
      console.error(`  ✗ Files upsert failed after retries: ${filename}:`, err.message);
      console.error(`  ✗ NEEDS BACKFILL: client_code=${accessCode} filename=${filename}`);
    }
  }

  console.log(`  ✓ Done (original preserved on TrueNAS)`);
}

async function handlePortfolioFile(category, filename, filePath, ext) {
  console.log(`[portfolio] ${category}/${filename}`);

  let uploadedName = null;
  let fileType = null;

  if (IMAGE_EXTS.includes(ext)) {
    uploadedName = await processImage(filePath, `portfolio/${category}`);
    fileType = 'photo';
  } else if (VIDEO_EXTS.includes(ext)) {
    uploadedName = await processVideo(filePath, `portfolio/${category}`);
    fileType = 'video';
  }

  if (uploadedName) {
    const url   = `${CDN_BASE_URL}/portfolio/${category}/${uploadedName}`;
    const title = path.basename(uploadedName, fileType === 'photo' ? '.webp' : '.mp4');

    try {
      await withRetry(
        () =>
          supabase
            .from('portfolio')
            .upsert(
              { title, category, url, type: fileType },
              { onConflict: 'url' }
            )
            .then(({ error }) => { if (error) throw error; }),
        { label: `Portfolio upsert (${title})` }
      );
      console.log(`  ✓ Inserted into portfolio table: ${title} [${fileType}]`);
    } catch (err) {
      console.error(`  ✗ Supabase upsert failed after retries: ${title}:`, err.message);
    }
  }

  console.log(`  ✓ Done`);
}

async function handleMusicFile(accessCode, filename, filePath) {
  console.log(`[music] ${accessCode}/MUSIC/${filename}`);

  const r2Key       = `clients/${accessCode}/MUSIC/${filename}`;
  const ext         = path.extname(filename).toLowerCase();
  const mimeMap     = { '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.aac': 'audio/aac', '.m4a': 'audio/mp4' };
  const contentType = mimeMap[ext] || 'audio/mpeg';

  await uploadToR2(filePath, r2Key, contentType);

  const url = `${CDN_BASE_URL}/${r2Key}`;

  try {
    await withRetry(
      () =>
        supabase
          .from('client_music')
          .upsert(
            { client_code: accessCode, filename, url },
            { onConflict: 'client_code,filename' }
          )
          .then(({ error }) => { if (error) throw error; }),
      { label: `Music upsert (${filename})` }
    );
    console.log(`  ✓ Inserted into client_music table: ${filename}`);
  } catch (err) {
    console.error(`  ✗ Music upsert failed after retries: ${filename}:`, err.message);
  }

  console.log(`  ✓ Done (original preserved on TrueNAS)`);
}

// ─── Delete Handlers ──────────────────────────────────────────────────────────

async function handlePortfolioFileDeleted(category, filename) {
  console.log(`[portfolio:delete] ${category}/${filename}`);

  const storedName = resolveStoredFilename(filename);
  if (!storedName) {
    console.log(`  ℹ Unsupported extension, skipping: ${filename}`);
    return;
  }

  const r2Key = `portfolio/${category}/${storedName}`;
  const url   = `${CDN_BASE_URL}/${r2Key}`;

  try {
    await withRetry(
      () =>
        supabase
          .from('portfolio')
          .delete()
          .eq('url', url)
          .then(({ error }) => { if (error) throw error; }),
      { label: `Portfolio delete (${storedName})` }
    );
    console.log(`  ✓ Removed from portfolio table: ${storedName}`);
  } catch (err) {
    console.error(`  ✗ Supabase delete failed: ${storedName}:`, err.message);
  }

  try {
    await deleteFromR2(r2Key);
  } catch (err) {
    console.error(`  ✗ R2 delete failed: ${r2Key}:`, err.message);
  }

  console.log(`  ✓ Done`);
}

async function handleClientFileDeleted(accessCode, filename) {
  console.log(`[client:delete] ${accessCode}/${filename}`);

  const storedName = resolveStoredFilename(filename);
  if (!storedName) {
    console.log(`  ℹ Unsupported extension, skipping: ${filename}`);
    return;
  }

  const r2Key = `clients/${accessCode}/${storedName}`;
  const url   = `${CDN_BASE_URL}/${r2Key}`;

  // Clean up favorites first (avoids FK violation if cascade isn't configured)
  try {
    const { data: fileRow } = await supabase
      .from('files')
      .select('id')
      .eq('client_code', accessCode)
      .eq('filename', filename)
      .maybeSingle();

    if (fileRow?.id) {
      await supabase.from('gallery_favorites').delete().eq('file_id', fileRow.id);
    }
  } catch (err) {
    console.warn(`  ⚠ Could not clean favorites for ${filename}:`, err.message);
  }

  // Delete file row (matched by original filename since that's what's stored)
  try {
    await withRetry(
      () =>
        supabase
          .from('files')
          .delete()
          .eq('client_code', accessCode)
          .eq('filename', filename)
          .then(({ error }) => { if (error) throw error; }),
      { label: `Files delete (${filename})` }
    );
    console.log(`  ✓ Removed from files table: ${filename}`);
  } catch (err) {
    console.error(`  ✗ Supabase delete failed: ${filename}:`, err.message);
  }

  try {
    await deleteFromR2(r2Key);
  } catch (err) {
    console.error(`  ✗ R2 delete failed: ${r2Key}:`, err.message);
  }

  console.log(`  ✓ Done`);
}

async function handleMusicFileDeleted(accessCode, filename) {
  console.log(`[music:delete] ${accessCode}/MUSIC/${filename}`);

  const r2Key = `clients/${accessCode}/MUSIC/${filename}`;

  try {
    await withRetry(
      () =>
        supabase
          .from('client_music')
          .delete()
          .eq('client_code', accessCode)
          .eq('filename', filename)
          .then(({ error }) => { if (error) throw error; }),
      { label: `Music delete (${filename})` }
    );
    console.log(`  ✓ Removed from client_music table: ${filename}`);
  } catch (err) {
    console.error(`  ✗ Supabase delete failed: ${filename}:`, err.message);
  }

  try {
    await deleteFromR2(r2Key);
  } catch (err) {
    console.error(`  ✗ R2 delete failed: ${r2Key}:`, err.message);
  }

  console.log(`  ✓ Done`);
}

// ─── Main Handlers ────────────────────────────────────────────────────────────

async function handleFile(filePath) {
  const parsed = parsePath(filePath);
  if (!parsed) return;

  const ext = path.extname(parsed.filename).toLowerCase();

  if (parsed.type === 'music') {
    if (!AUDIO_EXTS.includes(ext)) return;
    try {
      await handleMusicFile(parsed.accessCode, parsed.filename, filePath);
    } catch (err) {
      console.error(`[error] Failed processing music ${parsed.filename}:`, err.message);
    }
    return;
  }

  const isSupported = IMAGE_EXTS.includes(ext) || VIDEO_EXTS.includes(ext);
  if (!isSupported) return;

  try {
    if (parsed.type === 'client') {
      await handleClientFile(parsed.accessCode, parsed.filename, filePath, ext);
    } else if (parsed.type === 'portfolio') {
      await handlePortfolioFile(parsed.category, parsed.filename, filePath, ext);
    }
  } catch (err) {
    console.error(`[error] Failed processing ${parsed.filename}:`, err.message);
  }
}

async function handleFileDeleted(filePath) {
  const parsed = parsePath(filePath);
  if (!parsed) return;

  const ext = path.extname(parsed.filename).toLowerCase();

  try {
    if (parsed.type === 'music') {
      if (!AUDIO_EXTS.includes(ext)) return;
      await handleMusicFileDeleted(parsed.accessCode, parsed.filename);
    } else if (parsed.type === 'client') {
      if (!IMAGE_EXTS.includes(ext) && !VIDEO_EXTS.includes(ext)) return;
      await handleClientFileDeleted(parsed.accessCode, parsed.filename);
    } else if (parsed.type === 'portfolio') {
      if (!IMAGE_EXTS.includes(ext) && !VIDEO_EXTS.includes(ext)) return;
      await handlePortfolioFileDeleted(parsed.category, parsed.filename);
    }
  } catch (err) {
    console.error(`[error] Failed deleting ${parsed.filename}:`, err.message);
  }
}

// ─── Watcher ──────────────────────────────────────────────────────────────────

console.log(`\n📁 Watching: ${WATCH_DIR}`);
console.log(`📦 R2 Bucket: ${R2_BUCKET}`);
console.log(`⏳ Waiting for new files...\n`);

const watcher = chokidar.watch(WATCH_DIR, {
  persistent:        true,
  ignoreInitial:     true,
  // usePolling is required on TrueNAS/ZFS + Docker bind mounts — inotify
  // does not reliably fire for deletions in this environment. Polling at
  // 5 s is a good balance between responsiveness and CPU overhead.
  usePolling:        true,
  interval:          5000,
  binaryInterval:    5000,
  awaitWriteFinish: {
    stabilityThreshold: 3000,
    pollInterval:        500,
  },
});

watcher.on('add', (filePath) => {
  queue.add(() => handleFile(filePath)).catch((err) => {
    console.error(`[queue] Unexpected error processing ${filePath}:`, err.message);
  });
});

watcher.on('unlink', (filePath) => {
  queue.add(() => handleFileDeleted(filePath)).catch((err) => {
    console.error(`[queue] Unexpected error deleting ${filePath}:`, err.message);
  });
});

watcher.on('error', (err) => {
  console.error('[watcher] Error:', err);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down watcher...');
  watcher.close().then(() => process.exit(0));
});
