import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl        = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const jwtSecret          = process.env.DOWNLOAD_TOKEN_SECRET;
const corsOrigin         = process.env.CORS_ORIGIN || 'https://kylepayawal.studio';

// In-memory rate limiter: 10 attempts per IP per 60s window
const rateLimitMap = new Map();
const RATE_LIMIT   = 10;
const WINDOW_MS    = 60 * 1000;

function checkRateLimit(ip) {
  const now   = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, windowStart: now };

  if (now - entry.windowStart > WINDOW_MS) {
    entry.count       = 1;
    entry.windowStart = now;
  } else {
    entry.count += 1;
  }

  rateLimitMap.set(ip, entry);
  return entry.count > RATE_LIMIT;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const ip      = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  const isLocal = ip === '::1' || ip === '127.0.0.1' || ip === 'unknown';

  if (!isLocal && checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many attempts. Try again in a minute.' });
  }

  try {
    const { accessCode } = req.body;

    if (!accessCode || typeof accessCode !== 'string') {
      return res.status(401).json({ error: 'Access code not found.' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('clients')
      .select('access_code, is_active, expires_at')
      .eq('access_code', accessCode.trim().toLowerCase())
      .single();

    // Generic error on all failure modes — do not reveal which check failed
    if (error || !data || !data.is_active) {
      return res.status(401).json({ error: 'Access code not found.' });
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Access code not found.' });
    }

    const token = jwt.sign(
      { accessCode: data.access_code },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({ token });

  } catch (err) {
    console.error('gallery-auth error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
