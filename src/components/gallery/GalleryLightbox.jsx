import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart, Download, Loader2 } from "lucide-react";
import LightboxStage from "../lightbox/LightboxStage";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { downloadGalleryFile } from "../../lib/galleryDownload";
import { useGallerySession } from "../../lib/gallerySession";

// Stable accessors so the stage's preload effect doesn't re-run every render
const getSrc  = (f) => f.url;
const getKey  = (f) => f.id;
const getAlt  = (f, i) => f.filename || `Photo ${i + 1}`;
const isImage = (f) => f.type !== "video";

function VideoSlide({ src, active }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) v.play().catch(() => { /* autoplay blocked — controls are visible */ });
    else v.pause();
  }, [active]);
  return (
    <video
      ref={ref}
      src={src}
      controls
      playsInline
      preload={active ? "auto" : "metadata"}
      className="lb-media"
      data-lb-ignore=""
    />
  );
}

const renderMedia = (item, { active }) =>
  item.type === "video" ? <VideoSlide src={item.url} active={active} /> : null;

export default function GalleryLightbox({
  items, index, onIndexChange, onClose,
  favorites, onFavoriteToggle,
  accessCode, onError, downloadsEnabled = true, favoritesEnabled = true,
  bgColor = "#faf9f7", textColor = "#3d2b2b",
}) {
  const rootRef  = useRef(null);
  const stageRef = useRef(null);
  const backdrop = useMotionValue(1);
  const [chromeHidden, setChromeHidden] = useState(false);
  const [downloading,  setDownloading]  = useState(false);
  const { runDownload } = useGallerySession();

  const item        = items[index];
  const isFavorited = item ? favorites.has(item.id) : false;

  useBodyScrollLock(true);

  useEffect(() => { rootRef.current?.focus({ preventScroll: true }); }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowRight") stageRef.current?.next();
      if (e.key === "ArrowLeft")  stageRef.current?.prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleDownload() {
    if (downloading || !item?.filename) return;
    setDownloading(true);
    try {
      await runDownload(() => downloadGalleryFile({ accessCode, filename: item.filename }));
    } catch {
      onError?.("Could not download. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  if (!item) return null;

  const heart = (
    <Heart size={18} fill={isFavorited ? "#c23" : "none"} stroke={isFavorited ? "#c23" : "currentColor"} strokeWidth={1.5} />
  );
  const downloadIcon = downloading
    ? <Loader2 size={18} strokeWidth={1.5} style={{ animation: "spin 1s linear infinite" }} />
    : <Download size={18} strokeWidth={1.5} />;
  const canFavorite = favoritesEnabled && item.type !== "video";

  return (
    <motion.div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      tabIndex={-1}
      className="lb-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        "--lb-bg":     bgColor,
        "--lb-fg":     textColor,
        "--lb-btn-bg": `${bgColor}d9`,
        "--lb-line":   `${textColor}24`,
      }}
    >
      <motion.div className="lb-backdrop" style={{ opacity: backdrop }} />

      <LightboxStage
        ref={stageRef}
        items={items}
        index={index}
        onIndexChange={onIndexChange}
        getSrc={getSrc}
        getKey={getKey}
        getAlt={getAlt}
        isImage={isImage}
        renderMedia={renderMedia}
        onClose={onClose}
        onTap={() => setChromeHidden((h) => !h)}
        backdropOpacity={backdrop}
      />

      {/* Outer layer fades with swipe-to-dismiss; inner layer toggles on tap */}
      <motion.div className="lb-chrome-fade" style={{ opacity: backdrop }}>
      <div className="lb-chrome" data-hidden={chromeHidden ? "true" : "false"}>
        <div className="lb-top">
          <span className="lb-counter" aria-live="polite">{index + 1} / {items.length}</span>
          <div className="lb-actions">
            {canFavorite && (
              <button type="button" className="lb-btn lb-desktop-only" onClick={() => onFavoriteToggle?.(item.id)}
                aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"} aria-pressed={isFavorited}>
                {heart}
              </button>
            )}
            {downloadsEnabled && (
              <button type="button" className="lb-btn lb-desktop-only" onClick={handleDownload} disabled={downloading} aria-label="Download">
                {downloadIcon}
              </button>
            )}
            <button type="button" className="lb-btn" onClick={onClose} aria-label="Close lightbox">
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {index > 0 && (
          <button type="button" className="lb-btn lb-arrow lb-arrow-prev" onClick={() => stageRef.current?.prev()} aria-label="Previous photo">
            <ChevronLeft size={24} strokeWidth={1.5} />
          </button>
        )}
        {index < items.length - 1 && (
          <button type="button" className="lb-btn lb-arrow lb-arrow-next" onClick={() => stageRef.current?.next()} aria-label="Next photo">
            <ChevronRight size={24} strokeWidth={1.5} />
          </button>
        )}

        {/* Phones: primary actions sit in the thumb zone */}
        {(canFavorite || downloadsEnabled) && (
          <div className="lb-bottom">
            {canFavorite && (
              <button type="button" className="lb-pill" onClick={() => onFavoriteToggle?.(item.id)} aria-pressed={isFavorited}>
                {heart} {isFavorited ? "Favorited" : "Favorite"}
              </button>
            )}
            {downloadsEnabled && (
              <button type="button" className="lb-pill" onClick={handleDownload} disabled={downloading}>
                {downloadIcon} {downloading ? "Saving…" : "Download"}
              </button>
            )}
          </div>
        )}
      </div>
      </motion.div>
    </motion.div>
  );
}
