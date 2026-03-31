import jwt from 'jsonwebtoken';

const downloadTokenSecret = process.env.DOWNLOAD_TOKEN_SECRET;

export default function handler(req, res) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Read token from X-Token header
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    // 2. Verify JWT with secret
    jwt.verify(token, downloadTokenSecret);

    // 3. If valid, return 200 ok
    return res.status(200).json({ ok: true });
  } catch (error) {
    // Invalid or expired token
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
