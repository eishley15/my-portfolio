import { useState, useEffect, useCallback, useRef } from 'react';
import { authHeaders } from '../lib/galleryAuth';

export function useFavorites(addToast) {
  const [favorites, setFavorites] = useState(new Set());

  // Latest values for the stable `toggle` below (lets memoised photo tiles skip re-renders)
  const favoritesRef = useRef(favorites);
  const toastRef     = useRef(addToast);
  useEffect(() => {
    favoritesRef.current = favorites;
    toastRef.current     = addToast;
  });

  useEffect(() => {
    async function hydrate() {
      try {
        const res = await fetch('/api/gallery-favorites', { headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        setFavorites(new Set((data.favorites || []).map((f) => f.file_id)));
      } catch {
        // Non-critical — the gallery still works without saved favorites
      }
    }
    hydrate();
  }, []);

  const toggle = useCallback(async (fileId) => {
    const wasFavorited = favoritesRef.current.has(fileId);
    const apply = (add) => setFavorites((prev) => {
      const next = new Set(prev);
      if (add) next.add(fileId); else next.delete(fileId);
      return next;
    });

    apply(!wasFavorited); // optimistic

    try {
      const res = await fetch('/api/gallery-favorites', {
        method:  wasFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body:    JSON.stringify({ fileId }),
      });
      if (!res.ok) throw new Error(`Favorite request failed (${res.status})`);
    } catch {
      apply(wasFavorited); // revert
      toastRef.current?.('Could not save favorite. Try again.', 'error');
    }
  }, []);

  return { favorites, toggle };
}
