import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rateLimit } from "./_lib/rateLimit.js";
import { applyCors, checkOrigin } from "./_lib/cors.js";
import { requireEnv } from "./_lib/requireEnv.js";
import { logError } from "./_lib/logger.js";

requireEnv("STUDIO_PASSWORD_HASH", "STUDIO_TOKEN_SECRET");

export default async function handler(req, res) {
  applyCors(req, res, { methods: "POST, OPTIONS" });

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

  if (!checkOrigin(req)) return res.status(403).json({ error: "Forbidden" });

  const rl = rateLimit(req, { max: 5, windowMs: 15 * 60_000 });
  if (!rl.ok) {
    res.setHeader("Retry-After", rl.retryAfter);
    return res.status(429).json({ error: "Too many attempts. Please wait." });
  }

  try {
    const { password } = req.body || {};
    if (!password || typeof password !== "string") {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, process.env.STUDIO_PASSWORD_HASH);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { role: "studio" },
      process.env.STUDIO_TOKEN_SECRET,
      { expiresIn: "8h" }
    );

    return res.status(200).json({ token });
  } catch (err) {
    const id = logError("studio-auth", err);
    return res.status(500).json({ error: "An error occurred", ref: id });
  }
}
