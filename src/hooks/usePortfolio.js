import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

// Client-side cache
const portfolioCache = {}
const categoriesCache = { data: null, fetched: false }

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

      const { data } = await supabase
        .from('portfolio')
        .select('category, url, type')
        .order('sort_order', { ascending: true })

      if (data) {
        const categoryMap = {}
        
        // Initialize categories and count items
        data.forEach(item => {
          if (!categoryMap[item.category]) {
            categoryMap[item.category] = {
              name: item.category,
              count: 0,
              firstItem: null,
              firstImage: null
            }
          }
          categoryMap[item.category].count += 1
          
          // Track first item and first image
          if (!categoryMap[item.category].firstItem) {
            categoryMap[item.category].firstItem = item.url
          }
          if (!categoryMap[item.category].firstImage && (item.type === 'image' || !item.type)) {
            categoryMap[item.category].firstImage = item.url
          }
        })
        
        // Set thumbnail to first image if available, otherwise first item
        const categoryList = Object.values(categoryMap)
          .map(cat => ({
            ...cat,
            thumbnail: cat.firstImage || cat.firstItem
          }))
          .filter(cat => cat.thumbnail)
          
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
        .order('created_at', { ascending: true })

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
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .order('sort_order', { ascending: true })

      if (!error && data) {
        // Group by category and take first item from each
        const categoryMap = {}
        data.forEach(item => {
          if (!categoryMap[item.category]) {
            categoryMap[item.category] = item
          }
        })
        
        // Convert to array and limit to specified number
        const categoryItems = Object.values(categoryMap).slice(0, limit)
        setItems(categoryItems)
      }
      setLoading(false)
    }
    fetch()
  }, [limit])

  return { items, loading }
}