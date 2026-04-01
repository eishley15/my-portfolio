import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Download,
  Lock,
  Play,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useClientGallery } from "../hooks/usePortfolio";
import { useToast, ToastContainer } from "../components/Toast";
import DownloadButton from "../components/DownloadButton";
import JSZip from "jszip";

// Custom navbar for accessed gallery (light background styling like About page)
function GalleryNavbar({ onLogout, previewOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: previewOpen ? 40 : 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "22px 40px",
        background: scrolled ? "rgba(240,235,224,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        transition:
          "background 0.4s ease, backdrop-filter 0.4s ease, color 0.4s ease",
        borderBottom: scrolled ? "0.5px solid rgba(14,12,11,0.06)" : "none",
        pointerEvents: previewOpen ? "none" : "auto",
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "15px",
          letterSpacing: "3.5px",
          color: "var(--black)",
          textDecoration: "none",
          transition: "color 0.4s ease",
        }}
      >
        KYLE PAYAWAL
      </Link>

      {/* Desktop nav */}
      <div
        style={{
          display: !isMobile ? "flex" : "none",
          gap: "36px",
          alignItems: "center",
        }}
      >
        <Link to="/" className="nav-link" style={{ color: "var(--black)" }}>
          Home
        </Link>
        <Link to="/work" className="nav-link" style={{ color: "var(--black)" }}>
          Work
        </Link>
        <Link
          to="/about"
          className="nav-link"
          style={{ color: "var(--black)" }}
        >
          About
        </Link>
        <Link
          to="/contact"
          className="nav-link"
          style={{ color: "var(--black)" }}
        >
          Contact
        </Link>
      </div>

      {/* Logout CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <button
          onClick={onLogout}
          style={{
            display: !isMobile ? "block" : "none",
            fontFamily: "var(--font-body)",
            fontSize: "10px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "var(--black)",
            textDecoration: "none",
            border: "0.5px solid rgba(14,12,11,0.25)",
            padding: "9px 18px",
            background: "transparent",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--red)";
            e.target.style.borderColor = "var(--red)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.borderColor = "rgba(14,12,11,0.25)";
          }}
        >
          Logout
        </button>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            color: "var(--black)",
            cursor: "pointer",
            display: isMobile ? "block" : "none",
            transition: "color 0.4s ease",
          }}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>
  );
}

// Lazy load image component
function LazyImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { rootMargin: "50px" },
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      onLoad={() => setLoaded(true)}
      style={{ opacity: loaded ? 1 : 0.5, transition: "opacity 0.3s" }}
    />
  );
}

// Preview modal component
function PreviewModal({ item, allItems, onClose, onNext, onPrev, isVideo }) {
  // Detect if the item is a video by checking file extension
  const isVideoItem = () => {
    if (isVideo) return true; // If explicitly passed, use it
    if (!item.url) return false;
    const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "mkv"];
    const url = item.url.toLowerCase();
    return videoExtensions.some((ext) => url.includes(`.${ext}`));
  };

  const videoCheck = isVideoItem();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!item) return null;

  const currentIndex = allItems.findIndex((i) => i.id === item.id);
  const hasNext = currentIndex < allItems.length - 1;
  const hasPrev = currentIndex > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-[var(--black)] z-50 flex items-center justify-center"
      style={{ backdropFilter: "blur(4px)" }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-50 text-white hover:text-[var(--red)] transition-colors"
        aria-label="Close preview"
      >
        <X size={32} />
      </button>

      {/* Content container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-full flex items-center justify-center p-8"
      >
        {/* Media */}
        <div className="w-full h-full max-w-5xl max-h-screen flex items-center justify-center relative">
          {videoCheck ? (
            <video
              src={item.url}
              controls
              autoPlay
              className="w-full h-auto max-h-screen object-contain"
            />
          ) : (
            <img
              src={item.url}
              alt={item.filename}
              className="w-full h-auto max-h-screen object-contain"
            />
          )}
        </div>

        {/* Navigation buttons - positioned outside media */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-40 pl-4">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="text-white hover:text-[var(--red)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous item"
          >
            <ChevronLeft size={48} />
          </button>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-40 pr-4">
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="text-white hover:text-[var(--red)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next item"
          >
            <ChevronRight size={48} />
          </button>
        </div>

        {/* Item counter */}
        <div className="absolute bottom-8 left-8 text-white text-sm">
          {currentIndex + 1} / {allItems.length}
        </div>
      </div>
    </motion.div>
  );
}

export default function Gallery() {
  const [accessCode, setAccessCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [client, setClient] = useState(null);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [videoModal, setVideoModal] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [previewType, setPreviewType] = useState(null); // 'photo' or 'video'
  const [downloading, setDownloading] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  // Call hook unconditionally at top level
  const { photos, videos, loading } = useClientGallery(
    client?.access_code || null,
  );

  // Disable scroll when preview is open
  useEffect(() => {
    if (previewItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [previewItem]);

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
      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        cache: "no-store",
      });
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

  const handleDownloadAll = async () => {
    if (!client) return;
    setDownloading(true);

    try {
      const zip = new JSZip();
      const allFiles = [...photos, ...videos];

      // Fetch all files and add to zip
      for (let i = 0; i < allFiles.length; i++) {
        const file = allFiles[i];
        try {
          const response = await fetch(file.url, {
            method: "GET",
            mode: "cors",
            cache: "no-store",
          });

          if (!response.ok) {
            console.error(`Failed to fetch ${file.url}: ${response.status}`);
            continue;
          }

          const blob = await response.blob();

          // Ensure we have a valid blob with content
          if (blob.size === 0) {
            console.error(`Empty blob for ${file.url}`);
            continue;
          }

          // Get file extension from URL or use default
          const urlParts = file.url.split(".");
          const extension = urlParts[urlParts.length - 1].split("?")[0];
          const filename =
            file.filename || file.name || `file-${i + 1}.${extension}`;

          zip.file(filename, blob);
          console.log(`Added ${filename} (${blob.size} bytes)`);
        } catch (err) {
          console.error(`Failed to download ${file.url}:`, err);
        }
      }

      // Check if zip has any files
      const fileCount = Object.keys(zip.files).length;
      if (fileCount === 0) {
        alert(
          "No files could be added to the ZIP. Please check console for errors.",
        );
        setDownloading(false);
        return;
      }

      console.log(`Generating ZIP with ${fileCount} files...`);

      // Generate and download zip
      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      console.log(`ZIP generated: ${content.size} bytes`);

      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = `${client.client_name.replace(/\s+/g, "-").toLowerCase()}-gallery.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error("ZIP creation failed:", err);
      alert("Failed to create ZIP file. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadSelected = async () => {
    if (!client || selectedItems.length === 0) return;
    setDownloading(true);

    try {
      const zip = new JSZip();
      const selectedFiles = [...photos, ...videos].filter((file) =>
        selectedItems.includes(file.id),
      );

      // Fetch selected files and add to zip
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        try {
          const response = await fetch(file.url, {
            method: "GET",
            mode: "cors",
            cache: "no-store",
          });

          if (!response.ok) {
            console.error(`Failed to fetch ${file.url}: ${response.status}`);
            continue;
          }

          const blob = await response.blob();

          // Ensure we have a valid blob with content
          if (blob.size === 0) {
            console.error(`Empty blob for ${file.url}`);
            continue;
          }

          // Get file extension from URL or use default
          const urlParts = file.url.split(".");
          const extension = urlParts[urlParts.length - 1].split("?")[0];
          const filename =
            file.filename || file.name || `file-${i + 1}.${extension}`;

          zip.file(filename, blob);
          console.log(`Added ${filename} (${blob.size} bytes)`);
        } catch (err) {
          console.error(`Failed to download ${file.url}:`, err);
        }
      }

      // Check if zip has any files
      const fileCount = Object.keys(zip.files).length;
      if (fileCount === 0) {
        alert(
          "No files could be added to the ZIP. Please check console for errors.",
        );
        setDownloading(false);
        return;
      }

      console.log(`Generating ZIP with ${fileCount} files...`);

      // Generate and download zip
      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      console.log(`ZIP generated: ${content.size} bytes`);

      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = `${client.client_name.replace(/\s+/g, "-").toLowerCase()}-selected.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error("ZIP creation failed:", err);
      alert("Failed to create ZIP file. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const openPreview = (item, type) => {
    setPreviewItem(item);
    setPreviewType(type);
  };

  const closePreview = () => {
    setPreviewItem(null);
    setPreviewType(null);
  };

  const goToNextPreview = () => {
    if (!previewItem) return;

    const allItems = previewType === "photo" ? photos : videos;
    const currentIndex = allItems.findIndex((i) => i.id === previewItem.id);

    if (currentIndex < allItems.length - 1) {
      setPreviewItem(allItems[currentIndex + 1]);
    }
  };

  const goToPrevPreview = () => {
    if (!previewItem) return;

    const allItems = previewType === "photo" ? photos : videos;
    const currentIndex = allItems.findIndex((i) => i.id === previewItem.id);

    if (currentIndex > 0) {
      setPreviewItem(allItems[currentIndex - 1]);
    }
  };

  if (client) {
    return (
      <>
        <GalleryNavbar
          onLogout={() => setClient(null)}
          previewOpen={!!previewItem}
        />
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
                <span>{client.event_type}</span>
              </div>
              <div className="flex gap-8 mt-4 text-xs">
                <span>{photos.length} Photos</span>
                <span>{videos.length} Videos</span>
              </div>
            </div>

            <div className="sticky top-20 z-20 bg-[var(--off-white)] py-4 mb-8 flex gap-4 border-b border-[var(--gray-light)]/20">
              <button
                onClick={handleDownloadAll}
                disabled={downloading}
                className="px-6 py-3 bg-[var(--red)] text-[var(--off-white)] text-[11px] uppercase tracking-[2px] hover:bg-[var(--red-hover)] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                {downloading ? "Creating ZIP..." : "Download All (ZIP)"}
              </button>
              {selectedItems.length > 0 && (
                <button
                  onClick={handleDownloadSelected}
                  disabled={downloading}
                  className="px-6 py-3 bg-transparent text-[var(--black)] text-[11px] uppercase tracking-[2px] hover:bg-[var(--black)] hover:text-[var(--off-white)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ border: "0.5px solid var(--black)" }}
                >
                  <Download size={16} />
                  {downloading
                    ? "Creating ZIP..."
                    : `Download Selected (${selectedItems.length})`}
                </button>
              )}
            </div>

            <div className="mb-16">
              <div className="eyebrow mb-6">PHOTOS</div>
              {loading ? (
                <div className="text-center py-20">Loading...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="aspect-square bg-[var(--gray-dark)] relative group overflow-hidden cursor-pointer"
                      onClick={() => openPreview(photo, "photo")}
                    >
                      <LazyImage
                        src={photo.url}
                        alt={photo.filename}
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0 bg-[var(--black)] opacity-0 group-hover:opacity-90 transition-opacity flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DownloadButton
                          galleryId={client.id}
                          fileName={
                            photo.filename || photo.name || `photo-${photo.id}`
                          }
                          onError={(message) => addToast(message, "error")}
                        />
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(photo.id)}
                        onChange={() => toggleSelect(photo.id)}
                        className="absolute top-2 right-2 w-5 h-5 z-10"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="eyebrow mb-6">VIDEOS</div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="aspect-square bg-[var(--gray-dark)] relative group overflow-hidden cursor-pointer"
                    onClick={() => openPreview(video, "video")}
                  >
                    <video
                      src={video.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div
                      className="absolute inset-0 bg-[var(--black)] opacity-0 group-hover:opacity-90 transition-opacity flex items-center justify-center gap-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreview(video, "video");
                        }}
                        className="px-4 py-2 bg-[var(--off-white)] text-[var(--black)] text-[10px] uppercase tracking-[2px] flex items-center gap-2"
                      >
                        <Play size={14} />
                        Play
                      </button>
                      <DownloadButton
                        galleryId={client.id}
                        fileName={
                          video.filename || video.name || `video-${video.id}`
                        }
                        onError={(message) => addToast(message, "error")}
                      />
                    </div>
                  </div>
                ))}
              </div>
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

          {/* Preview Modal */}
          {previewItem && (
            <PreviewModal
              item={previewItem}
              allItems={previewType === "photo" ? photos : videos}
              onClose={closePreview}
              onNext={goToNextPreview}
              onPrev={goToPrevPreview}
              isVideo={previewType === "video"}
            />
          )}

          <ToastContainer toasts={toasts} removeToast={removeToast} />
        </motion.div>
      </>
    );
  }

  return (
    <>
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
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
