import { createClient } from "@supabase/supabase-js";
import { requireStudio } from "./_lib/requireStudio.js";
import { applyCors } from "./_lib/cors.js";
import { logError } from "./_lib/logger.js";

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

const ALLOWED_FIELDS = new Set([
  "client_name", "email", "gallery_title", "gallery_subtitle", "event_date",
  "cover_style", "cover_font", "cover_image_url", "cover_video_url", "cover_bg_color",
  "cover_text_color", "cover_accent_color", "cover_collage_urls",
  "gallery_bg_color", "gallery_text_color", "columns_count", "grid_gap",
  "section_header_style", "font_display", "photographer_mark_position",
  "slideshow_enabled", "slideshow_interval_ms", "slideshow_music_url",
  "downloads_enabled", "show_countdown", "expires_at", "is_active",
]);

const ALLOWED_SCENE_FIELDS = new Set(["name", "banner_image_url"]);

export default async function handler(req, res) {
  applyCors(req, res, { methods: "GET, POST, PUT, PATCH, DELETE, OPTIONS" });
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!requireStudio(req, res)) return;

  // ── POST — set-cover: swap category cover on portfolio table ─────────────────
  if (req.method === "POST") {
    const { action, category, itemId } = req.body ?? {};
    if (action !== "set-cover") return res.status(400).json({ error: "Unknown action" });
    if (!category || !itemId) return res.status(400).json({ error: "category and itemId are required" });

    const { error: clearError } = await sb
      .from("portfolio")
      .update({ is_category_cover: false })
      .eq("category", category)
      .eq("is_category_cover", true);
    if (clearError) { logError("admin-galleries:post:set-cover:clear", clearError); return res.status(500).json({ error: "Failed to clear existing cover" }); }

    const { error: setError } = await sb
      .from("portfolio")
      .update({ is_category_cover: true })
      .eq("id", itemId);
    if (setError) { logError("admin-galleries:post:set-cover:set", setError); return res.status(500).json({ error: "Failed to set new cover" }); }

    return res.status(200).json({ ok: true });
  }

  // ── GET ───────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    const { action, code } = req.query;

    // GET ?action=scenes&code=X → list scenes for a gallery
    if (action === "scenes") {
      if (!code) return res.status(400).json({ error: "code required" });
      const { data, error } = await sb
        .from("gallery_scenes")
        .select("id, name, slug, order_index, banner_image_url")
        .eq("client_code", code)
        .order("order_index");
      if (error) { logError("admin-galleries:scenes:get", error); return res.status(500).json({ error: "Failed to load scenes" }); }
      return res.json({ data: data || [] });
    }

    // GET ?action=files&code=X → all files for a gallery
    if (action === "files") {
      if (!code) return res.status(400).json({ error: "code required" });
      const { data, error } = await sb
        .from("files")
        .select("id, filename, url, type")
        .eq("client_code", code)
        .order("filename");
      if (error) { logError("admin-galleries:files:get", error); return res.status(500).json({ error: "Failed to load files" }); }
      return res.json({ data: data || [] });
    }

    // GET ?action=favorites&code=X → favorites with file info
    if (action === "favorites") {
      if (!code) return res.status(400).json({ error: "code required" });
      const { data, error } = await sb
        .from("gallery_favorites")
        .select("id, created_at, files(id, filename, url)")
        .eq("client_code", code)
        .order("created_at");
      if (error) { logError("admin-galleries:favorites:get", error); return res.status(500).json({ error: "Failed to load favorites" }); }
      const rows = (data || []).map((f) => ({
        id: f.id,
        created_at: f.created_at,
        filename: f.files?.filename,
        url: f.files?.url,
      }));
      return res.json({ data: rows });
    }

    // Default GET — list all client galleries
    const { data, error } = await sb
      .from("clients")
      .select(
        `access_code, client_name, email, event_date, is_active, expires_at,
         cover_style, cover_font, cover_collage_urls,
         gallery_bg_color, gallery_text_color, columns_count, grid_gap,
         slideshow_enabled, downloads_enabled, show_countdown,
         gallery_title, gallery_subtitle, cover_image_url, cover_video_url,
         cover_bg_color, cover_text_color, cover_accent_color, font_display,
         section_header_style, photographer_mark_position,
         slideshow_interval_ms, slideshow_music_url,
         gallery_scenes ( id ),
         files ( id )`,
      )
      .order("created_at", { ascending: false });

    if (error) { logError("admin-galleries:get", error); return res.status(500).json({ error: "Failed to load galleries" }); }

    const rows = (data || []).map(({ gallery_scenes, files, ...g }) => ({
      ...g,
      scene_count: gallery_scenes?.length ?? 0,
      file_count: files?.length ?? 0,
    }));
    return res.json({ data: rows });
  }

  // ── PUT — update client config fields ─────────────────────────────────────
  if (req.method === "PUT") {
    const { accessCode, fields } = req.body ?? {};
    if (!accessCode || !fields) {
      return res.status(400).json({ error: "accessCode and fields required" });
    }
    // Filter to allowed fields only; drop undefined values (unset optional fields)
    const safe = Object.fromEntries(
      Object.entries(fields).filter(([k, v]) => ALLOWED_FIELDS.has(k) && v !== undefined),
    );
    if (!Object.keys(safe).length) {
      return res.status(400).json({ error: "No valid fields to update" });
    }
    const { error } = await sb.from("clients").update(safe).eq("access_code", accessCode);
    if (error) { logError("admin-galleries:put", error); return res.status(500).json({ error: "Failed to update gallery" }); }
    return res.json({ ok: true });
  }

  // ── PATCH — scene update or reorder ──────────────────────────────────────
  if (req.method === "PATCH") {
    const { action, id, fields, code, ids } = req.body ?? {};

    if (action === "scene") {
      if (!id || !fields) return res.status(400).json({ error: "id and fields required" });
      const safe = Object.fromEntries(
        Object.entries(fields).filter(([k]) => ALLOWED_SCENE_FIELDS.has(k)),
      );
      if (!Object.keys(safe).length) return res.status(400).json({ error: "No valid scene fields" });
      const { error } = await sb.from("gallery_scenes").update(safe).eq("id", id);
      if (error) { logError("admin-galleries:patch:scene", error); return res.status(500).json({ error: "Failed to update scene" }); }
      return res.json({ ok: true });
    }

    if (action === "scene-reorder") {
      if (!code || !Array.isArray(ids)) return res.status(400).json({ error: "code and ids array required" });
      const results = await Promise.all(
        ids.map((sceneId, idx) =>
          sb.from("gallery_scenes").update({ order_index: idx }).eq("id", sceneId).eq("client_code", code),
        ),
      );
      const failed = results.find((r) => r.error);
      if (failed) { logError("admin-galleries:patch:reorder", failed.error); return res.status(500).json({ error: "Reorder failed" }); }
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: "Unknown action" });
  }

  // ── DELETE — remove a scene ───────────────────────────────────────────────
  if (req.method === "DELETE") {
    const { action, id } = req.body ?? {};
    if (action === "scene") {
      if (!id) return res.status(400).json({ error: "id required" });
      const { error } = await sb.from("gallery_scenes").delete().eq("id", id);
      if (error) { logError("admin-galleries:delete:scene", error); return res.status(500).json({ error: "Failed to delete scene" }); }
      return res.json({ ok: true });
    }
    return res.status(400).json({ error: "Unknown action" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
