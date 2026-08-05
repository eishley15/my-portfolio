import { useState, useEffect, useCallback } from 'react';
import { authHeaders, clearToken } from '../lib/galleryAuth';

export function useGalleryConfig() {
  const [config,  setConfig]  = useState(null);
  const [scenes,  setScenes]  = useState([]);
  const [files,   setFiles]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/gallery-config', { headers: authHeaders() });

      if (res.status === 410) { setExpired(true); setLoading(false); return; }
      if (res.status === 401) { clearToken(); setError('session_expired'); setLoading(false); return; }
      if (!res.ok) throw new Error('Failed to load gallery');

      const data = await res.json();
      setConfig(data.config);
      setScenes(data.scenes || []);
      setFiles(data.files   || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const photos = files.filter((f) => f.type === 'photo');
  const videos = files.filter((f) => f.type === 'video');

  return { config, scenes, files, photos, videos, loading, expired, error, refetch: load };
}
