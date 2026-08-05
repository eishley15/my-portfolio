import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { S3Client, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

const supabaseUrl        = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const webhookSecret      = process.env.WEBHOOK_SECRET;
const cdnBaseUrl         = process.env.CDN_BASE_URL;

const VIDEO_EXT  = /\.(mp4|webm|mov)$/i;
const AUDIO_EXT  = /\.(mp3|wav|ogg|aac|m4a)$/i;

// ── R2 client (S3-compatible) ──────────────────────────────────────────────
function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId:     process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

const R2_BUCKET = process.env.R2_BUCKET_NAME;

/** Delete a single object from R2. Swallows NoSuchKey — already gone is fine. */
async function r2Delete(key) {
  try {
    const r2 = getR2Client();
    await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  } catch (err) {
    if (err?.Code !== 'NoSuchKey') throw err;
  }
}

/**
 * Delete all R2 objects whose keys start with `prefix`.
 * Used when a whole folder is removed in Nextcloud.
 */
async function r2DeletePrefix(prefix) {
  const r2 = getR2Client();
  let continuationToken;

  do {
    const list = await r2.send(new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }));

    const objects = (list.Contents || []).map(o => ({ Key: o.Key }));

    if (objects.length) {
      await r2.send(new DeleteObjectsCommand({
        Bucket: R2_BUCKET,
        Delete: { Objects: objects, Quiet: true },
      }));
    }

    continuationToken = list.IsTruncated ? list.NextContinuationToken : null;
  } while (continuationToken);
}

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const headerSecret = req.headers['x-webhook-secret'];
    if (!headerSecret || headerSecret !== webhookSecret) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    const { event, path } = req.body;
    if (!event || !path)   return res.status(400).json({ error: 'Missing event or path' });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const segs     = path.split('/').filter(Boolean);

    // ── CREATION EVENTS ────────────────────────────────────────────────────

    // Portfolio-Clients/clients/{accessCode}/  — folder_created → upsert client
    if (segs[0] === 'Portfolio-Clients' && segs[1] === 'clients' && event === 'folder_created' && segs.length === 3) {
      return await handleClientCreated(supabase, segs[2], res);
    }

    // Portfolio-Clients/clients/{accessCode}/MUSIC/  — folder_created → ignore (not a scene)
    if (segs[0] === 'Portfolio-Clients' && segs[1] === 'clients' && event === 'folder_created' && segs.length === 4 && segs[3] === 'MUSIC') {
      return res.status(200).json({ ok: true, case: 'music_folder_ignored' });
    }

    // Portfolio-Clients/clients/{accessCode}/{sceneName}/  — folder_created → upsert scene
    if (segs[0] === 'Portfolio-Clients' && segs[1] === 'clients' && event === 'folder_created' && segs.length === 4) {
      return await handleSceneCreated(supabase, segs[2], segs[3], res);
    }

    // Portfolio-Clients/clients/{accessCode}/{filename}  — file_created at gallery root
    if (segs[0] === 'Portfolio-Clients' && segs[1] === 'clients' && event === 'file_created' && segs.length === 4) {
      const [, , accessCode, filename] = segs;
      if (/^cover\.(jpg|jpeg|png|webp)$/i.test(filename)) return await handleCoverImage(supabase, accessCode, filename, res);
      if (/^cover\.(mp4|webm)$/i.test(filename))          return await handleCoverVideo(supabase, accessCode, filename, res);
      return await handleClientFile(supabase, accessCode, filename, null, res);
    }

    // Portfolio-Clients/clients/{accessCode}/MUSIC/{filename}  — file_created → store music track
    if (segs[0] === 'Portfolio-Clients' && segs[1] === 'clients' && event === 'file_created' && segs.length === 5 && segs[3] === 'MUSIC') {
      const [, , accessCode, , filename] = segs;
      if (!AUDIO_EXT.test(filename)) return res.status(200).json({ ok: true, case: 'music_skipped_non_audio' });
      return await handleMusicFile(supabase, accessCode, filename, res);
    }

    // Portfolio-Clients/clients/{accessCode}/{sceneName}/{filename}  — file_created inside scene
    if (segs[0] === 'Portfolio-Clients' && segs[1] === 'clients' && event === 'file_created' && segs.length === 5) {
      const [, , accessCode, sceneName, filename] = segs;
      if (/^_banner\.(jpg|jpeg|png|webp)$/i.test(filename)) return await handleSceneBanner(supabase, accessCode, sceneName, filename, res);
      return await handleClientFile(supabase, accessCode, filename, sceneName, res);
    }

    // Optimized/{category}/{filename}  — file_created → portfolio item
    if (segs[0] === 'Optimized' && event === 'file_created' && segs.length === 3) {
      return await handleOptimizedFile(supabase, segs[1], segs[2], res);
    }

    // ── DELETION EVENTS ────────────────────────────────────────────────────

    // Optimized/{category}/{filename}  — file_deleted → remove portfolio item + R2 object
    if (segs[0] === 'Optimized' && event === 'file_deleted' && segs.length === 3) {
      return await handleOptimizedFileDeleted(supabase, segs[1], segs[2], res);
    }

    // Portfolio-Clients/clients/{accessCode}/{filename}  — file_deleted at gallery root
    if (segs[0] === 'Portfolio-Clients' && segs[1] === 'clients' && event === 'file_deleted' && segs.length === 4) {
      const [, , accessCode, filename] = segs;
      return await handleClientFileDeleted(supabase, accessCode, filename, null, res);
    }

    // Portfolio-Clients/clients/{accessCode}/MUSIC/{filename}  — file_deleted → remove music track
    if (segs[0] === 'Portfolio-Clients' && segs[1] === 'clients' && event === 'file_deleted' && segs.length === 5 && segs[3] === 'MUSIC') {
      const [, , accessCode, , filename] = segs;
      return await handleMusicFileDeleted(supabase, accessCode, filename, res);
    }

    // Portfolio-Clients/clients/{accessCode}/{sceneName}/{filename}  — file_deleted inside scene
    if (segs[0] === 'Portfolio-Clients' && segs[1] === 'clients' && event === 'file_deleted' && segs.length === 5) {
      const [, , accessCode, sceneName, filename] = segs;
      return await handleClientFileDeleted(supabase, accessCode, filename, sceneName, res);
    }

    // Portfolio-Clients/clients/{accessCode}/{sceneName}/  — folder_deleted → remove scene + its files
    if (segs[0] === 'Portfolio-Clients' && segs[1] === 'clients' && event === 'folder_deleted' && segs.length === 4 && segs[3] !== 'MUSIC') {
      return await handleSceneDeleted(supabase, segs[2], segs[3], res);
    }

    // Portfolio-Clients/clients/{accessCode}/  — folder_deleted → remove client + all related data
    if (segs[0] === 'Portfolio-Clients' && segs[1] === 'clients' && event === 'folder_deleted' && segs.length === 3) {
      return await handleClientDeleted(supabase, segs[2], res);
    }

    return res.status(400).json({ error: 'Unknown webhook path or event' });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ── CREATION HANDLERS ────────────────────────────────────────────────────────

async function handleClientCreated(supabase, folderName, res) {
  const parts      = folderName.split('-');
  const clientName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  const eventType  = parts.length >= 2 ? parts[parts.length - 2] : 'session';

  // Append 4 random hex chars so codes are not fully guessable (SEC-11)
  const suffix     = randomBytes(2).toString('hex');
  const accessCode = `${folderName}-${suffix}`;

  const { error } = await supabase
    .from('clients')
    .upsert({ access_code: accessCode, client_name: clientName, event_type: eventType },
             { onConflict: 'access_code' });

  if (error) throw error;
  return res.status(200).json({ ok: true, case: 'client_created', accessCode, clientName });
}

async function handleSceneCreated(supabase, accessCode, sceneName, res) {
  const slug = slugify(sceneName);

  const { data: existing } = await supabase
    .from('gallery_scenes')
    .select('order_index')
    .eq('client_code', accessCode)
    .order('order_index', { ascending: false })
    .limit(1);

  const nextOrder = existing?.[0]?.order_index != null ? existing[0].order_index + 1 : 0;

  const { error } = await supabase
    .from('gallery_scenes')
    .upsert(
      { client_code: accessCode, name: sceneName, slug, order_index: nextOrder },
      { onConflict: 'client_code,slug' }
    );

  if (error) throw error;
  return res.status(200).json({ ok: true, case: 'scene_created', accessCode, sceneName, slug });
}

async function handleCoverImage(supabase, accessCode, filename, res) {
  const url = `${cdnBaseUrl}/kylepayawal/${accessCode}/${filename}`;
  const { error } = await supabase
    .from('clients')
    .update({ cover_image_url: url })
    .eq('access_code', accessCode);

  if (error) throw error;
  return res.status(200).json({ ok: true, case: 'cover_image', accessCode });
}

async function handleCoverVideo(supabase, accessCode, filename, res) {
  const url = `${cdnBaseUrl}/kylepayawal/${accessCode}/${filename}`;
  const { error } = await supabase
    .from('clients')
    .update({ cover_video_url: url, cover_style: 'video' })
    .eq('access_code', accessCode);

  if (error) throw error;
  return res.status(200).json({ ok: true, case: 'cover_video', accessCode });
}

async function handleSceneBanner(supabase, accessCode, sceneName, filename, res) {
  const slug = slugify(sceneName);
  const url  = `${cdnBaseUrl}/kylepayawal/${accessCode}/${sceneName}/${filename}`;

  const { error } = await supabase
    .from('gallery_scenes')
    .update({ banner_image_url: url })
    .eq('client_code', accessCode)
    .eq('slug', slug);

  if (error) throw error;
  return res.status(200).json({ ok: true, case: 'scene_banner', accessCode, sceneName });
}

async function handleClientFile(supabase, accessCode, filename, sceneName, res) {
  const ext  = filename.split('.').pop().toLowerCase();
  const type = VIDEO_EXT.test(`.${ext}`) ? 'video' : 'photo';
  const url  = sceneName
    ? `${cdnBaseUrl}/kylepayawal/${accessCode}/${sceneName}/${filename}`
    : `${cdnBaseUrl}/kylepayawal/${accessCode}/${filename}`;

  let sceneId = null;
  if (sceneName) {
    const slug = slugify(sceneName);
    const { data: scene } = await supabase
      .from('gallery_scenes')
      .select('id')
      .eq('client_code', accessCode)
      .eq('slug', slug)
      .single();
    sceneId = scene?.id || null;
  }

  const { error } = await supabase
    .from('files')
    .upsert(
      { client_code: accessCode, filename, url, type, scene_id: sceneId },
      { onConflict: 'client_code,filename' }
    );

  if (error) throw error;
  return res.status(200).json({ ok: true, case: 'file_created', accessCode, filename, type });
}

async function handleMusicFile(supabase, accessCode, filename, res) {
  const url = `${cdnBaseUrl}/kylepayawal/${accessCode}/MUSIC/${filename}`;

  const { error } = await supabase
    .from('client_music')
    .upsert(
      { client_code: accessCode, filename, url },
      { onConflict: 'client_code,filename' }
    );

  if (error) throw error;
  return res.status(200).json({ ok: true, case: 'music_uploaded', accessCode, filename, url });
}

async function handleOptimizedFile(supabase, category, filename, res) {
  if (!filename.toLowerCase().endsWith('.webp')) {
    return res.status(200).json({ ok: true, case: 'portfolio_item_skipped' });
  }

  const title = filename.replace(/\.webp$/i, '');
  const url   = `${cdnBaseUrl}/web/${filename}`;

  const { error } = await supabase
    .from('portfolio')
    .upsert({ title, category, url }, { onConflict: 'url' });

  if (error) throw error;
  return res.status(200).json({ ok: true, case: 'portfolio_item', category, filename });
}

// ── DELETION HANDLERS ────────────────────────────────────────────────────────

/**
 * Optimized/{category}/{filename} deleted →
 *   remove from `portfolio` + delete R2 object at web/{filename}
 */
async function handleOptimizedFileDeleted(supabase, category, filename, res) {
  const url = `${cdnBaseUrl}/web/${filename}`;

  const { error } = await supabase
    .from('portfolio')
    .delete()
    .eq('url', url);

  if (error) throw error;

  await r2Delete(`web/${filename}`);

  return res.status(200).json({ ok: true, case: 'portfolio_item_deleted', category, filename });
}

/**
 * Portfolio-Clients/clients/{accessCode}/{filename} or
 * Portfolio-Clients/clients/{accessCode}/{sceneName}/{filename} deleted →
 *   remove from `files` (favorites cleared first) + delete R2 object
 *   If it was a cover/banner file, clear the URL from parent row.
 */
async function handleClientFileDeleted(supabase, accessCode, filename, sceneName, res) {
  // Clear cover refs if applicable
  if (/^cover\.(jpg|jpeg|png|webp)$/i.test(filename)) {
    await supabase.from('clients').update({ cover_image_url: null }).eq('access_code', accessCode);
  }
  if (/^cover\.(mp4|webm)$/i.test(filename)) {
    await supabase.from('clients').update({ cover_video_url: null, cover_style: 'photo' }).eq('access_code', accessCode);
  }

  // Clear scene banner ref if applicable
  if (sceneName && /^_banner\.(jpg|jpeg|png|webp)$/i.test(filename)) {
    const slug = slugify(sceneName);
    await supabase.from('gallery_scenes').update({ banner_image_url: null })
      .eq('client_code', accessCode).eq('slug', slug);
  }

  // Remove favorites before deleting the file row (avoids FK violation if no cascade)
  const { data: fileRow } = await supabase
    .from('files')
    .select('id')
    .eq('client_code', accessCode)
    .eq('filename', filename)
    .maybeSingle();

  if (fileRow?.id) {
    await supabase.from('gallery_favorites').delete().eq('file_id', fileRow.id);
  }

  const { error } = await supabase
    .from('files')
    .delete()
    .eq('client_code', accessCode)
    .eq('filename', filename);

  if (error) throw error;

  // Delete the R2 object
  const r2Key = sceneName
    ? `kylepayawal/${accessCode}/${sceneName}/${filename}`
    : `kylepayawal/${accessCode}/${filename}`;
  await r2Delete(r2Key);

  return res.status(200).json({ ok: true, case: 'client_file_deleted', accessCode, filename });
}

/**
 * Portfolio-Clients/clients/{accessCode}/MUSIC/{filename} deleted →
 *   remove from `client_music` + delete R2 object
 */
async function handleMusicFileDeleted(supabase, accessCode, filename, res) {
  const { error } = await supabase
    .from('client_music')
    .delete()
    .eq('client_code', accessCode)
    .eq('filename', filename);

  if (error) throw error;

  await r2Delete(`kylepayawal/${accessCode}/MUSIC/${filename}`);

  return res.status(200).json({ ok: true, case: 'music_deleted', accessCode, filename });
}

/**
 * Portfolio-Clients/clients/{accessCode}/{sceneName}/ folder deleted →
 *   remove scene + all its files + favorites from Supabase
 *   + bulk-delete all R2 objects under that prefix
 */
async function handleSceneDeleted(supabase, accessCode, sceneName, res) {
  const slug = slugify(sceneName);

  const { data: sceneRow } = await supabase
    .from('gallery_scenes')
    .select('id')
    .eq('client_code', accessCode)
    .eq('slug', slug)
    .maybeSingle();

  if (sceneRow?.id) {
    const { data: sceneFileRows } = await supabase
      .from('files')
      .select('id')
      .eq('scene_id', sceneRow.id);

    if (sceneFileRows?.length) {
      const ids = sceneFileRows.map(r => r.id);
      await supabase.from('gallery_favorites').delete().in('file_id', ids);
    }

    await supabase.from('files').delete().eq('scene_id', sceneRow.id);
  }

  const { error } = await supabase
    .from('gallery_scenes')
    .delete()
    .eq('client_code', accessCode)
    .eq('slug', slug);

  if (error) throw error;

  await r2DeletePrefix(`kylepayawal/${accessCode}/${sceneName}/`);

  return res.status(200).json({ ok: true, case: 'scene_deleted', accessCode, sceneName });
}

/**
 * Portfolio-Clients/clients/{accessCode}/ folder deleted →
 *   remove client + all scenes + files + music + favorites from Supabase
 *   + bulk-delete all R2 objects under that prefix
 */
async function handleClientDeleted(supabase, accessCode, res) {
  // 1. Clear favorites for all files belonging to this client
  const { data: fileRows } = await supabase
    .from('files')
    .select('id')
    .eq('client_code', accessCode);

  if (fileRows?.length) {
    const ids = fileRows.map(r => r.id);
    await supabase.from('gallery_favorites').delete().in('file_id', ids);
  }

  // 2. Delete child records, then parent
  await supabase.from('files').delete().eq('client_code', accessCode);
  await supabase.from('client_music').delete().eq('client_code', accessCode);
  await supabase.from('gallery_scenes').delete().eq('client_code', accessCode);

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('access_code', accessCode);

  if (error) throw error;

  // 3. Bulk-delete everything under this client's R2 prefix
  await r2DeletePrefix(`kylepayawal/${accessCode}/`);

  return res.status(200).json({ ok: true, case: 'client_deleted', accessCode });
}
