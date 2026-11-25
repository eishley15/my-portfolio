import jwt from 'jsonwebtoken';
import { getSupabase } from './_lib/supabase.js';
import { resolveGallerySession, downloadDenial } from './_lib/gallerySession.js';

const corsOrigin = process.env.CORS_ORIGIN || 'https://kylepayawal.studio';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { fileName, accessCode: qAccessCode } = req.query;
    if (!fileName) return res.status(400).json({ error: 'Missing fileName' });

    const supabase = getSupabase();
    const session  = await resolveGallerySession(req, supabase);
    let accessCode;

    if (session) {
      const denial = downloadDenial(session);
      if (denial) return res.status(denial.status).json(denial.body);
      accessCode = session.accessCode;
    } else if (qAccessCode) {
      // Legacy path: accessCode in query param — verify against DB
      const { data, error } = await supabase
        .from('clients')
        .select('access_code')
        .eq('access_code', qAccessCode)
        .single();

      if (error || !data) return res.status(403).json({ error: 'Invalid access code' });
      accessCode = qAccessCode;
    } else {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // The file must belong to the caller's own gallery. galleryId is always the
    // caller's access code — never taken from the request.
    const { data: file } = await supabase
      .from('files')
      .select('filename')
      .eq('client_code', accessCode)
      .eq('filename', fileName)
      .maybeSingle();

    if (!file) return res.status(404).json({ error: 'File not found in this gallery' });

    const dlToken = jwt.sign(
      { galleryId: accessCode, fileName, accessCode },
      process.env.DOWNLOAD_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(200).json({
      url: `${process.env.TRUENAS_DOWNLOAD_BASE}/dl/${accessCode}/${fileName}?token=${dlToken}`,
    });

  } catch (err) {
    console.error('download error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
