import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const webhookSecret = process.env.WEBHOOK_SECRET;

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Verify webhook secret from header
    const providedSecret = req.headers['x-webhook-secret'];
    if (!providedSecret || providedSecret !== webhookSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. Parse JSON body from Nextcloud webhook
    const { event, user, path } = req.body;

    if (!path) {
      return res.status(400).json({ error: 'Missing path in webhook payload' });
    }

    // 3. Extract galleryId from path
    // Expected format: /Photos/Clients/galleryId/filename.ext
    const pathParts = path.split('/').filter(Boolean); // Remove empty strings

    // Only process files inside /Photos/Clients/ directory
    if (pathParts.length < 3 || pathParts[0] !== 'Photos' || pathParts[1] !== 'Clients') {
      // Not in the expected directory structure, ignore gracefully
      return res.status(200).json({ ok: true, ignored: true });
    }

    const galleryId = pathParts[2]; // The gallery folder name (e.g., "wedding-2024-santos")

    // 4. Initialize Supabase client and look up user by gallery_id
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('gallery_id', galleryId)
      .single();

    if (profileError || !profileData) {
      // No matching user found for this gallery, ignore gracefully
      return res.status(200).json({ ok: true, ignored: true });
    }

    const userId = profileData.id;

    // 5. Upsert into gallery_access to prevent duplicate rows
    const { error: accessError } = await supabase
      .from('gallery_access')
      .upsert(
        { user_id: userId, gallery_id: galleryId },
        { onConflict: ['user_id', 'gallery_id'] },
      );

    if (accessError) {
      console.error('Failed to upsert gallery access:', accessError);
      return res.status(500).json({ error: 'Failed to process webhook' });
    }

    // 6. Return success response
    return res.status(200).json({ ok: true, galleryId, userId });
  } catch (error) {
    console.error('Gallery uploaded webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
