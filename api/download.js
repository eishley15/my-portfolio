import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const downloadTokenSecret = process.env.DOWNLOAD_TOKEN_SECRET;
const trueNasBaseUrl = process.env.TRUENAS_DOWNLOAD_BASE;
const corsOrigin = process.env.CORS_ORIGIN || 'https://your-domain.com';

export default async function handler(req, res) {
  // Set CORS header
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Extract and validate query parameters
    const { accessCode, galleryId, fileName } = req.query;

    if (!accessCode || !galleryId || !fileName) {
      return res.status(400).json({ error: 'Missing accessCode, galleryId, or fileName parameter' });
    }

    // 2. Initialize Supabase client and verify accessCode
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('access_code', accessCode)
      .single();

    if (clientError || !clientData) {
      return res.status(403).json({ error: 'Invalid access code' });
    }

    // 3. Sign JWT token with 15-minute expiry
    const jwtPayload = {
      galleryId,
      fileName,
      accessCode,
    };

    const signedToken = jwt.sign(jwtPayload, downloadTokenSecret, {
      expiresIn: '15m',
    });

    // 4. Return signed download URL
    const downloadUrl = `${trueNasBaseUrl}/dl/${galleryId}/${fileName}?token=${signedToken}`;

    return res.status(200).json({ url: downloadUrl });
  } catch (error) {
    console.error('Download endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
