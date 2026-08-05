const ALLOWED = [
  "https://kylepayawal.studio",
  "https://www.kylepayawal.studio",
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:5173"] : []),
];

export function applyCors(req, res, { methods = "GET,POST,OPTIONS" } = {}) {
  const origin = req.headers.origin;
  if (origin && ALLOWED.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// Returns false if a browser origin is present and not in the allowlist.
// Non-browser clients (curl, webhooks) have no Origin header — always pass.
export function checkOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  return ALLOWED.includes(origin);
}
