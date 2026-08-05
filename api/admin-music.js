import { createClient } from '@supabase/supabase-js';
import { requireStudio } from './_lib/requireStudio.js';
import { applyCors } from './_lib/cors.js';

const supabaseUrl        = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authed = requireStudio(req, res);
  if (!authed) return;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // GET /api/admin-music?action=list&code={accessCode}
    if (req.method === 'GET') {
      const { action, code } = req.query;
      if (action !== 'list' || !code) return res.status(400).json({ error: 'Missing action or code' });

      const { data, error } = await supabase
        .from('client_music')
        .select('id, filename, url, uploaded_at')
        .eq('client_code', code)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ tracks: data || [] });
    }

    // DELETE /api/admin-music  body: { id }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing id' });

      const { error } = await supabase
        .from('client_music')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('admin-music error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
