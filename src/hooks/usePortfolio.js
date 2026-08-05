import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Client-side cache
const portfolioCache = {}
const categoriesCache = { data: null, fetched: false }
const featuredCache = { data: null, fetched: false }

export function usePortfolio(category = null) {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setItems([])

    async function fetchPortfolio() {
      const cacheKey = category || 'all'
      
      // Check cache first
      if (portfolioCache[cacheKey]) {
        setItems(portfolioCache[cacheKey])
        setLoading(false)
        return
      }

      let query = supabase
        .from('portfolio')
        .select('*')
        .order('sort_order', { ascending: true })

      if (category) query = query.eq('category', category)

      const { data, error } = await query
      if (!error) {
        setItems(data || [])
        portfolioCache[cacheKey] = data || []
      }
      setLoading(false)
    }

    async function fetchCategories() {
      // Check cache first
      if (categoriesCache.fetched) {
        setCategories(categoriesCache.data)
        return
      }

      // Only fetch category counts and metadata, not full portfolio
      const { data, error } = await supabase
        .from('portfolio')
        .select('category', { count: 'exact' })
        .order('sort_order', { ascending: true })

      if (!error && data) {
        const categoryMap = {}
        
        // Count items per category
        data.forEach(item => {
          if (!categoryMap[item.category]) {
            categoryMap[item.category] = {
              name: item.category,
              count: 0,
              thumbnail: null
            }
          }
          categoryMap[item.category].count += 1
        })
        
        const categoryList = Object.values(categoryMap)
        setCategories(categoryList)
        categoriesCache.data = categoryList
        categoriesCache.fetched = true
      }
    }

    fetchPortfolio()
    if (!category) fetchCategories()
  }, [category])

  return { items, categories, loading }
}

export function useClientGallery(accessCode) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accessCode) {
      setFiles([])
      setLoading(false)
      return
    }
    
    async function fetchFiles() {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('client_code', accessCode)
        .order('filename', { ascending: true })

      if (!error) setFiles(data || [])
      setLoading(false)
    }
    fetchFiles()
  }, [accessCode])

  const photos = files.filter(f => f.type === 'photo')
  const videos = files.filter(f => f.type === 'video')

  return { photos, videos, loading }
}

export function useFeaturedPortfolio(limit = 8) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      // Check cache first
      const cacheKey = `featured_${limit}`
      if (portfolioCache[cacheKey]) {
        setItems(portfolioCache[cacheKey])
        setLoading(false)
        return
      }

      // Fetch ALL items to ensure we get at least one from each category
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .order('sort_order', { ascending: true })

      if (!error && data) {
        // Group by category — prefer is_category_cover item, fallback to first by sort_order
        const categoryMap = {}
        data.forEach(item => {
          if (!categoryMap[item.category]) {
            // First item for this category — use as initial fallback
            categoryMap[item.category] = item
          } else if (item.is_category_cover) {
            // Explicit cover overrides the sort_order fallback
            categoryMap[item.category] = item
          }
        })
        
        // Convert to array and limit to specified number
        const categoryItems = Object.values(categoryMap).slice(0, limit)
        setItems(categoryItems)
        portfolioCache[cacheKey] = categoryItems
      }
      setLoading(false)
    }
    fetch()
  }, [limit])

  return { items, loading }
}

// ─── Categories with cover thumbnail ─────────────────────────────────────────
// Used by the Work page and StudioAdmin thumbnail manager.
// Prefers is_category_cover item per category; falls back to first by sort_order.
export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('portfolio')
      .select('id, category, url, is_category_cover, sort_order')
      .order('sort_order', { ascending: true })

    if (!error && data) {
      const categoryMap = {}

      data.forEach(item => {
        if (!categoryMap[item.category]) {
          categoryMap[item.category] = {
            name:         item.category,
            count:        0,
            thumbnailUrl: null,
            coverId:      null,
          }
        }
        const cat = categoryMap[item.category]
        cat.count += 1

        if (item.is_category_cover) {
          // Explicit cover wins regardless of sort_order
          cat.thumbnailUrl = item.url
          cat.coverId      = item.id
        } else if (!cat.thumbnailUrl) {
          // Fallback: first item by sort_order
          cat.thumbnailUrl = item.url
        }
      })

      setCategories(Object.values(categoryMap))
    }
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { categories, loading, refresh }
}

// ─── Clear featured cache (call after any cover change) ──────────────────────
export function clearFeaturedCache() {
  Object.keys(portfolioCache).forEach(key => {
    if (key.startsWith('featured_')) delete portfolioCache[key]
  })
}

// ─── Set category cover (StudioAdmin) ────────────────────────────────────────
// Routes through /api/admin-galleries (action=set-cover) so the service role key bypasses RLS.
export async function setCategoryThumbnail(category, itemId) {
  const token = sessionStorage.getItem('studio_token')

  const res = await fetch('/api/admin-galleries', {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ action: 'set-cover', category, itemId }),
  })

  const json = await res.json()

  // Bust the featured cache so the Home page reflects the change on next mount
  clearFeaturedCache()

  return { error: res.ok ? null : new Error(json.error || 'Failed to set cover') }
}