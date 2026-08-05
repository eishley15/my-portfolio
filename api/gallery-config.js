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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'Method not allowed' });

  const payload = verifyToken(req);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });

  const { accessCode } = payload;

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .select('*')
      .eq('access_code', accessCode)
      .eq('is_active', true)
      .single();

    if (clientErr || !client) return res.status(401).json({ error: 'Unauthorized' });

    if (client.expires_at && new Date(client.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Gallery has expired' });
    }

    const [{ data: scenes }, { data: files }] = await Promise.all([
      supabase
        .from('gallery_scenes')
        .select('*')
        .eq('client_code', accessCode)
        .order('order_index', { ascending: true }),
      supabase
        .from('files')
        .select('*')
        .eq('client_code', accessCode)
        .order('order_index', { ascending: true }),
    ]);

    return res.status(200).json({
      config: client,
      scenes: scenes || [],
      files:  files  || [],
    });

  } catch (err) {
    console.error('gallery-config error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
