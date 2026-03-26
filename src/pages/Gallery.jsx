import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Lock, Play, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useClientGallery } from "../hooks/usePortfolio";

export default function Gallery() {
  const [accessCode, setAccessCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [client, setClient] = useState(null);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [videoModal, setVideoModal] = useState(null);

  // Call hook unconditionally at top level
  const { photos, videos, loading } = useClientGallery(
    client?.access_code || null,
  );

  const handleLogin = async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("access_code", accessCode.trim().toLowerCase())
        .eq("is_active", true)
        .single();

      if (error || !data) {
        setError("Access code not found. Please check and try again.");
        return;
      }
      setClient(data);
    } catch (err) {
      setError("Access code not found. Please check and try again.");
    }
  };

  const handleDownload = async (url, filename) => {
    if (!client) return;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        alert("Failed to download file. Please try again.");
        return;
      }
      const blob = await response.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      // Use filename or extract from URL
      a.download = filename || url.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Please check the console for details.");
    }
  };

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  if (client) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-[var(--off-white)] text-[var(--black)] pt-24 pb-20 px-6"
      >
        <div className="max-w-[1800px] mx-auto">
          <div className="mb-12">
            <h1 className="font-display text-[clamp(48px,8vw,96px)] leading-[0.88] mb-4">
              {client.client_name}
            </h1>
            <div className="flex flex-wrap gap-6 text-sm text-[var(--gray-light)]">
              <span>{client.event_date}</span>
              <span>·</span>
              <span>{client.location}</span>
              <span>·</span>
              <span>{client.event_type}</span>
            </div>
            <div className="flex gap-8 mt-4 text-xs">
              <span>{photos.length} Photos</span>
              <span>{videos.length} Videos</span>
            </div>
          </div>

          <div className="sticky top-20 z-20 bg-[var(--off-white)] py-4 mb-8 flex gap-4 border-b border-[var(--gray-light)]/20">
            <button
              onClick={() =>
                alert(
                  "ZIP download — coming soon. Use individual downloads for now.",
                )
              }
              className="px-6 py-3 bg-[var(--red)] text-[var(--off-white)] text-[11px] uppercase tracking-[2px] hover:bg-[var(--red-dim)] transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Download All (ZIP)
            </button>
            {selectedItems.length > 0 && (
              <button
                onClick={() =>
                  alert(`Downloading ${selectedItems.length} selected items`)
                }
                className="px-6 py-3 bg-transparent text-[var(--black)] text-[11px] uppercase tracking-[2px] hover:bg-[var(--black)] hover:text-[var(--off-white)] transition-all flex items-center gap-2"
                style={{ border: "0.5px solid var(--black)" }}
              >
                <Download size={16} />
                Download Selected ({selectedItems.length})
              </button>
            )}
          </div>

          <div className="mb-16">
            <div className="eyebrow mb-6">PHOTOS</div>
            {loading ? (
              <div className="col-span-full text-center py-20">Loading...</div>
            ) : (
              photos.map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-square bg-[var(--gray-dark)] relative group overflow-hidden"
                >
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[var(--black)] opacity-0 group-hover:opacity-90 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() =>
                        handleDownload(
                          photo.url,
                          photo.filename || photo.name || `photo-${photo.id}`,
                        )
                      }
                      className="px-4 py-2 bg-[var(--off-white)] text-[var(--black)] text-[10px] uppercase tracking-[2px] flex items-center gap-2"
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(photo.id)}
                    onChange={() => toggleSelect(photo.id)}
                    className="absolute top-2 right-2 w-5 h-5 z-10"
                  />
                </div>
              ))
            )}
          </div>

          <div>
            <div className="eyebrow mb-6">VIDEOS</div>
            {videos.map((video) => (
              <div
                key={video.id}
                className="aspect-video bg-[var(--gray-dark)] relative group overflow-hidden"
              >
                <video
                  src={video.url}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 bg-[var(--black)] opacity-0 group-hover:opacity-90 transition-opacity flex items-center justify-center gap-4">
                  <button
                    onClick={() => setVideoModal(video)}
                    className="px-4 py-2 bg-[var(--off-white)] text-[var(--black)] text-[10px] uppercase tracking-[2px] flex items-center gap-2"
                  >
                    <Play size={14} />
                    Play
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(
                        video.url,
                        video.filename || video.name || `video-${video.id}`,
                      )
                    }
                    className="px-4 py-2 bg-[var(--off-white)] text-[var(--black)] text-[10px] uppercase tracking-[2px] flex items-center gap-2"
                  >
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {videoModal && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6"
            onClick={() => setVideoModal(null)}
          >
            <button
              onClick={() => setVideoModal(null)}
              className="absolute top-6 right-6 text-[var(--off-white)] hover:text-[var(--red)]"
            >
              <X size={32} />
            </button>
            <video
              controls
              src={videoModal.url}
              className="max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Video player */}
            </video>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      <div className="bg-[var(--black)] text-[var(--off-white)] pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="eyebrow text-[var(--red)] mb-6"
            >
              PRIVATE ACCESS
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-[clamp(48px,8vw,96px)] leading-[0.88] mb-6"
            >
              CLIENT GALLERY
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-[var(--text-muted)]"
            >
              Your photos and videos, delivered privately. Enter your unique
              access code to view and download your files.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--gray-dark)] p-8"
          >
            <div className="mb-6">
              <label className="block text-[10px] tracking-[2px] uppercase mb-2">
                Access Code
              </label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="santos-wedding-2024"
                className="w-full px-4 py-3 bg-[var(--black)] text-[var(--off-white)] font-mono text-sm"
                style={{ border: "0.5px solid var(--off-white)" }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-[10px] tracking-[2px] uppercase mb-2">
                Your Name (optional)
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Juan Santos"
                className="w-full px-4 py-3 bg-[var(--black)] text-[var(--off-white)] text-sm"
                style={{ border: "0.5px solid var(--off-white)" }}
              />
            </div>

            {error && (
              <div className="mb-4 text-[var(--red)] text-sm">{error}</div>
            )}

            <button
              onClick={handleLogin}
              className="w-full px-6 py-4 bg-[var(--off-white)] text-[var(--black)] text-[11px] uppercase tracking-[2px] hover:bg-[var(--red)] hover:text-[var(--off-white)] transition-all"
            >
              Access My Gallery
            </button>

            <p className="text-xs text-[var(--gray-light)] mt-4 text-center">
              Your access code was sent via email after your session.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
