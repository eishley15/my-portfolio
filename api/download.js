import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl         = process.env.SUPABASE_URL;
const supabaseServiceKey  = process.env.SUPABASE_SERVICE_KEY;
const downloadTokenSecret = process.env.DOWNLOAD_TOKEN_SECRET;
const trueNasBaseUrl      = process.env.TRUENAS_DOWNLOAD_BASE;
const corsOrigin          = process.env.CORS_ORIGIN || 'https://kylepayawal.studio';

function verifyGalleryToken(req) {
  const auth  = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, downloadTokenSecret);
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

  try {
    const { fileName, galleryId, accessCode: qAccessCode } = req.query;

    if (!fileName || !galleryId) {
      return res.status(400).json({ error: 'Missing fileName or galleryId' });
    }

    let accessCode;
    const tokenPayload = verifyGalleryToken(req);

    if (tokenPayload) {
      // New path: gallery JWT in Authorization header
      accessCode = tokenPayload.accessCode;
    } else if (qAccessCode) {
      // Legacy path: accessCode in query param — verify against DB
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
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

    // Sign a short-lived download token for TrueNAS
    const dlToken = jwt.sign(
      { galleryId, fileName, accessCode },
      downloadTokenSecret,
      { expiresIn: '15m' }
    );

    return res.status(200).json({
      url: `${trueNasBaseUrl}/dl/${galleryId}/${fileName}?token=${dlToken}`,
    });

  } catch (err) {
    console.error('download error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
