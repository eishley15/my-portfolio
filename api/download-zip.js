import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl         = process.env.SUPABASE_URL;
const supabaseServiceKey  = process.env.SUPABASE_SERVICE_KEY;
const downloadTokenSecret = process.env.DOWNLOAD_TOKEN_SECRET;
const trueNasZipBaseUrl   = process.env.TRUENAS_ZIP_BASE || 'https://cdn.kylepayawal.studio';
const corsOrigin          = process.env.CORS_ORIGIN || 'https://kylepayawal.studio';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { accessCode, files } = req.body;

    if (!accessCode) {
      return res.status(400).json({ error: 'Missing accessCode' });
    }

    // Verify accessCode exists in Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, client_name')
      .eq('access_code', accessCode)
      .single();

    if (clientError || !clientData) {
      return res.status(403).json({ error: 'Invalid access code' });
    }

    // If files array is provided, validate all files exist for this client
    let fileList = [];
    if (files && Array.isArray(files) && files.length > 0) {
      const { data: filesData, error: filesError } = await supabase
        .from('files')
        .select('filename')
        .eq('client_code', accessCode)
        .in('filename', files);

      if (filesError) {
        return res.status(500).json({ error: 'Failed to validate files' });
      }

      // Check if all requested files were found
      if (filesData.length !== files.length) {
        return res.status(400).json({ error: 'One or more files not found or unauthorized' });
      }

      fileList = filesData.map(f => f.filename);
    }

    // Sign JWT token (30 min expiry)
    const token = jwt.sign(
      { accessCode, files: fileList.length > 0 ? fileList : null },
      downloadTokenSecret,
      { expiresIn: '30m' }
    );

    // Build ZIP URL
    let zipUrl = `${trueNasZipBaseUrl}/zip/${accessCode}?token=${token}`;
    if (fileList.length > 0) {
      zipUrl += `&files=${encodeURIComponent(fileList.join(','))}`;
    }

    return res.status(200).json({ url: zipUrl });

  } catch (error) {
    console.error('ZIP download endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
