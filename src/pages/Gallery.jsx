import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  Download,
  Play,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  Lock,
  Sparkles,
  LayoutGrid,
  List,
  Columns2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useClientGallery } from "../hooks/usePortfolio";
import { useToast, ToastContainer } from "../components/Toast";
import DownloadButton from "../components/DownloadButton";
import { useDownloadZip } from "../hooks/useDownloadZip";
import LazyImage from "../components/LazyImage";

// Custom navbar for accessed gallery
function GalleryNavbar({ onLogout, previewOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);

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
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 101,
          display: "flex",
          flexDirection: "column",
          background:
            menuOpen && isMobile
              ? "rgba(240,235,224,0.7)"
              : scrolled
                ? "rgba(240,235,224,0.95)"
                : "rgba(240,235,224,0.05)",
          backdropFilter: "blur(16px)",
          transition:
            "background 0.4s ease, backdrop-filter 0.4s ease, color 0.4s ease",
          borderBottom:
            scrolled || (menuOpen && isMobile)
              ? "0.5px solid rgba(14,12,11,0.08)"
              : "none",
          pointerEvents: previewOpen ? "none" : "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "22px 40px",
          }}
        >
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
            <Link
              to="/work"
              className="nav-link"
              style={{ color: "var(--black)" }}
            >
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
                border: "0.5px solid rgba(14,12,11,0.3)",
                padding: "9px 18px",
                background: "transparent",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "var(--red)";
                e.target.style.color = "var(--off-white)";
                e.target.style.borderColor = "var(--red)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "var(--black)";
                e.target.style.borderColor = "rgba(14,12,11,0.3)";
              }}
            >
              Logout
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: "none",
                border: "none",
                color: "var(--black)",
                cursor: "pointer",
                display: isMobile ? "block" : "none",
                zIndex: 102,
              }}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && (
          <div
            style={{
              maxHeight: menuOpen ? "400px" : "0",
              overflow: "hidden",
              transition: "opacity 0.3s ease",
              opacity: menuOpen ? 1 : 0,
              pointerEvents: menuOpen ? "auto" : "none",
              padding: menuOpen ? "0 40px 20px 40px" : "0 40px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <Link
                to="/"
                className="nav-link"
                style={{ color: "var(--black)", fontSize: "14px" }}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/work"
                className="nav-link"
                style={{ color: "var(--black)", fontSize: "14px" }}
                onClick={() => setMenuOpen(false)}
              >
                Work
              </Link>
              <Link
                to="/about"
                className="nav-link"
                style={{ color: "var(--black)", fontSize: "14px" }}
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="nav-link"
                style={{ color: "var(--black)", fontSize: "14px" }}
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "var(--black)",
                  border: "0.5px solid rgba(14,12,11,0.3)",
                  padding: "12px 18px",
                  background: "transparent",
                  cursor: "pointer",
                  marginTop: "10px",
                  width: "fit-content",
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

// Animated particles background
function ParticleField() {
  const particles = Array.from({ length: 30 });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[var(--red)] rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: Math.random() * 0.5 + 0.2,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            x: [null, Math.random() * window.innerWidth],
            opacity: [null, Math.random() * 0.5 + 0.2],
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// 3D Tilt Card Effect
function TiltCard({ children }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  
  const springConfig = { damping: 20, stiffness: 200 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
}

// Animated lock icon
function AnimatedLock() {
  return (
    <motion.div
      className="relative w-24 h-24 mx-auto mb-8"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", duration: 1, delay: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 bg-[var(--red)] rounded-full opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Lock size={40} className="text-[var(--red)]" />
      </div>
      <motion.div
        className="absolute -top-2 -right-2"
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Sparkles size={20} className="text-[var(--red)]" />
      </motion.div>
    </motion.div>
  );
}

// Lazy load image component

// Preview modal component
function PreviewModal({ item, allItems, onClose, onNext, onPrev, isVideo, selectedItems, toggleSelect, accessCode, onError }) {
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
      className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <div className="absolute top-6 right-6 z-[111] flex items-center gap-4">
        <input
          type="checkbox"
          checked={selectedItems.includes(item.id)}
          onChange={(e) => {
            e.stopPropagation();
            toggleSelect(item.id);
          }}
          className="w-6 h-6 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
        <div onClick={(e) => e.stopPropagation()}>
          <DownloadButton
            accessCode={accessCode}
            galleryId={accessCode}
            fileName={item.filename}
            onError={onError}
            iconOnly
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-white hover:text-[var(--red)] transition-colors p-2"
          aria-label="Close preview"
        >
          <X size={32} />
        </button>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-full flex items-center justify-center p-8"
      >
        <div className="w-full h-full max-w-5xl max-h-screen flex items-center justify-center relative">
          {isVideo ? (
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

        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-[111] pl-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            disabled={!hasPrev}
            className="text-white hover:text-[var(--red)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-2"
            aria-label="Previous item"
          >
            <ChevronLeft size={48} strokeWidth={1.5} />
          </button>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-[111] pr-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            disabled={!hasNext}
            className="text-white hover:text-[var(--red)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-2"
            aria-label="Next item"
          >
            <ChevronRight size={48} strokeWidth={1.5} />
          </button>
        </div>

        <div className="absolute bottom-8 left-8 text-white/70 text-sm font-body tracking-wide">
          {currentIndex + 1} / {allItems.length}
        </div>
      </div>
    </motion.div>
  );
}

// ─── GalleryGrid: renders photos + videos in masonry / grid / list layout ────
function GalleryGrid({
  photos,
  videos,
  layoutMode,
  selectedItems,
  toggleSelect,
  openPreview,
  imageOrientations,
  handleImageLoad,
  getGridSpan,
  accessCode,
  addToast,
}) {
  const gridClass =
    layoutMode === "masonry"
      ? "masonry-grid"
      : layoutMode === "grid"
        ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"
        : "flex flex-col";

  return (
    <div>
      {photos.length > 0 && (
        <div className="mb-12">
          <div className={layoutMode === "list" ? "eyebrow mb-2 px-4" : "eyebrow mb-6"}>PHOTOS</div>
          <div className={gridClass}>
            {photos.map((photo, i) =>
              layoutMode === "list" ? (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.015 }}
                  className={`flex items-center gap-4 py-3 px-4 border-b border-[var(--gray-light)]/20 cursor-pointer group hover:bg-[var(--gray-light)]/10 transition-all ${
                    selectedItems.includes(photo.id) ? "bg-[var(--red)]/5" : ""
                  }`}
                  onClick={() => openPreview(photo, "photo")}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(photo.id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelect(photo.id); }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 shrink-0"
                  />
                  <div className="w-16 h-10 shrink-0 bg-[var(--gray-dark)] overflow-hidden">
                    <LazyImage src={photo.url} alt={photo.filename} className="w-full h-full object-cover" onLoad={() => {}} />
                  </div>
                  <span className="text-[11px] text-[var(--gray-light)] tracking-[1px] font-body flex-1">
                    {String(i + 1).padStart(3, "0")}
                  </span>
                  <div onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DownloadButton accessCode={accessCode} galleryId={accessCode} fileName={photo.filename} onError={(msg) => addToast(msg, "error")} iconOnly />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={`bg-[var(--gray-dark)] relative group overflow-hidden cursor-pointer hover:brightness-110 transition-all ${
                    layoutMode === "grid" ? "aspect-square" : ""
                  } ${selectedItems.includes(photo.id) ? "ring-2 ring-[var(--red)]" : ""}`}
                  style={layoutMode === "masonry" ? {
                    gridColumn: imageOrientations[photo.id]?.isLandscape ? "span 2" : "span 1",
                    gridRow: getGridSpan(photo.id, i),
                  } : {}}
                  onClick={() => openPreview(photo, "photo")}
                >
                  <LazyImage
                    src={photo.url}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                    onLoad={(orientation) => handleImageLoad(photo.id, orientation)}
                  />
                  <div
                    className="absolute inset-0 bg-[var(--black)] opacity-0 group-hover:opacity-90 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={() => openPreview(photo, "photo")}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <DownloadButton accessCode={accessCode} galleryId={accessCode} fileName={photo.filename} onError={(msg) => addToast(msg, "error")} />
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(photo.id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelect(photo.id); }}
                    className="absolute top-2 right-2 w-5 h-5 z-10"
                    onClick={(e) => e.stopPropagation()}
                  />
                </motion.div>
              )
            )}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <div className={layoutMode === "list" ? "eyebrow mb-2 px-4" : "eyebrow mb-6"}>VIDEOS</div>
          <div className={gridClass}>
            {videos.map((video, i) =>
              layoutMode === "list" ? (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.015 }}
                  className={`flex items-center gap-4 py-3 px-4 border-b border-[var(--gray-light)]/20 cursor-pointer group hover:bg-[var(--gray-light)]/10 transition-all ${
                    selectedItems.includes(video.id) ? "bg-[var(--red)]/5" : ""
                  }`}
                  onClick={() => openPreview(video, "video")}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(video.id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelect(video.id); }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 shrink-0"
                  />
                  <div className="w-16 h-10 shrink-0 bg-[var(--gray-dark)] overflow-hidden relative flex items-center justify-center">
                    <video src={video.url} className="w-full h-full object-cover" muted />
                    <Play size={12} className="absolute text-white" />
                  </div>
                  <span className="text-[11px] text-[var(--gray-light)] tracking-[1px] font-body flex-1">
                    {String(i + 1).padStart(3, "0")}
                  </span>
                  <div onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DownloadButton accessCode={accessCode} galleryId={accessCode} fileName={video.filename} onError={(msg) => addToast(msg, "error")} iconOnly />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={`bg-[var(--gray-dark)] relative group overflow-hidden cursor-pointer hover:brightness-110 transition-all ${
                    layoutMode === "grid" ? "aspect-square" : ""
                  } ${selectedItems.includes(video.id) ? "ring-2 ring-[var(--red)]" : ""}`}
                  style={layoutMode === "masonry" ? { gridRow: i % 4 === 0 ? "span 2" : "span 1" } : {}}
                  onClick={() => openPreview(video, "video")}
                >
                  <video src={video.url} className="w-full h-full object-cover" muted />
                  <div
                    className="absolute inset-0 bg-[var(--black)] opacity-0 group-hover:opacity-90 transition-opacity flex items-center justify-center gap-4"
                    onClick={() => openPreview(video, "video")}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); openPreview(video, "video"); }}
                      className="px-4 py-2 bg-[var(--off-white)] text-[var(--black)] text-[10px] uppercase tracking-[2px] flex items-center gap-2"
                    >
                      <Play size={14} />
                      Play
                    </button>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DownloadButton accessCode={accessCode} galleryId={accessCode} fileName={video.filename} onError={(msg) => addToast(msg, "error")} />
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(video.id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelect(video.id); }}
                    className="absolute top-2 right-2 w-5 h-5 z-10"
                    onClick={(e) => e.stopPropagation()}
                  />
                </motion.div>
              )
            )}
          </div>
        </div>
      )}

      {photos.length === 0 && videos.length === 0 && (
        <div className="text-center py-20 text-[var(--gray-light)] text-sm">No media available.</div>
      )}
    </div>
  );
}

export default function Gallery() {
  const [accessCode, setAccessCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [client, setClient] = useState(null);
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [imageOrientations, setImageOrientations] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [layoutMode, setLayoutMode] = useState(() => localStorage.getItem("galleryLayout") || "masonry");
  const { toasts, addToast, removeToast } = useToast();
  const {
    downloadZip,
    isZipping,
    error: zipError,
    clearError,
  } = useDownloadZip();

  const { photos, videos, loading } = useClientGallery(
    client?.access_code || null,
  );

  const setLayout = (mode) => {
    setLayoutMode(mode);
    localStorage.setItem("galleryLayout", mode);
  };

  const handleImageLoad = (photoId, orientation) => {
    setImageOrientations(prev => ({ ...prev, [photoId]: orientation }));
  };

  const getGridSpan = (itemId, index) => {
    const orientation = imageOrientations[itemId];
    if (!orientation) return "span 1";
    
    if (orientation.isLandscape) {
      return "span 2";
    } else if (orientation.isPortrait) {
      return index % 3 === 0 ? "span 2" : "span 1";
    }
    return "span 1";
  };

  // Restore client session from localStorage on mount
  useEffect(() => {
    const storedClient = localStorage.getItem("galleryClient");
    if (storedClient) {
      try {
        setClient(JSON.parse(storedClient));
      } catch (err) {
        console.error("Failed to restore client session:", err);
        localStorage.removeItem("galleryClient");
      }
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = previewItem ? "hidden" : "unset";
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
      localStorage.setItem("galleryClient", JSON.stringify(data));
    } catch {
      setError("Access code not found. Please check and try again.");
    }
  };

  // Download all files as ZIP
  const handleDownloadAll = async () => {
    if (!client) return;
    const clientNameFormatted = client.client_name
      .replace(/\s+/g, "-")
      .toLowerCase();
    const result = await downloadZip({
      accessCode: client.access_code,
      clientName: clientNameFormatted,
    });
    if (result.success) {
      addToast("ZIP download started!", "success");
    } else if (result.error) {
      addToast(result.error, "error");
    }
  };

  // Download selected files as ZIP
  const handleDownloadSelected = async () => {
    if (!client || selectedItems.length === 0) return;

    // Convert selectedItems (IDs) to filenames
    const selectedFilenames = [...photos, ...videos]
      .filter((item) => selectedItems.includes(item.id))
      .map((item) => item.filename);

    if (selectedFilenames.length === 0) return;

    const clientNameFormatted = client.client_name
      .replace(/\s+/g, "-")
      .toLowerCase();
    const result = await downloadZip({
      accessCode: client.access_code,
      files: selectedFilenames,
      clientName: clientNameFormatted,
    });
    if (result.success) {
      addToast("ZIP download started!", "success");
    } else if (result.error) {
      addToast(result.error, "error");
    }
  };

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    const allItemIds = [...photos, ...videos].map((item) => item.id);
    if (selectedItems.length === allItemIds.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allItemIds);
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

  const getTabItems = () => {
    if (activeTab === "photos") return photos;
    if (activeTab === "videos") return videos;
    return [...photos, ...videos];
  };

  const goToNextPreview = () => {
    if (!previewItem) return;
    const tabItems = getTabItems();
    const currentIndex = tabItems.findIndex((i) => i.id === previewItem.id);
    if (currentIndex < tabItems.length - 1) {
      const nextItem = tabItems[currentIndex + 1];
      const nextType = photos.some((p) => p.id === nextItem.id)
        ? "photo"
        : "video";
      setPreviewItem(nextItem);
      setPreviewType(nextType);
    }
  };

  const goToPrevPreview = () => {
    if (!previewItem) return;
    const tabItems = getTabItems();
    const currentIndex = tabItems.findIndex((i) => i.id === previewItem.id);
    if (currentIndex > 0) {
      const prevItem = tabItems[currentIndex - 1];
      const prevType = photos.some((p) => p.id === prevItem.id)
        ? "photo"
        : "video";
      setPreviewItem(prevItem);
      setPreviewType(prevType);
    }
  };

  // ─── Authenticated Gallery View ───────────────────────────────────────────────

  if (client) {
    return (
      <>
        <GalleryNavbar
          onLogout={() => {
            setClient(null);
            localStorage.removeItem("galleryClient");
          }}
          previewOpen={!!previewItem}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-screen bg-[var(--off-white)] text-[var(--black)] pt-24 pb-20 px-6"
        >
          <div className="max-w-[1800px] mx-auto">
            {/* Header */}
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

            {/* Bulk download toolbar */}
            <div className="sticky top-20 z-20 bg-[var(--off-white)] py-4 mb-8 border-b border-[var(--gray-light)]/20">
              {/* Error message */}
              {zipError && (
                <div className="mb-4 px-4 py-2 bg-[var(--red)]/10 text-[var(--red)] text-sm rounded flex justify-between items-center">
                  <span>{zipError}</span>
                  <button
                    onClick={clearError}
                    className="text-[var(--red)] hover:opacity-70 text-xl leading-none"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Button group */}
              <div className="flex gap-4 flex-wrap">
                {/* Select All / Deselect All */}
                {(photos.length > 0 || videos.length > 0) && (
                  <button
                    onClick={toggleSelectAll}
                    disabled={isZipping}
                    className="px-4 py-2 bg-[var(--gray-light)]/20 text-[var(--black)] text-[11px] uppercase tracking-[2px] hover:bg-[var(--gray-light)]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedItems.length === photos.length + videos.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                )}

                {/* Download All */}
                <button
                  onClick={handleDownloadAll}
                  disabled={isZipping}
                  className="px-6 py-3 bg-[var(--red)] text-[var(--off-white)] text-[11px] uppercase tracking-[2px] hover:bg-[var(--red-hover)] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={16} />
                  {isZipping ? "Creating ZIP..." : "Download All (ZIP)"}
                </button>

                {/* Download Selected */}
                {selectedItems.length > 0 && (
                  <button
                    onClick={handleDownloadSelected}
                    disabled={isZipping}
                    className="px-6 py-3 bg-transparent text-[var(--black)] text-[11px] uppercase tracking-[2px] hover:bg-[var(--black)] hover:text-[var(--off-white)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ border: "0.5px solid var(--black)" }}
                  >
                    <Download size={16} />
                    {isZipping
                      ? "Creating ZIP..."
                      : `Download Selected (${selectedItems.length})`}
                  </button>
                )}
              </div>
            </div>

            {/* Tab bar + Layout switcher */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              {/* Tabs */}
              <div className="flex gap-1">
                {[
                  { key: "all", label: "All", count: photos.length + videos.length },
                  { key: "photos", label: "Photos", count: photos.length },
                  { key: "videos", label: "Videos", count: videos.length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 text-[11px] uppercase tracking-[2px] transition-all ${
                      activeTab === tab.key
                        ? "bg-[var(--black)] text-[var(--off-white)]"
                        : "bg-transparent text-[var(--black)] hover:bg-[var(--gray-light)]/20"
                    }`}
                    style={{ border: "0.5px solid rgba(14,12,11,0.2)" }}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {/* Layout switcher */}
              <div className="flex gap-1">
                {[
                  { mode: "masonry", icon: <Columns2 size={16} />, label: "Masonry" },
                  { mode: "grid", icon: <LayoutGrid size={16} />, label: "Grid" },
                  { mode: "list", icon: <List size={16} />, label: "List" },
                ].map(({ mode, icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setLayout(mode)}
                    title={label}
                    className={`p-2 transition-all ${
                      layoutMode === mode
                        ? "bg-[var(--black)] text-[var(--off-white)]"
                        : "bg-transparent text-[var(--black)] hover:bg-[var(--gray-light)]/20"
                    }`}
                    style={{ border: "0.5px solid rgba(14,12,11,0.2)" }}
                    aria-label={label}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery content */}
            {loading ? (
              <div className="text-center py-20">Loading...</div>
            ) : (
              <GalleryGrid
                photos={activeTab === "videos" ? [] : photos}
                videos={activeTab === "photos" ? [] : videos}
                layoutMode={layoutMode}
                selectedItems={selectedItems}
                toggleSelect={toggleSelect}
                openPreview={openPreview}
                imageOrientations={imageOrientations}
                handleImageLoad={handleImageLoad}
                getGridSpan={getGridSpan}
                accessCode={client.access_code}
                addToast={addToast}
              />
            )}
          </div>

          {/* Preview Modal */}
          {previewItem && (
            <PreviewModal
              item={previewItem}
              allItems={getTabItems()}
              onClose={closePreview}
              onNext={goToNextPreview}
              onPrev={goToPrevPreview}
              isVideo={previewType === "video"}
              selectedItems={selectedItems}
              toggleSelect={toggleSelect}
              accessCode={client.access_code}
              onError={(msg) => addToast(msg, "error")}
            />
          )}

          <ToastContainer toasts={toasts} removeToast={removeToast} />
        </motion.div>
      </>
    );
  }

  // ─── Login View ───────────────────────────────────────────────────────────────

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display:             "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight:           "100svh",
        }}
      >
        {/* ── Left — editorial dark panel ── */}
        <div
          style={{
            background:     "var(--ink)",
            display:        "flex",
            flexDirection:  "column",
            justifyContent: "flex-end",
            padding:        "clamp(80px, 10vh, 120px) clamp(32px, 5vw, 64px) clamp(48px, 6vh, 72px)",
          }}
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            style={{
              fontFamily:    "var(--font-body)",
              fontSize:       "10px",
              letterSpacing:  "3px",
              textTransform:  "uppercase",
              color:          "rgba(240,235,224,0.3)",
              marginBottom:   "clamp(20px, 3vh, 32px)",
              display:        "flex",
              alignItems:     "center",
              gap:             8,
            }}
          >
            <Lock size={10} strokeWidth={1.5} style={{ opacity: 0.5 }} />
            Private Access
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.6 }}
            style={{
              fontFamily:            "var(--font-display)",
              fontWeight:             900,
              fontSize:               "clamp(48px, 6.5vw, 88px)",
              letterSpacing:         "-0.035em",
              lineHeight:             0.88,
              color:                  "var(--off-white)",
              textTransform:          "uppercase",
              fontVariationSettings:  "'opsz' 144",
              margin:                 0,
            }}
          >
            Client
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.30, duration: 0.6 }}
            style={{
              fontFamily:            "var(--font-display)",
              fontWeight:             300,
              fontStyle:              "italic",
              fontSize:               "clamp(40px, 5.5vw, 76px)",
              letterSpacing:         "-0.025em",
              lineHeight:             1.0,
              color:                  "rgba(240,235,224,0.5)",
              fontVariationSettings:  "'opsz' 120",
              margin:                 "0 0 clamp(24px, 4vh, 40px)",
            }}
          >
            Gallery.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            style={{
              fontFamily:  "var(--font-body)",
              fontWeight:   300,
              fontSize:     "clamp(13px, 1.3vw, 15px)",
              lineHeight:   1.7,
              color:        "rgba(240,235,224,0.35)",
              maxWidth:     "38ch",
              margin:       "0 0 clamp(32px, 5vh, 48px)",
            }}
          >
            Your photos and videos, delivered privately. Enter your access code
            to view and download your files.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{ display: "flex", gap: 24 }}
          >
            {["Secure", "Private", "HD Quality"].map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily:    "var(--font-body)",
                  fontSize:       "10px",
                  letterSpacing:  "2px",
                  textTransform:  "uppercase",
                  color:          "rgba(240,235,224,0.2)",
                }}
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── Right — access form ── */}
        <div
          style={{
            background:     "var(--bg)",
            display:        "flex",
            flexDirection:  "column",
            justifyContent: "center",
            padding:        "clamp(80px, 10vh, 120px) clamp(32px, 5vw, 72px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.55 }}
            style={{ maxWidth: 400 }}
          >
            {/* Heading */}
            <p
              style={{
                fontFamily:    "var(--font-body)",
                fontSize:       "10px",
                letterSpacing:  "2.5px",
                textTransform:  "uppercase",
                color:          "var(--ink-muted)",
                marginBottom:   "clamp(28px, 4vh, 40px)",
              }}
            >
              Enter your access code
            </p>

            {/* Input */}
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="gallery-code"
                style={{
                  display:       "block",
                  fontFamily:    "var(--font-body)",
                  fontSize:       "10px",
                  letterSpacing:  "2px",
                  textTransform:  "uppercase",
                  color:          "var(--ink-muted)",
                  marginBottom:   10,
                }}
              >
                Access Code
              </label>
              <input
                id="gallery-code"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="santos-wedding-2024"
                style={{
                  width:          "100%",
                  padding:        "14px 16px",
                  background:     "var(--surface)",
                  border:         error ? "1px solid var(--ink)" : "0.5px solid var(--border)",
                  color:          "var(--ink)",
                  fontFamily:     "var(--font-body)",
                  fontSize:       "14px",
                  outline:        "none",
                  boxSizing:      "border-box",
                  transition:     "border-color 0.2s",
                  letterSpacing:  "0.5px",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
                onBlur={(e)  => (e.target.style.borderColor = error ? "var(--ink)" : "rgba(14,12,11,0.09)")}
              />
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontFamily:    "var(--font-body)",
                  fontSize:       "10px",
                  letterSpacing:  "1.5px",
                  textTransform:  "uppercase",
                  color:          "var(--ink)",
                  opacity:        0.6,
                  marginBottom:   16,
                }}
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width:          "100%",
                padding:        "15px 24px",
                background:     loading ? "var(--ink-muted)" : "var(--ink)",
                color:          "var(--off-white)",
                fontFamily:     "var(--font-body)",
                fontSize:       "11px",
                letterSpacing:  "2.5px",
                textTransform:  "uppercase",
                border:         "none",
                cursor:         loading ? "not-allowed" : "pointer",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:             10,
                transition:     "background 0.2s",
                marginBottom:   "clamp(28px, 4vh, 40px)",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--gray-dark)"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "var(--ink)"; }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ width: 13, height: 13, border: "1.5px solid rgba(240,235,224,0.3)", borderTop: "1.5px solid var(--off-white)", borderRadius: "50%" }}
                  />
                  Unlocking…
                </>
              ) : (
                "Access My Gallery"
              )}
            </button>

            {/* Hint */}
            <p
              style={{
                fontFamily:    "var(--font-body)",
                fontSize:       "10px",
                letterSpacing:  "1.5px",
                color:          "var(--ink-faint)",
                lineHeight:     1.6,
              }}
            >
              Your access code was sent via email after your session.
            </p>
          </motion.div>
        </div>
      </motion.div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
