import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ─── Public URL helper ─────────────────────────────────────────────────────────
export function getPickPhotoUrl(storagePath) {
  const base = import.meta.env.VITE_SUPABASE_URL
  return `${base}/storage/v1/object/public/pick-previews/${storagePath}`
}

// ─── Fetch a single gallery + its photos + current selections ─────────────────
export function usePickGallery(galleryId) {
  const [gallery, setGallery]       = useState(null)
  const [photos, setPhotos]         = useState([])
  const [selections, setSelections] = useState([])
  const [submittedAt, setSubmittedAt] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  const load = useCallback(async () => {
    if (!galleryId) return
    setLoading(true)
    setError(null)

    const { data: g, error: gErr } = await supabase
      .from('pick_galleries')
      .select('*')
      .eq('id', galleryId)
      .single()

    if (gErr || !g) {
      setError('Gallery not found.')
      setLoading(false)
      return
    }
    setGallery(g)

    const { data: p } = await supabase
      .from('pick_photos')
      .select('*')
      .eq('gallery_id', galleryId)
      .order('order_index', { ascending: true })
    setPhotos(p || [])

    const { data: s } = await supabase
      .from('pick_selections')
      .select('*')
      .eq('gallery_id', galleryId)
    setSelections(s || [])

    const { data: sub } = await supabase
      .from('pick_submissions')
      .select('submitted_at')
      .eq('gallery_id', galleryId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single()
    setSubmittedAt(sub?.submitted_at || null)

    setLoading(false)
  }, [galleryId])

  useEffect(() => { load() }, [load])

  return { gallery, photos, selections, submittedAt, loading, error, reload: load }
}

// ─── Submit client selections ─────────────────────────────────────────────────
export async function submitPickSelections(galleryId, selectionsMap) {
  // selectionsMap: Map<photoId, comment>

  // Replace all existing selections atomically
  await supabase.from('pick_selections').delete().eq('gallery_id', galleryId)

  const rows = Array.from(selectionsMap).map(([photoId, comment]) => ({
    gallery_id: galleryId,
    photo_id:   photoId,
    comment:    comment || '',
  }))

  if (rows.length > 0) {
    const { error } = await supabase.from('pick_selections').insert(rows)
    if (error) return { error: error.message }
  }

  const { error: subErr } = await supabase
    .from('pick_submissions')
    .insert({ gallery_id: galleryId })
  if (subErr) return { error: subErr.message }

  return { error: null }
}

// ─── Admin: fetch all galleries with counts ───────────────────────────────────
export function useAllPickGalleries() {
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading]     = useState(true)

  const load = useCallback(async () => {
    setLoading(true)

    const { data } = await supabase
      .from('pick_galleries')
      .select('*')
      .order('created_at', { ascending: false })

    if (!data) { setLoading(false); return }

    // Enrich each gallery with photo_count, selection_count, submitted_at
    const enriched = await Promise.all(
      data.map(async (g) => {
        const [{ count: photoCount }, { count: selCount }, { data: sub }] = await Promise.all([
          supabase.from('pick_photos').select('*', { count: 'exact', head: true }).eq('gallery_id', g.id),
          supabase.from('pick_selections').select('*', { count: 'exact', head: true }).eq('gallery_id', g.id),
          supabase.from('pick_submissions').select('submitted_at').eq('gallery_id', g.id)
            .order('submitted_at', { ascending: false }).limit(1).single(),
        ])
        return {
          ...g,
          photo_count:     photoCount || 0,
          selection_count: selCount   || 0,
          submitted_at:    sub?.submitted_at || null,
        }
      })
    )

    setGalleries(enriched)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return { galleries, loading, reload: load }
}

// ─── Admin: create gallery ────────────────────────────────────────────────────
export async function createPickGallery({ name, clientName, clientEmail, maxSelections }) {
  const { data, error } = await supabase
    .from('pick_galleries')
    .insert({
      name,
      client_name:    clientName  || '',
      client_email:   clientEmail || '',
      max_selections: maxSelections || 0,
    })
    .select()
    .single()
  return { data, error }
}

// ─── Admin: delete gallery + photos from storage ──────────────────────────────
export async function deletePickGallery(galleryId, photos) {
  // Remove storage files
  if (photos.length > 0) {
    const paths = photos.map(p => p.storage_path)
    await supabase.storage.from('pick-previews').remove(paths)
  }
  await supabase.from('pick_galleries').delete().eq('id', galleryId)
}

// ─── Admin: fetch selections for one gallery (with photo details) ─────────────
export async function getGallerySelections(galleryId) {
  const { data, error } = await supabase
    .from('pick_selections')
    .select('*, pick_photos(storage_path, order_index, lr_photo_id)')
    .eq('gallery_id', galleryId)
    .order('created_at', { ascending: true })
  return { data: data || [], error }
}
