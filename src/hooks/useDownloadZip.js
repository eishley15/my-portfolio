import { useState } from 'react';
import { authHeaders } from '../lib/galleryAuth';
import { GalleryDownloadError } from '../lib/gallerySession';

// Requests a signed ZIP URL for the current gallery session and starts the
// browser download. The gallery is identified by the session token, never by
// an access code from the client.
//
// Throws GalleryDownloadError for `pin_required` / `role_forbidden` so the
// caller's runDownload() can prompt for the PIN; other failures resolve to
// { success: false, error }.
export function useDownloadZip() {
  const [isZipping, setIsZipping] = useState(false);
  const [error, setError] = useState(null);

  const downloadZip = async ({ files, clientName = 'gallery' } = {}) => {
    setIsZipping(true);
    setError(null);

    try {
      const payload = {};
      if (files && files.length > 0) payload.files = files;

      const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.code === 'pin_required' || errorData.code === 'role_forbidden') {
          throw new GalleryDownloadError(errorData.error, errorData.code);
        }
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const { url } = await response.json();
      if (!url) throw new Error('No download URL returned');

      const a = document.createElement('a');
      a.href = url;
      a.download = `${clientName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      return { success: true, url };
    } catch (err) {
      if (err instanceof GalleryDownloadError) throw err;
      const errorMsg = err.message || 'Failed to download ZIP file';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsZipping(false);
    }
  };

  const clearError = () => setError(null);

  return { downloadZip, isZipping, error, clearError };
}
