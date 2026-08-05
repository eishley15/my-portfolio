import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl         = process.env.SUPABASE_URL;
const supabaseServiceKey  = process.env.SUPABASE_SERVICE_KEY;
const downloadTokenSecret = process.env.DOWNLOAD_TOKEN_SECRET;
const trueNasZipBaseUrl   = process.env.TRUENAS_ZIP_BASE || 'https://cdn.kylepayawal.studio';
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { files } = req.body;
    const supabase  = createClient(supabaseUrl, supabaseServiceKey);

    let accessCode;
    const tokenPayload = verifyGalleryToken(req);

    if (tokenPayload) {
      accessCode = tokenPayload.accessCode;
    } else if (req.body.accessCode) {
      // Legacy path
      const { data, error } = await supabase
        .from('clients')
        .select('access_code')
        .eq('access_code', req.body.accessCode)
        .single();

      if (error || !data) return res.status(403).json({ error: 'Invalid access code' });
      accessCode = req.body.accessCode;
    } else {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let fileList = [];

    if (files && Array.isArray(files) && files.length > 0) {
      const { data: filesData, error: filesError } = await supabase
        .from('files')
        .select('filename')
        .eq('client_code', accessCode)
        .in('filename', files);

      if (filesError) return res.status(500).json({ error: 'Failed to validate files' });

      if (filesData.length !== files.length) {
        return res.status(400).json({ error: 'One or more files not found or unauthorized' });
      }

      fileList = filesData.map((f) => f.filename);
    }

    const token = jwt.sign(
      { accessCode, files: fileList.length > 0 ? fileList : null },
      downloadTokenSecret,
      { expiresIn: '30m' }
    );

    let zipUrl = `${trueNasZipBaseUrl}/zip/${accessCode}?token=${token}`;
    if (fileList.length > 0) {
      zipUrl += `&files=${encodeURIComponent(fileList.join(','))}`;
    }

    return res.status(200).json({ url: zipUrl });

  } catch (err) {
    console.error('download-zip error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
