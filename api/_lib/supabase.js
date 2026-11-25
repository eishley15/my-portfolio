import { createClient } from "@supabase/supabase-js";

// Shared service-role client. Tests swap in an in-memory fake via setSupabaseForTests().
let cached   = null;
let override = null;

export function getSupabase() {
  if (override) return override;
  if (!cached) cached = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  return cached;
}

export function setSupabaseForTests(client) {
  override = client;
}
