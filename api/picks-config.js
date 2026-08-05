import { createClient } from "@supabase/supabase-js";
import { applyCors } from "./_lib/cors.js";
import { rateLimit } from "./_lib/rateLimit.js";
import { requireEnv } from "./_lib/requireEnv.js";
import { logError } from "./_lib/logger.js";

requireEnv("SUPABASE_URL", "SUPABASE_SERVICE_KEY");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  applyCors(req, res, { methods: "GET, OPTIONS" });

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")    return res.status(405).json({ error: "Method not allowed" });

  const rl = rateLimit(req, { max: 30, windowMs: 60_000 });
  if (!rl.ok) {
    res.setHeader("Retry-After", rl.retryAfter);
    return res.status(429).json({ error: "Too many requests" });
  }

  const { galleryId } = req.query;
  if (!galleryId || typeof galleryId !== "string") {
    return res.status(400).json({ error: "Missing galleryId" });
  }

  try {
    const [{ data: gallery, error: gErr }, { data: photos, error: pErr }] = await Promise.all([
      supabase
        .from("pick_galleries")
        .select("id, title, client_name, client_email, expires_at, status")
        .eq("id", galleryId)
        .single(),
      supabase
        .from("pick_photos")
        .select("id, url, filename, order_index")
        .eq("gallery_id", galleryId)
        .order("order_index", { ascending: true }),
    ]);

    if (gErr || !gallery) return res.status(404).json({ error: "Gallery not found" });
    if (pErr) throw pErr;

    if (gallery.expires_at && new Date(gallery.expires_at) < new Date()) {
      return res.status(410).json({ error: "Gallery has expired" });
    }

    return res.status(200).json({ gallery, photos: photos || [] });
  } catch (err) {
    const id = logError("picks-config", err);
    return res.status(500).json({ error: "An error occurred", ref: id });
  }
}
