import { useState } from 'react';

export function useDownloadZip() {
  const [isZipping, setIsZipping] = useState(false);
  const [error, setError] = useState(null);

  const downloadZip = async ({ accessCode, files, clientName = 'gallery' }) => {
    if (!accessCode) {
      setError('Access code is required');
      return;
    }

    setIsZipping(true);
    setError(null);

    try {
      const payload = { accessCode };
      if (files && files.length > 0) {
        payload.files = files;
      }

      const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const { url } = await response.json();

      if (!url) {
        throw new Error('No download URL returned');
      }

      // Trigger client-side download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${clientName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      return { success: true, url };
    } catch (err) {
      console.error('ZIP download error:', err);
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
