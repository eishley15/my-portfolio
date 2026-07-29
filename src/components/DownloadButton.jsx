import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function DownloadButton({ accessCode, galleryId, fileName, onError, iconOnly = false }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      setLoading(true);

      const response = await fetch(
        `/api/download?accessCode=${encodeURIComponent(accessCode)}&galleryId=${encodeURIComponent(galleryId)}&fileName=${encodeURIComponent(fileName)}`,
        { method: "GET" },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const statusMessage =
          response.status === 400
            ? "Missing required parameters."
            : response.status === 403
              ? "Invalid access code."
              : "Failed to get download link.";

        const msg = errorData.error || statusMessage;
        if (onError) onError(msg);
        else toast.error(msg);
        return;
      }

      const { url } = await response.json();

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      const msg = "An error occurred during download";
      if (onError) onError(msg);
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (iconOnly) {
    return (
      <button
        onClick={handleDownload}
        disabled={loading}
        className="text-white hover:text-[var(--red)] transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed"
        title={loading ? "Preparing download..." : `Download ${fileName}`}
        aria-label={`Download ${fileName}`}
      >
        {loading ? (
          <Loader2 size={24} className="animate-spin" />
        ) : (
          <Download size={24} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a1a1a] rounded transition-colors duration-200 hover:bg-[#8B2020] disabled:opacity-50 disabled:cursor-not-allowed"
      title={loading ? "Preparing download..." : `Download ${fileName}`}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      {loading ? "Preparing..." : "Download"}
    </button>
  );
}
