import { createClient } from "@supabase/supabase-js";
import { requireStudio } from "./_lib/requireStudio.js";
import { applyCors } from "./_lib/cors.js";

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

// POST { category: string, itemId: string }
// Clears is_category_cover on all items in the category, then sets it on itemId.
export default async function handler(req, res) {
  applyCors(req, res, { methods: "POST, OPTIONS" });
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!requireStudio(req, res)) return;

  const { category, itemId } = req.body;
  if (!category || !itemId) {
    return res.status(400).json({ error: "category and itemId are required" });
  }

  // 1. Clear existing cover for this category
  const { error: clearError } = await sb
    .from("portfolio")
    .update({ is_category_cover: false })
    .eq("category", category)
    .eq("is_category_cover", true);

  if (clearError) {
    return res.status(500).json({ error: "Failed to clear existing cover", detail: clearError.message });
  }

  // 2. Set the new cover
  const { error: setError } = await sb
    .from("portfolio")
    .update({ is_category_cover: true })
    .eq("id", itemId);

  if (setError) {
    return res.status(500).json({ error: "Failed to set new cover", detail: setError.message });
  }

  return res.status(200).json({ ok: true });
}
