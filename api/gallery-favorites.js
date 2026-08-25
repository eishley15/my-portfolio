import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl        = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const jwtSecret          = process.env.DOWNLOAD_TOKEN_SECRET;
const corsOrigin         = process.env.CORS_ORIGIN || 'https://kylepayawal.studio';

function verifyToken(req) {
  const auth  = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, jwtSecret);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = verifyToken(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  // accessCode always from JWT — never trust request body for this
  const { accessCode, clientName } = payload;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    if (req.method === 'GET') {
      const { type } = req.query;

      // GET ?type=testimonial — check if client already submitted a testimonial
      if (type === 'testimonial') {
        const { data: rows, error } = await supabase
          .from('testimonials')
          .select('id, quote, status, created_at')
          .eq('client_code', accessCode)
          .limit(1);
        if (error) {
          console.error('testimonials:get error:', error);
          return res.status(500).json({ error: 'Internal server error', detail: error.message });
        }
        return res.status(200).json({ testimonial: rows?.[0] ?? null });
      }

      const { data, error } = await supabase
        .from('gallery_favorites')
        .select('file_id, created_at')
        .eq('client_code', accessCode)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return res.status(200).json({ favorites: data || [] });
    }

    if (req.method === 'POST') {
      const { fileId, type, quote, eventType } = req.body || {};

      // POST { type: 'testimonial' } — submit a testimonial
      if (type === 'testimonial') {
        if (!quote || typeof quote !== 'string' || !quote.trim()) {
          return res.status(400).json({ error: 'Missing quote' });
        }
        // One testimonial per client — check for existing
        const { data: existingRows, error: existErr } = await supabase
          .from('testimonials')
          .select('id')
          .eq('client_code', accessCode)
          .limit(1);
        if (existErr) {
          console.error('testimonials:post:check error:', existErr);
          return res.status(500).json({ error: 'Internal server error', detail: existErr.message });
        }
        if (existingRows?.length > 0) {
          return res.status(409).json({ error: 'Testimonial already submitted' });
        }
        // Resolve client name from clients table (JWT only has accessCode)
        const { data: clientRows } = await supabase
          .from('clients')
          .select('client_name')
          .eq('access_code', accessCode)
          .limit(1);
        const resolvedName = clientRows?.[0]?.client_name || accessCode;
        const { error: insErr } = await supabase.from('testimonials').insert({
          client_code:  accessCode,
          client_name:  resolvedName,
          event_type:   typeof eventType === 'string' ? eventType.slice(0, 80) : null,
          quote:        quote.trim().slice(0, 1000),
          status:       'pending',
          show_on_home: false,
        });
        if (insErr) {
          console.error('testimonials:post:insert error:', insErr);
          return res.status(500).json({ error: 'Internal server error', detail: insErr.message });
        }
        return res.status(200).json({ ok: true });
      }

      if (!fileId) return res.status(400).json({ error: 'Missing fileId' });

      // Verify the file belongs to this gallery before inserting
      const { data: file } = await supabase
        .from('files')
        .select('id')
        .eq('id', fileId)
        .eq('client_code', accessCode)
        .single();

      if (!file) return res.status(403).json({ error: 'File not found in this gallery' });

      const { error } = await supabase
        .from('gallery_favorites')
        .upsert(
          { client_code: accessCode, file_id: fileId },
          { onConflict: 'client_code,file_id' }
        );

      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { fileId } = req.body;
      if (!fileId) return res.status(400).json({ error: 'Missing fileId' });

      const { error } = await supabase
        .from('gallery_favorites')
        .delete()
        .eq('client_code', accessCode)
        .eq('file_id', fileId);

      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('gallery-favorites error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
