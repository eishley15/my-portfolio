-- ─── Thumbnail Configuration Migration ───────────────────────────────────────
-- Run this in your Supabase SQL editor.

-- 1. studio_config: generic key/value store for admin settings
create table if not exists public.studio_config (
  key   text primary key,
  value jsonb not null default '{}'
);

-- Allow public reads (nav thumbnails are shown to all visitors)
-- Writes are protected by the studio PIN gate at the application layer
alter table public.studio_config enable row level security;

create policy "Public read studio_config"
  on public.studio_config for select using (true);

create policy "Anon write studio_config"
  on public.studio_config for all using (true) with check (true);

-- 2. Add category cover flag to portfolio items
alter table public.portfolio
  add column if not exists is_category_cover boolean not null default false;

-- Seed: mark the first item per category as the cover so the fallback works immediately.
-- Skip this block if you prefer to set covers manually in the admin.
update public.portfolio p
set is_category_cover = true
where p.id in (
  select distinct on (category) id
  from public.portfolio
  order by category, sort_order asc
);
