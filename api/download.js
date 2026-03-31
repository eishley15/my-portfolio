import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const downloadTokenSecret = process.env.DOWNLOAD_TOKEN_SECRET;
const trueNasBaseUrl = process.env.TRUENAS_DOWNLOAD_BASE;
const corsOrigin = process.env.CORS_ORIGIN || 'https://your-domain.com';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Extract and validate Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix

    // 2. Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user with the provided token
    const { data: userData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !userData?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const userId = userData.user.id;

    // 3. Extract and validate query parameters
    const { galleryId, fileName } = req.query;

    if (!galleryId || !fileName) {
      return res.status(400).json({ error: 'Missing galleryId or fileName parameter' });
    }

    // 4. Check gallery access permissions
    const { data: accessData, error: accessError } = await supabase
      .from('gallery_access')
      .select('*')
      .eq('user_id', userId)
      .eq('gallery_id', galleryId)
      .single();

    if (accessError || !accessData) {
      return res.status(403).json({ error: 'Access denied to this gallery' });
    }

    // 5. Sign JWT token with 15-minute expiry
    const jwtPayload = {
      galleryId,
      fileName,
      userId,
    };

    const signedToken = jwt.sign(jwtPayload, downloadTokenSecret, {
      expiresIn: '15m',
    });

    // 6. Return signed download URL
    const downloadUrl = `${trueNasBaseUrl}/dl/${galleryId}/${fileName}?token=${signedToken}`;

    return res.status(200).json({ url: downloadUrl });
  } catch (error) {
    console.error('Download endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
