import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function DownloadButton({
  galleryId,
  fileName,
  className = "",
  onError,
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    try {
      // Get the current session with user's access token
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        onError?.("Not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      // Call the download API endpoint
      const response = await fetch(
        `/api/download?galleryId=${encodeURIComponent(galleryId)}&fileName=${encodeURIComponent(fileName)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const statusMessage =
          response.status === 401
            ? "Unauthorized. Please log in again."
            : response.status === 403
              ? "You do not have access to this gallery."
              : response.status === 404
                ? "File not found."
                : "Failed to get download link.";

        onError?.(errorData.error || statusMessage);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!data.url) {
        onError?.("Invalid download URL received.");
        setLoading(false);
        return;
      }

      // Trigger the browser download by navigating to the signed URL
      window.location.href = data.url;
    } catch (error) {
      console.error("Download error:", error);
      onError?.(
        error instanceof Error ? error.message : "Unexpected download error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`px-4 py-2 bg-[var(--off-white)] text-[var(--black)] text-[10px] uppercase tracking-[2px] flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 ${className}`}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Download size={14} />
      )}
      {loading ? "Downloading..." : "Download"}
    </button>
  );
}
