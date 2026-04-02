import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl         = process.env.SUPABASE_URL;
const supabaseServiceKey  = process.env.SUPABASE_SERVICE_KEY;
const downloadTokenSecret = process.env.DOWNLOAD_TOKEN_SECRET;
const trueNasBaseUrl      = process.env.TRUENAS_DOWNLOAD_BASE;
const corsOrigin          = process.env.CORS_ORIGIN || 'https://kylepayawal.studio';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { accessCode, galleryId, fileName } = req.query;

    if (!accessCode || !galleryId || !fileName) {
      return res.status(400).json({ error: 'Missing accessCode, galleryId, or fileName' });
    }

    // Verify accessCode exists in Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('access_code', accessCode)
      .single();

    if (clientError || !clientData) {
      return res.status(403).json({ error: 'Invalid access code' });
    }

    // Sign JWT (15 min expiry)
    const token = jwt.sign(
      { galleryId, fileName, accessCode },
      downloadTokenSecret,
      { expiresIn: '15m' }
    );

    // Return the signed download URL pointing to TrueNAS via dl subdomain
    return res.status(200).json({
      url: `${trueNasBaseUrl}/dl/${galleryId}/${fileName}?token=${token}`,
    });

  } catch (error) {
    console.error('Download endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}