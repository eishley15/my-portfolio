// In-memory rate limiter — per-IP per-endpoint.
// Resets on cold start. Acceptable as a speed bump; use Vercel KV for strict correctness.
const buckets = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
}, 60_000).unref?.();

export function clientIp(req) {
  return (req.headers["x-forwarded-for"] || "").split(",")[0].trim()
    || req.socket?.remoteAddress
    || "unknown";
}

export function rateLimit(req, { max, windowMs, keyFn = clientIp } = {}) {
  const k     = `${keyFn(req)}:${req.url?.split("?")[0]}`;
  const now   = Date.now();
  const entry = buckets.get(k);

  if (!entry || now > entry.resetAt) {
    buckets.set(k, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }
  if (entry.count >= max) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count++;
  return { ok: true, remaining: max - entry.count };
}
