import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const webhookSecret = process.env.WEBHOOK_SECRET;
const cdnBaseUrl = process.env.CDN_BASE_URL;
const trueNasBaseUrl = process.env.TRUENAS_DOWNLOAD_BASE;

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Verify webhook secret
    const headerSecret = req.headers['x-webhook-secret'];
    if (!headerSecret || headerSecret !== webhookSecret) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    // 2. Parse webhook payload
    const { event, user, path } = req.body;

    if (!event || !path) {
      return res.status(400).json({ error: 'Missing event or path' });
    }

    // 3. Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Route based on path and event
    const pathSegments = path.split('/').filter(Boolean);

    // CASE 1: Portfolio-Clients, folder_created
    if (pathSegments[0] === 'Portfolio-Clients' && event === 'folder_created' && pathSegments.length === 2) {
      return await handleClientCreated(supabase, pathSegments[1], res);
    }

    // CASE 2: Portfolio-Clients, file_created
    if (pathSegments[0] === 'Portfolio-Clients' && event === 'file_created' && pathSegments.length === 3) {
      return await handleClientFile(supabase, pathSegments[1], pathSegments[2], res);
    }

    // CASE 3: Originals, file_created
    if (pathSegments[0] === 'Originals' && event === 'file_created' && pathSegments.length === 3) {
      return await handleOriginalFile(supabase, pathSegments[1], pathSegments[2], res);
    }

    // CASE 4: Optimized, file_created
    if (pathSegments[0] === 'Optimized' && event === 'file_created' && pathSegments.length === 3) {
      return await handleOptimizedFile(supabase, pathSegments[1], pathSegments[2], res);
    }

    // Unknown path or event
    return res.status(400).json({ error: 'Unknown webhook path or event' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * CASE 1: Portfolio-Clients/{accessCode} folder created
 * Extract client_name (first word before first hyphen, capitalized)
 * Extract event_type (last word after last hyphen)
 * Upsert into clients table
 */
async function handleClientCreated(supabase, accessCode, res) {
  try {
    // Parse access code: "micah-film-2026" -> client_name: "Micah", event_type: "film"
    const parts = accessCode.split('-');
    const clientName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    const eventType = parts[parts.length - 2]; // Second to last is the event type

    const { error } = await supabase
      .from('clients')
      .upsert(
        {
          access_code: accessCode,
          client_name: clientName,
          event_type: eventType,
        },
        { onConflict: 'access_code' }
      );

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      case: 'client_created',
      accessCode,
      clientName,
      eventType,
    });
  } catch (error) {
    console.error('Client creation error:', error);
    return res.status(500).json({ error: 'Failed to create client' });
  }
}

/**
 * CASE 2: Portfolio-Clients/{accessCode}/{filename} file created
 * Construct CDN URL and upsert into files table
 */
async function handleClientFile(supabase, accessCode, filename, res) {
  try {
    const url = `${cdnBaseUrl}/kylepayawal/${filename}`;

    const { error } = await supabase
      .from('files')
      .upsert(
        {
          client_code: accessCode,
          filename,
          url,
        },
        { onConflict: ['client_code', 'filename'] }
      );

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      case: 'file_created',
      accessCode,
      filename,
    });
  } catch (error) {
    console.error('Client file creation error:', error);
    return res.status(500).json({ error: 'Failed to create file record' });
  }
}

/**
 * CASE 3: Originals/{galleryId}/{filename} file created
 * Construct TrueNAS URL and upsert into files table
 */
async function handleOriginalFile(supabase, galleryId, filename, res) {
  try {
    const url = `${trueNasBaseUrl}/dl/${galleryId}/${filename}`;

    // Upsert file record
    const { error: fileError } = await supabase
      .from('files')
      .upsert(
        {
          client_code: galleryId,
          filename,
          url,
        },
        { onConflict: ['client_code', 'filename'] }
      );

    if (fileError) throw fileError;

    return res.status(200).json({
      ok: true,
      case: 'original_file',
      galleryId,
      filename,
    });
  } catch (error) {
    console.error('Original file creation error:', error);
    return res.status(500).json({ error: 'Failed to create original file record' });
  }
}

/**
 * CASE 4: Optimized/{category}/{filename} file created
 * Only process .webp files
 * Upsert into portfolio table
 */
async function handleOptimizedFile(supabase, category, filename, res) {
  try {
    // Only process .webp files
    if (!filename.toLowerCase().endsWith('.webp')) {
      return res.status(200).json({
        ok: true,
        case: 'portfolio_item_skipped',
        reason: 'Not a WebP file',
        category,
        filename,
      });
    }

    // Remove .webp extension for title
    const title = filename.replace(/\.webp$/i, '');
    const url = `${cdnBaseUrl}/web/${filename}`;

    const { error } = await supabase
      .from('portfolio')
      .upsert(
        {
          title,
          category,
          url,
        },
        { onConflict: 'url' }
      );

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      case: 'portfolio_item',
      category,
      filename,
      title,
    });
  } catch (error) {
    console.error('Portfolio item creation error:', error);
    return res.status(500).json({ error: 'Failed to create portfolio item' });
  }
}
