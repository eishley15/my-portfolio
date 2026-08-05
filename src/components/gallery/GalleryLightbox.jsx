import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart, Download, Loader2 } from "lucide-react";
import { useSwipe } from "../../hooks/useSwipe";
import { authHeaders } from "../../lib/galleryAuth";

export default function GalleryLightbox({ item, allItems, onClose, onNext, onPrev, isFavorited, onFavoriteToggle, accessCode, onError, bgColor = "#faf9f7" }) {
  const containerRef  = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const currentIndex  = allItems.findIndex((i) => i.id === item?.id);

  useSwipe(containerRef, { onLeft: onNext, onRight: onPrev });

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft")  onPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    containerRef.current?.focus();
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function handleDownload(e) {
    e.stopPropagation();
    if (downloading || !item?.filename) return;
    setDownloading(true);
    try {
      const res = await fetch(
        `/api/download?accessCode=${encodeURIComponent(accessCode)}&galleryId=${encodeURIComponent(accessCode)}&fileName=${encodeURIComponent(item.filename)}`,
        { headers: authHeaders() },
      );
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      const a = document.createElement("a");
      a.href = url; a.download = item.filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch {
      onError?.("Could not download. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        tabIndex={-1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, zIndex: 200, background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", outline: "none" }}
        onClick={onClose}
      >
        {/* Top-right action bar */}
        <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 10, zIndex: 201 }} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onFavoriteToggle?.(item.id)} aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"} style={iconBtn(isFavorited)}>
            <Heart size={18} fill={isFavorited ? "#c23" : "none"} stroke={isFavorited ? "#c23" : "#333"} strokeWidth={1.5} />
          </button>
          <button onClick={handleDownload} disabled={downloading} aria-label="Download" style={iconBtn(false)}>
            {downloading
              ? <Loader2 size={18} stroke="#333" strokeWidth={1.5} style={{ animation: "spin 1s linear infinite" }} />
              : <Download size={18} stroke="#333" strokeWidth={1.5} />}
          </button>
          <button onClick={onClose} aria-label="Close lightbox" style={iconBtn(false)}>
            <X size={18} stroke="#333" strokeWidth={1.5} />
          </button>
        </div>

        {/* Media */}
        <div style={{ maxWidth: "82vw", maxHeight: "88vh" }} onClick={(e) => e.stopPropagation()}>
          {item.type === "video" ? (
            <video src={item.url} controls autoPlay style={{ maxWidth: "100%", maxHeight: "88vh", objectFit: "contain" }} />
          ) : (
            <img src={item.url} alt={item.filename} style={{ maxWidth: "100%", maxHeight: "88vh", objectFit: "contain", display: "block" }} />
          )}
        </div>

        {currentIndex > 0 && (
          <button onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous photo" style={{ ...arrow, left: 20 }}>
            <ChevronLeft size={28} stroke="#333" strokeWidth={1.5} />
          </button>
        )}

        {currentIndex < allItems.length - 1 && (
          <button onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next photo" style={{ ...arrow, right: 20 }}>
            <ChevronRight size={28} stroke="#333" strokeWidth={1.5} />
          </button>
        )}

        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", fontSize: 11, letterSpacing: 2, color: "rgba(0,0,0,0.35)", fontFamily: "var(--font-body)" }}>
          {currentIndex + 1} / {allItems.length}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

const iconBtn = (active) => ({
  width: 40, height: 40, borderRadius: "50%",
  background: active ? "rgba(200,50,50,0.08)" : "rgba(0,0,0,0.06)",
  border: "0.5px solid rgba(0,0,0,0.12)",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", transition: "all 0.15s ease",
});

const arrow = {
  position: "absolute", top: "50%", transform: "translateY(-50%)",
  width: 44, height: 44, borderRadius: "50%",
  background: "rgba(255,255,255,0.85)", border: "0.5px solid rgba(0,0,0,0.12)",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", backdropFilter: "blur(8px)",
};
