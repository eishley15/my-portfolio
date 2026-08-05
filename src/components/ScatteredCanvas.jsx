import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { isVideo } from "../lib/isVideo";
import VideoWithAutoplay from "./VideoWithAutoplay";

// ─── Seeded deterministic layout ─────────────────────────────────────────────

function seededRng(seed) {
  let s = (seed * 1664525 + 1013904223) >>> 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223 >>> 0;
    return s / 0x100000000;
  };
}

function buildLayout(count, containerWidth = 1200) {
  const rand = seededRng(31337);

  const isMobile = containerWidth < 640;
  const isTablet = containerWidth < 1024;
  const COLS  = isMobile ? 1 : isTablet ? 2 : 3;
  const CW    = Math.round(containerWidth / COLS);
  const CH    = isMobile ? 260 : isTablet ? 340 : 420;
  const PX    = isMobile ? 16 : 60;
  const PY    = isMobile ? 16 : 50;
  const jitterX = isMobile ? 0 : isTablet ? 60 : 110;
  const jitterY = isMobile ? 0 : isTablet ? 40 : 80;
  const minW  = isMobile ? Math.round(containerWidth * 0.72) : isTablet ? 220 : 260;
  const maxW  = isMobile ? Math.round(containerWidth * 0.88) : isTablet ? Math.round(CW * 0.7) : Math.round(CW * 0.72);
  const maxRot = isMobile ? 1.2 : 3.2;

  return Array.from({ length: count }, (_, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    return {
      x:      PX + col * CW + (rand() - 0.5) * jitterX,
      y:      PY + row * CH + (rand() - 0.5) * jitterY,
      w:      Math.round(minW + rand() * (maxW - minW)),
      rotate: (rand() - 0.5) * maxRot,
    };
  });
}

// ─── ProjectOverlay ───────────────────────────────────────────────────────────

function ProjectOverlay({ item, onClose, onViewGallery }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <motion.div
        key="sb-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(8,7,6,0.97)",
          zIndex: 300, cursor: "pointer",
        }}
      />

      <motion.div
        key="sb-content"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "fixed", inset: 0, zIndex: 301, overflow: "hidden" }}
      >
        {isVideo(item) ? (
          <video
            src={item.url}
            autoPlay muted loop playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <img
            src={item.url}
            alt={item.title || item.category}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            draggable={false}
          />
        )}

        {/* Bottom gradient */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(8,7,6,0.92) 0%, rgba(8,7,6,0.18) 48%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Title + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.42, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            bottom: "clamp(44px, 7vh, 96px)",
            left: "clamp(32px, 6vw, 80px)",
            right: "clamp(32px, 6vw, 80px)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "9px", letterSpacing: "3.5px",
              textTransform: "uppercase",
              color: "rgba(255,252,242,0.4)",
              marginBottom: 12,
            }}
          >
            {item.category}
          </p>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic", fontWeight: 300,
              fontSize: "clamp(28px, 5.5vw, 80px)",
              color: "#FFFCF2",
              letterSpacing: "-0.025em",
              lineHeight: 1.04,
              marginBottom: 32,
            }}
          >
            {item.title || item.category}
          </h2>

          <button
            onClick={onViewGallery}
            style={{
              background: "none",
              border: "0.5px solid rgba(255,252,242,0.28)",
              color: "rgba(255,252,242,0.8)",
              fontFamily: "var(--font-body)",
              fontSize: "9px", letterSpacing: "2.5px",
              textTransform: "uppercase",
              padding: "12px 28px",
              cursor: "pointer",
              transition: "border-color 0.2s, background 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,252,242,0.65)";
              e.currentTarget.style.background  = "rgba(255,252,242,0.07)";
              e.currentTarget.style.color       = "#FFFCF2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,252,242,0.28)";
              e.currentTarget.style.background  = "none";
              e.currentTarget.style.color       = "rgba(255,252,242,0.8)";
            }}
          >
            View {item.category} Gallery →
          </button>
        </motion.div>

        {/* Close button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.14 }}
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 20, right: 20,
            background: "rgba(255,252,242,0.06)",
            border: "0.5px solid rgba(255,252,242,0.12)",
            color: "rgba(255,252,242,0.65)",
            width: 40, height: 40,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 302,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,252,242,0.14)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,252,242,0.06)")}
        >
          <X size={14} strokeWidth={1.5} />
        </motion.button>
      </motion.div>
    </>
  );
}

// ─── CanvasCard ───────────────────────────────────────────────────────────────

function CanvasCard({ item, pos, index, isDragging, onSelect }) {
  const { x, y, w, rotate } = pos;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, rotate }}
      animate={{ opacity: 1, scale: 1,    rotate }}
      transition={{ duration: 0.55, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        scale: 1.06, y: -10,
        rotate: rotate * 0.4,
        zIndex: 10,
        transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
      }}
      onClick={onSelect}
      style={{
        position: "absolute",
        left: x, top: y, width: w,
        aspectRatio: "4 / 3",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "pointer",
        boxShadow: "0 10px 52px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.35)",
        willChange: "transform",
        zIndex: 1,
      }}
    >
      {isVideo(item) ? (
        <VideoWithAutoplay
          src={item.url}
          poster={item.thumbnail_url || undefined}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <img
          src={item.url}
          alt={item.title || item.category}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          draggable={false}
          loading="lazy"
        />
      )}

      {/* Hover tint */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.22 }}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(255,252,242,0.07)",
          pointerEvents: "none",
        }}
      />

      {/* Hover label */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileHover={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26 }}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "28px 14px 12px",
          background: "linear-gradient(to top, rgba(8,7,6,0.72) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "9px", letterSpacing: "2.5px",
            textTransform: "uppercase",
            color: "rgba(255,252,242,0.55)",
          }}
        >
          {item.category}
        </p>
        {item.title && (
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic", fontWeight: 300,
              fontSize: "clamp(11px, 1.1vw, 13px)",
              color: "rgba(255,252,242,0.8)",
              letterSpacing: "-0.01em",
              marginTop: 3, lineHeight: 1.2,
            }}
          >
            {item.title}
          </p>
        )}
      </motion.div>

      {isVideo(item) && (
        <div
          style={{
            position: "absolute", top: 10, left: 10,
            fontFamily: "var(--font-body)",
            fontSize: "8px", letterSpacing: "2px",
            textTransform: "uppercase",
            color: "rgba(255,252,242,0.7)",
            background: "rgba(8,7,6,0.6)",
            padding: "3px 8px",
          }}
        >
          Video
        </div>
      )}
    </motion.div>
  );
}

// ─── ScatteredCanvas ──────────────────────────────────────────────────────────

export default function ScatteredCanvas({ items, onViewGallery }) {
  const containerRef   = useRef(null);
  const [containerWidth, setContainerWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [constraints, setConstraints] = useState({ left: 0, right: 0, top: 0, bottom: 0 });
  const [isDragging,  setIsDragging]  = useState(false);
  const [selected,    setSelected]    = useState(null);

  const layout  = buildLayout(items.length, containerWidth);
  const canvasW = layout.reduce((m, { x, w })    => Math.max(m, x + w),        0) + 120;
  const canvasH = layout.reduce((m, { y, w })    => Math.max(m, y + w * 0.75), 0) + 120;

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const { offsetWidth: cw, offsetHeight: ch } = containerRef.current;
      setContainerWidth(cw);
      setConstraints({
        left:   Math.min(0, cw - canvasW),
        right:  0,
        top:    Math.min(0, ch - canvasH),
        bottom: 0,
      });
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [canvasW, canvasH]);

  const handleSelect = useCallback((item) => {
    if (isDragging) return;
    setSelected(item);
  }, [isDragging]);

  if (!items || items.length === 0) return null;

  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: "calc(100svh - 106px)",
          minHeight: 480,
          overflow: "hidden",
          background: "#252422",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <motion.div
          drag
          dragConstraints={constraints}
          dragElastic={0.04}
          dragTransition={{ power: 0.12, timeConstant: 260 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setTimeout(() => setIsDragging(false), 60)}
          style={{ position: "absolute", width: canvasW, height: canvasH }}
        >
          {items.map((item, i) => (
            <CanvasCard
              key={item.id}
              item={item}
              pos={layout[i]}
              index={i}
              isDragging={isDragging}
              onSelect={() => handleSelect(item)}
            />
          ))}
        </motion.div>

        {/* Hint */}
        <p
          style={{
            position: "absolute", bottom: 18,
            left: "50%", transform: "translateX(-50%)",
            fontFamily: "var(--font-body)",
            fontSize: "9px", letterSpacing: "2.5px",
            textTransform: "uppercase",
            color: "rgba(255,252,242,0.18)",
            pointerEvents: "none", whiteSpace: "nowrap", zIndex: 5,
          }}
        >
          Drag to explore · Click to open
        </p>
      </div>

      <AnimatePresence>
        {selected && (
          <ProjectOverlay
            key="project-overlay"
            item={selected}
            onClose={() => setSelected(null)}
            onViewGallery={() => {
              onViewGallery?.(selected);
              setSelected(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
