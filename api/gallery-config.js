import { getSupabase } from './_lib/supabase.js';
import { resolveGallerySession, publicSession } from './_lib/gallerySession.js';

const corsOrigin = process.env.CORS_ORIGIN || 'https://kylepayawal.studio';

// Fields a share-link visitor must not receive: the access code would let a
// limited-role guest sign in as the owner, and the email is personal data.
const SHARE_HIDDEN_CONFIG_FIELDS = ['access_code', 'email'];

function stripForShare(rows) {
  return (rows || []).map((row) => {
    const rest = { ...row };
    delete rest.client_code;
    return rest;
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const supabase = getSupabase();
    const session  = await resolveGallerySession(req, supabase);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { accessCode } = session;

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

    if (!session.isShare) {
      return res.status(200).json({
        config:  client,
        scenes:  scenes || [],
        files:   files  || [],
        session: publicSession(session),
      });
    }

    const config = Object.fromEntries(
      Object.entries(client).filter(([k]) => !SHARE_HIDDEN_CONFIG_FIELDS.includes(k)),
    );

    return res.status(200).json({
      config,
      scenes:  stripForShare(scenes),
      files:   stripForShare(files),
      session: publicSession(session),
    });

  } catch (err) {
    console.error('gallery-config error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
