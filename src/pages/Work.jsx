import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, LayoutGrid } from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio";
import { isVideo } from "../lib/isVideo";
import VideoWithAutoplay from "../components/VideoWithAutoplay";
import LazyImage from "../components/LazyImage";
import LineSidebar from "../components/reactbits/LineSidebar";

// ─── Constants ────────────────────────────────────────────────────────────────

const WORK_SECTIONS = [
  { id: "work-header", label: "Top"  },
  { id: "work-grid",   label: "Grid" },
];

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ item, items, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const idx = items.findIndex((i) => i.id === item.id);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowLeft"  && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  const NavBtn = ({ side, onClick, children }) => (
    <button
      onClick={onClick}
      aria-label={side === "prev" ? "Previous" : "Next"}
      style={{
        position: "absolute",
        top: "50%",
        [side === "prev" ? "left" : "right"]: "clamp(12px, 3vw, 32px)",
        transform: "translateY(-50%)",
        background: "rgba(240,235,224,0.06)",
        border: "0.5px solid rgba(240,235,224,0.12)",
        color: "rgba(240,235,224,0.7)",
        width: 44,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 302,
        transition: "background 0.2s, color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(240,235,224,0.12)";
        e.currentTarget.style.color = "rgba(240,235,224,1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(240,235,224,0.06)";
        e.currentTarget.style.color = "rgba(240,235,224,0.7)";
      }}
    >
      {children}
    </button>
  );

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="lb-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(8,7,6,0.97)",
          zIndex: 300,
          cursor: "pointer",
        }}
      />

      {/* Content */}
      <motion.div
        key="lb-content"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 301,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "rgba(240,235,224,0.06)",
            border: "0.5px solid rgba(240,235,224,0.12)",
            color: "rgba(240,235,224,0.7)",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 302,
            pointerEvents: "auto",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(240,235,224,0.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(240,235,224,0.06)")}
        >
          <X size={14} strokeWidth={1.5} />
        </button>

        {/* Prev / Next */}
        {hasPrev && (
          <NavBtn side="prev" onClick={(e) => { e.stopPropagation(); onPrev(); }}>
            <ChevronLeft size={18} strokeWidth={1.5} />
          </NavBtn>
        )}
        {hasNext && (
          <NavBtn side="next" onClick={(e) => { e.stopPropagation(); onNext(); }}>
            <ChevronRight size={18} strokeWidth={1.5} />
          </NavBtn>
        )}

        {/* Media */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: "88vw",
            maxHeight: "88vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "auto",
          }}
        >
          {isVideo(item) ? (
            <video
              src={item.url}
              controls
              autoPlay
              style={{ maxWidth: "88vw", maxHeight: "88vh", display: "block" }}
            />
          ) : (
            <img
              src={item.url}
              alt={item.title || item.category}
              style={{
                maxWidth: "88vw",
                maxHeight: "88vh",
                objectFit: "contain",
                display: "block",
              }}
            />
          )}
        </div>

        {/* Counter + title */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            pointerEvents: "none",
          }}
        >
          {item.title && (
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: 14,
                color: "rgba(240,235,224,0.55)",
                letterSpacing: "-0.01em",
              }}
            >
              {item.title}
            </p>
          )}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "9px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "rgba(240,235,224,0.28)",
            }}
          >
            {idx + 1} / {items.length}
          </p>
        </div>
      </motion.div>
    </>
  );
}

// ─── DomeGallery ──────────────────────────────────────────────────────────────

const DOME_SLOTS   = 7;   // visible cards at once
const DOME_HALF    = Math.floor(DOME_SLOTS / 2);
const ANGLE_STEP   = 20;  // degrees between adjacent cards
const CARD_W_BASE  = 200; // px — center card width reference

function DomeGallery({ items, onSelect }) {
  const [centerIdx, setCenterIdx] = useState(0);
  const n = items.length;

  useEffect(() => { setCenterIdx(0); }, [items]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft")  setCenterIdx((i) => (i - 1 + n) % n);
      if (e.key === "ArrowRight") setCenterIdx((i) => (i + 1) % n);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [n]);

  if (n === 0) return null;

  const goTo  = (idx) => setCenterIdx(((idx % n) + n) % n);
  const prev  = () => setCenterIdx((i) => (i - 1 + n) % n);
  const next  = () => setCenterIdx((i) => (i + 1) % n);

  // Build the visible slots: centerIdx ± DOME_HALF
  const slots = Array.from({ length: DOME_SLOTS }, (_, k) => {
    const offset = k - DOME_HALF;
    const idx    = ((centerIdx + offset) + n) % n;
    return { offset, idx, item: items[idx] };
  });

  return (
    <div style={{ userSelect: "none" }}>
      {/* ── Fan stage ── */}
      <div
        style={{
          position: "relative",
          height: "clamp(400px, 62vh, 660px)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        {slots.map(({ offset, idx, item }) => {
          const abs      = Math.abs(offset);
          const isCenter = offset === 0;
          const angle    = offset * ANGLE_STEP;
          const scale    = 1 - abs * 0.13;
          const opacity  = 1 - abs * 0.22;
          const zIndex   = DOME_SLOTS - abs;
          // Width shrinks away from center
          const cardW    = `clamp(${CARD_W_BASE * 0.5}px, ${13 - abs * 1.2}vw, ${CARD_W_BASE * (1 - abs * 0.1)}px)`;

          return (
            <motion.div
              key={`${idx}-${offset}`}
              animate={{ rotate: angle, scale, opacity }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={
                isCenter
                  ? { scale: scale * 1.03 }
                  : { scale: scale * 1.06, opacity: opacity + 0.1 }
              }
              onClick={() => isCenter ? onSelect(item) : goTo(idx)}
              style={{
                position:        "absolute",
                bottom:          "clamp(32px, 5vh, 60px)",
                left:            "50%",
                marginLeft:      `calc(${cardW} / -2)`,
                width:           cardW,
                aspectRatio:     "2 / 3",
                overflow:        "hidden",
                cursor:          isCenter ? "zoom-in" : "pointer",
                transformOrigin: "bottom center",
                zIndex,
                willChange:      "transform, opacity",
              }}
            >
              <img
                src={item.url}
                alt={item.category}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                loading="lazy"
              />

              {/* Tint for non-center cards */}
              {!isCenter && (
                <div
                  style={{
                    position:   "absolute",
                    inset:       0,
                    background: `rgba(237,232,220,${abs * 0.18})`,
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* Center card — bottom label + "tap to open" hint */}
              {isCenter && (
                <>
                  <div
                    style={{
                      position:   "absolute",
                      inset:       0,
                      border:      "0.5px solid rgba(14,12,11,0.18)",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position:   "absolute",
                      bottom:      0,
                      left:        0,
                      right:       0,
                      padding:     "16px 14px",
                      background:  "linear-gradient(to top, rgba(14,12,11,0.82) 0%, transparent 100%)",
                    }}
                  >
                    {item.title && (
                      <p
                        style={{
                          fontFamily:   "var(--font-display)",
                          fontStyle:    "italic",
                          fontWeight:    300,
                          fontSize:      "clamp(13px, 1.3vw, 16px)",
                          color:         "rgba(240,235,224,0.9)",
                          letterSpacing: "-0.01em",
                          marginBottom:  4,
                          lineHeight:    1.2,
                        }}
                      >
                        {item.title}
                      </p>
                    )}
                    <p
                      style={{
                        fontFamily:    "var(--font-body)",
                        fontSize:       "10px",
                        letterSpacing:  "2px",
                        textTransform:  "uppercase",
                        color:          "rgba(240,235,224,0.5)",
                      }}
                    >
                      {item.category}
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── Navigation row ── */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          gap:             24,
          marginTop:       "clamp(20px, 3vh, 36px)",
        }}
      >
        <button
          onClick={prev}
          aria-label="Previous"
          style={{
            background:    "none",
            border:         "0.5px solid var(--border)",
            color:          "var(--ink-muted)",
            width:           36,
            height:          36,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            cursor:         "pointer",
            transition:     "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--ink)";
            e.currentTarget.style.color       = "var(--ink)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color       = "var(--ink-muted)";
          }}
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
        </button>

        {/* Dot strip */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to item ${i + 1}`}
              style={{
                background:   i === centerIdx ? "var(--ink)" : "var(--ink-faint)",
                border:        "none",
                borderRadius:  "50%",
                width:          6,
                height:         6,
                cursor:        "pointer",
                padding:        0,
                transform:     i === centerIdx ? "scale(1)" : "scale(0.67)",
                transition:    "background 0.25s, transform 0.25s",
                flexShrink:     0,
                display:       Math.abs(i - centerIdx) > 8 ? "none" : "block",
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          aria-label="Next"
          style={{
            background:    "none",
            border:         "0.5px solid var(--border)",
            color:          "var(--ink-muted)",
            width:           36,
            height:          36,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            cursor:         "pointer",
            transition:     "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--ink)";
            e.currentTarget.style.color       = "var(--ink)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color       = "var(--ink-muted)";
          }}
        >
          <ChevronRight size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* ── Counter + hint ── */}
      <p
        style={{
          textAlign:     "center",
          fontFamily:    "var(--font-body)",
          fontSize:       "10px",
          letterSpacing:  "2px",
          textTransform:  "uppercase",
          color:          "var(--ink-faint)",
          marginTop:       12,
        }}
      >
        {centerIdx + 1} of {n} · Click center to preview · ← → to browse
      </p>
    </div>
  );
}

// ─── MasonryGrid ──────────────────────────────────────────────────────────────

function MasonryGrid({ items, onSelect, loading }) {
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 600)       setCols(2);
      else if (window.innerWidth < 1024) setCols(3);
      else                               setCols(4);
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: "clamp(4px, 0.8vw, 10px)",
        }}
      >
        {Array.from({ length: cols * 3 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.08 }}
            style={{
              background: "var(--bg-dim)",
              aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "4/5" : "2/3",
            }}
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  // Distribute items across columns for a masonry effect
  const columns = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => columns[i % cols].push(item));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "clamp(4px, 0.8vw, 10px)",
        alignItems: "start",
      }}
    >
      {columns.map((col, ci) => (
        <div
          key={ci}
          style={{ display: "flex", flexDirection: "column", gap: "clamp(4px, 0.8vw, 10px)" }}
        >
          {col.map((item, ri) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (ci * 0.05 + ri * 0.04), ease: [0.16, 1, 0.3, 1] }}
              whileHover="hover"
              onClick={() => onSelect(item)}
              style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}
            >
              {isVideo(item) ? (
                <VideoWithAutoplay
                  src={item.url}
                  style={{ width: "100%", display: "block" }}
                />
              ) : (
                <LazyImage
                  src={item.url}
                  alt={item.title || item.category}
                  style={{ width: "100%", display: "block" }}
                />
              )}

              {/* Hover overlay */}
              <motion.div
                variants={{
                  hover: { opacity: 1 },
                }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(14,12,11,0.55)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {item.title && (
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontWeight: 300,
                      fontSize: "clamp(13px, 1.4vw, 16px)",
                      color: "var(--off-white)",
                      letterSpacing: "-0.01em",
                      textAlign: "center",
                      padding: "0 12px",
                    }}
                  >
                    {item.title}
                  </p>
                )}
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "9px",
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    color: "rgba(240,235,224,0.55)",
                  }}
                >
                  {item.category}
                  {isVideo(item) && " · Video"}
                </p>
              </motion.div>

              {/* Video badge */}
              {isVideo(item) && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    fontFamily: "var(--font-body)",
                    fontSize: "10px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--off-white)",
                    background: "rgba(14,12,11,0.7)",
                    padding: "3px 8px",
                  }}
                >
                  Video
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Work ─────────────────────────────────────────────────────────────────────

export default function Work() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(null);
  const [viewMode, setViewMode] = useState("dome"); // "dome" | "grid"
  const [lightboxItem, setLightboxItem] = useState(null);

  const { items, categories, loading } = usePortfolio(activeCategory);

  // Seed category from URL param on first render
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setActiveCategory(cat);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxItem ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxItem]);

  const lightboxIdx = lightboxItem
    ? items.findIndex((i) => i.id === lightboxItem.id)
    : -1;
  const hasPrev = lightboxIdx > 0;
  const hasNext  = lightboxIdx < items.length - 1;

  const handleCategoryChange = useCallback((cat) => {
    setActiveCategory(cat);
    setViewMode("grid");
    if (cat) setSearchParams({ category: cat });
    else     setSearchParams({});
  }, [setSearchParams]);

  return (
    <>
      <Helmet>
        <title>
          {activeCategory
            ? `${activeCategory} · Work — Kyle Payawal`
            : "Work — Kyle Payawal · Photographer & Videographer"}
        </title>
        <meta
          name="description"
          content="Browse Kyle Payawal's full portfolio — weddings, debuts, pageants, portraits, and commercial campaigns. Photographer and videographer based in Tarlac and Angeles City, Philippines."
        />
        <link rel="canonical" href="https://kylepayawal.studio/work" />
      </Helmet>

      <LineSidebar sections={WORK_SECTIONS} />

      {/* ── PAGE HEADER ────────────────────────────────────────────────────── */}
      <section
        id="work-header"
        style={{
          paddingTop: "clamp(96px, 14vh, 140px)",
          paddingBottom: "clamp(32px, 4vw, 56px)",
          paddingLeft: "clamp(24px, 6vw, 80px)",
          paddingRight: "clamp(24px, 6vw, 80px)",
          background: "var(--bg)",
        }}
      >
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 16 }}
        >
          Selected Projects
        </motion.p>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "clamp(64px, 10vw, 140px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.88,
              fontVariationSettings: "'opsz' 144",
              color: "var(--ink)",
            }}
          >
            Work.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(14px, 1.8vw, 22px)",
              color: "var(--ink-muted)",
              letterSpacing: "-0.01em",
              alignSelf: "flex-end",
              paddingBottom: "clamp(8px, 1vw, 14px)",
            }}
          >
            Flash. grain. truth.
          </motion.p>
        </div>
      </section>

      {/* ── CATEGORY FILTER ────────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          top: 56,
          zIndex: 50,
          background: "rgba(237,232,220,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            paddingLeft: "clamp(24px, 6vw, 80px)",
            paddingRight: "clamp(24px, 6vw, 80px)",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {/* "All" tab */}
          {[null, ...categories.map((c) => c.name)].map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat ?? "all"}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "16px 0",
                  marginRight: "clamp(20px, 2.5vw, 36px)",
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  color: isActive ? "var(--ink)" : "var(--ink-muted)",
                  position: "relative",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "color 0.2s",
                }}
              >
                {cat ?? "All"}
                {isActive && (
                  <motion.div
                    layoutId="cat-underline"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "1px",
                      background: "var(--ink)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </button>
            );
          })}

          {/* View mode toggle — pushed to end */}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
              paddingLeft: 24,
            }}
          >
            <button
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              title="Grid"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                color: viewMode === "grid" ? "var(--ink)" : "var(--ink-faint)",
                display: "flex",
                transition: "color 0.2s",
              }}
            >
              <LayoutGrid size={14} strokeWidth={1.5} />
            </button>

            {/* Dome toggle — custom icon (fan shape) */}
            <button
              onClick={() => setViewMode(viewMode === "dome" ? "grid" : "dome")}
              aria-label="Dome view"
              title="Dome"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                color: viewMode === "dome" ? "var(--ink)" : "var(--ink-faint)",
                display: "flex",
                transition: "color 0.2s",
              }}
            >
              {/* Fan SVG icon */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M7 12 L7 4" />
                <path d="M7 12 L2 5" />
                <path d="M7 12 L12 5" />
                <path d="M7 12 L1 8" />
                <path d="M7 12 L13 8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── GRID / DOME ────────────────────────────────────────────────────── */}
      <section
        id="work-grid"
        style={{
          padding: "clamp(24px, 4vw, 48px) clamp(24px, 6vw, 80px) clamp(64px, 8vw, 120px)",
          background: "var(--bg)",
          minHeight: "60vh",
        }}
      >
        <AnimatePresence mode="wait">
          {viewMode === "dome" ? (
            <motion.div
              key="dome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {loading ? (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                  <p className="eyebrow">Loading...</p>
                </div>
              ) : (
                <DomeGallery items={items} onSelect={setLightboxItem} />
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`grid-${activeCategory ?? "all"}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MasonryGrid
                items={items}
                onSelect={setLightboxItem}
                loading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!loading && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", padding: "clamp(64px, 10vh, 120px) 0" }}
          >
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "clamp(28px, 4vw, 48px)",
                color: "var(--ink)",
                letterSpacing: "-0.03em",
                marginBottom: 12,
                fontVariationSettings: "'opsz' 144",
              }}
            >
              Nothing here yet.
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(14px, 1.6vw, 18px)",
                color: "var(--ink-muted)",
                letterSpacing: "-0.01em",
              }}
            >
              This category is still being curated.
            </p>
          </motion.div>
        )}
      </section>

      {/* ── LIGHTBOX ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxItem && (
          <Lightbox
            key="lightbox"
            item={lightboxItem}
            items={items}
            onClose={() => setLightboxItem(null)}
            onPrev={() => setLightboxItem(items[lightboxIdx - 1])}
            onNext={() => setLightboxItem(items[lightboxIdx + 1])}
            hasPrev={hasPrev}
            hasNext={hasNext}
          />
        )}
      </AnimatePresence>
    </>
  );
}
