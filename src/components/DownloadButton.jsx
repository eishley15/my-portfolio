import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function DownloadButton({ accessCode, galleryId, fileName }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);

      // Call the download API endpoint
      const response = await fetch(
        `/api/download?accessCode=${encodeURIComponent(accessCode)}&galleryId=${encodeURIComponent(galleryId)}&fileName=${encodeURIComponent(fileName)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const statusMessage =
          response.status === 400
            ? "Missing required parameters."
            : response.status === 403
              ? "Invalid access code."
              : "Failed to get download link.";

        toast.error(errorData.error || statusMessage);
        return;
      }

      // Get the download URL and trigger download
      const { url } = await response.json();
      window.location.href = url;

      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("An error occurred during download");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a1a1a] rounded transition-colors duration-200 hover:bg-[#8B2020] disabled:opacity-50 disabled:cursor-not-allowed"
      title={loading ? "Downloading..." : "Download file"}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      {loading ? "Downloading..." : "Download"}
    </button>
  );
}
