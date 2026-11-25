import { useState, useEffect, useCallback, useMemo } from 'react';
import { authHeaders, clearToken } from '../lib/galleryAuth';

export function useGalleryConfig() {
  const [config,  setConfig]  = useState(null);
  const [scenes,  setScenes]  = useState([]);
  const [files,   setFiles]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [error,   setError]   = useState(null);
  // What this visitor may do. Missing (older API) means full owner access.
  const [session, setSession] = useState(null);

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
      setSession(data.session || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Memoised so downstream grids/lightbox lists keep stable identities
  const photos = useMemo(() => files.filter((f) => f.type === 'photo'), [files]);
  const videos = useMemo(() => files.filter((f) => f.type === 'video'), [files]);

  return { config, scenes, files, photos, videos, loading, expired, error, session, refetch: load };
}
