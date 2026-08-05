import { useState, useEffect, useCallback } from 'react';
import { authHeaders } from '../lib/galleryAuth';

export function useFavorites(addToast) {
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    async function hydrate() {
      try {
        const res = await fetch('/api/gallery-favorites', { headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        setFavorites(new Set((data.favorites || []).map((f) => f.file_id)));
      } catch {
        // Non-critical — silently fail
      }
    }
    hydrate();
  }, []);

  const toggle = useCallback(async (fileId) => {
    const wasFavorited = favorites.has(fileId);

    // Optimistic update
    setFavorites((prev) => {
      const next = new Set(prev);
      wasFavorited ? next.delete(fileId) : next.add(fileId);
      return next;
    });

    try {
      const res = await fetch('/api/gallery-favorites', {
        method:  wasFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body:    JSON.stringify({ fileId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert on failure
      setFavorites((prev) => {
        const next = new Set(prev);
        wasFavorited ? next.add(fileId) : next.delete(fileId);
        return next;
      });
      addToast?.('Could not save favorite. Try again.', 'error');
    }
  }, [favorites, addToast]);

  return { favorites, toggle };
}
