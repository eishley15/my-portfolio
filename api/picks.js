import { createClient } from "@supabase/supabase-js";
import { applyCors, checkOrigin } from "./_lib/cors.js";
import { rateLimit } from "./_lib/rateLimit.js";
import { requireEnv } from "./_lib/requireEnv.js";
import { logError } from "./_lib/logger.js";

requireEnv("SUPABASE_URL", "SUPABASE_SERVICE_KEY");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  applyCors(req, res, { methods: "GET, POST, OPTIONS" });

  if (req.method === "OPTIONS") return res.status(200).end();

  // ── GET — fetch gallery config + photos (or public testimonials) ─────────────
  if (req.method === "GET") {
    const rl = rateLimit(req, { max: 30, windowMs: 60_000 });
    if (!rl.ok) {
      res.setHeader("Retry-After", rl.retryAfter);
      return res.status(429).json({ error: "Too many requests" });
    }

    // GET ?action=testimonials — public fetch of approved + show_on_home testimonials
    if (req.query.action === "testimonials") {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("id, client_name, event_type, quote, created_at")
          .eq("status", "approved")
          .eq("show_on_home", true)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return res.status(200).json({ testimonials: data || [] });
      } catch (err) {
        const id = logError("picks:testimonials:get", err);
        return res.status(500).json({ error: "An error occurred", ref: id });
      }
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
      const id = logError("picks:get", err);
      return res.status(500).json({ error: "An error occurred", ref: id });
    }
  }

  // ── POST — submit client selections ──────────────────────────────────────────
  if (req.method === "POST") {
    if (!checkOrigin(req)) return res.status(403).json({ error: "Forbidden" });

    const rl = rateLimit(req, { max: 10, windowMs: 60_000 });
    if (!rl.ok) {
      res.setHeader("Retry-After", rl.retryAfter);
      return res.status(429).json({ error: "Too many requests" });
    }

    const { galleryId, selections } = req.body || {};

    if (!galleryId || typeof galleryId !== "string") {
      return res.status(400).json({ error: "Missing galleryId" });
    }
    if (!Array.isArray(selections)) {
      return res.status(400).json({ error: "selections must be an array" });
    }

    try {
      const { data: gallery, error: gErr } = await supabase
        .from("pick_galleries")
        .select("id, expires_at, status")
        .eq("id", galleryId)
        .single();

      if (gErr || !gallery) return res.status(404).json({ error: "Gallery not found" });
      if (gallery.expires_at && new Date(gallery.expires_at) < new Date()) {
        return res.status(410).json({ error: "Gallery has expired" });
      }
      if (gallery.status === "submitted") {
        return res.status(409).json({ error: "Selections already submitted" });
      }

      // Verify all photo IDs belong to this gallery before writing
      if (selections.length > 0) {
        const { data: validPhotos } = await supabase
          .from("pick_photos")
          .select("id")
          .eq("gallery_id", galleryId)
          .in("id", selections.map((s) => s.photoId));

        const validIds = new Set((validPhotos || []).map((p) => p.id));
        const bad = selections.filter((s) => !validIds.has(s.photoId));
        if (bad.length > 0) {
          return res.status(403).json({ error: "One or more photos do not belong to this gallery" });
        }
      }

      await supabase.from("pick_selections").delete().eq("gallery_id", galleryId);

      if (selections.length > 0) {
        const rows = selections.map((s) => ({
          gallery_id: galleryId,
          photo_id:   s.photoId,
          comment:    typeof s.comment === "string" ? s.comment.slice(0, 500) : null,
        }));
        const { error: insErr } = await supabase.from("pick_selections").insert(rows);
        if (insErr) throw insErr;
      }

      await supabase
        .from("pick_galleries")
        .update({ status: "submitted", submitted_at: new Date().toISOString() })
        .eq("id", galleryId);

      return res.status(200).json({ ok: true });
    } catch (err) {
      const id = logError("picks:post", err);
      return res.status(500).json({ error: "An error occurred", ref: id });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
