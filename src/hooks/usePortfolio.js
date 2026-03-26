import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePortfolio(category = null) {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setItems([])

    async function fetchPortfolio() {
      let query = supabase
        .from('portfolio')
        .select('*')
        .order('sort_order', { ascending: true })

      if (category) query = query.eq('category', category)

      const { data, error } = await query
      if (!error) setItems(data || [])
      setLoading(false)
    }

    async function fetchCategories() {
      const { data } = await supabase
        .from('portfolio')
        .select('category, url')
        .order('sort_order', { ascending: true })

      if (data) {
        const categoryMap = {}
        data.forEach(item => {
          if (!categoryMap[item.category]) {
            categoryMap[item.category] = {
              name: item.category,
              count: 0,
              thumbnail: item.url,
              hasVideo: true
            }
          }
          categoryMap[item.category].count += 1
        })
        setCategories(Object.values(categoryMap))
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
        .order('created_at', { ascending: false })
        .limit(limit)

      if (!error) setItems(data || [])
      setLoading(false)
    }
    fetch()
  }, [limit])

  return { items, loading }
}