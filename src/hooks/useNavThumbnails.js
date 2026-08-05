import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useFeaturedPortfolio } from './usePortfolio'

// Slot order must match NAV_CARDS order in CardNav.jsx
const NAV_SLOTS = ['home', 'work', 'about', 'gallery', 'inquire']

// ─── Read hook ────────────────────────────────────────────────────────────────
export function useNavThumbnails() {
  const [config, setConfig]   = useState(null)
  const [loading, setLoading] = useState(true)
  const { items: fallback }   = useFeaturedPortfolio(5)

  useEffect(() => {
    async function fetchConfig() {
      const { data, error } = await supabase
        .from('studio_config')
        .select('value')
        .eq('key', 'nav_thumbnails')
        .maybeSingle()

      if (!error && data) setConfig(data.value)
      setLoading(false)
    }
    fetchConfig()
  }, [])

  // Build thumbnails array in slot order.
  // If a slot has a saved URL, wrap it in {url} to match CardNav's expected shape.
  // Otherwise fall back to the corresponding featured portfolio item.
  const thumbnails = NAV_SLOTS.map((slot, i) => {
    if (config?.[slot]) return { url: config[slot] }
    return fallback[i] || null
  })

  return { thumbnails, config, loading }
}

// ─── Save helper (used in StudioAdmin) ───────────────────────────────────────
export async function saveNavThumbnails(slots) {
  const { error } = await supabase
    .from('studio_config')
    .upsert({ key: 'nav_thumbnails', value: slots }, { onConflict: 'key' })
  return { error }
}
