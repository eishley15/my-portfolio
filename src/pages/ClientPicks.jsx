import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { usePickGallery, submitPickSelections, getPickPhotoUrl } from "../hooks/usePickGallery";

// ─── Minimal top nav (no CardNav, no hamburger — just the brand) ──────────────
function PicksNavbar({ galleryName, selectionCount, maxSelections }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      style={{
        position:       "fixed",
        top: 0, left: 0, right: 0,
        zIndex:          100,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "space-between",
        padding:         "18px clamp(20px, 5vw, 48px)",
        background:      scrolled ? "rgba(237,232,220,0.92)" : "transparent",
        backdropFilter:  scrolled ? "blur(18px)" : "none",
        borderBottom:    scrolled ? "0.5px solid var(--border)" : "none",
        transition:      "background 0.35s, border-color 0.35s",
      }}
    >
      <Link
        to="/"
        style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "13px",
          letterSpacing: "3.5px",
          color:         scrolled ? "var(--ink)" : "var(--off-white)",
          textDecoration: "none",
          textTransform:  "uppercase",
          transition:    "color 0.35s",
        }}
      >
        Kyle Payawal
      </Link>

      {selectionCount > 0 && (
        <motion.span
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily:    "var(--font-body)",
            fontSize:       "10px",
            letterSpacing:  "2px",
            textTransform:  "uppercase",
            color:          scrolled ? "var(--ink-muted)" : "rgba(255,252,242,0.6)",
            transition:    "color 0.35s",
          }}
        >
          {selectionCount}{maxSelections > 0 ? ` / ${maxSelections}` : ""} selected
        </motion.span>
      )}
    </nav>
  );
}

// ─── Photo card ───────────────────────────────────────────────────────────────
function PhotoCard({ photo, index, isSelected, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const url = getPickPhotoUrl(photo.storage_path);

  // Above-fold images load eagerly at high priority; rest defer
  const isAboveFold = index < 12;
  const loadingAttr = isAboveFold ? "eager" : "lazy";
  const priorityAttr = index < 6 ? "high" : "auto";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.3), duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      style={{
        position:   "relative",
        cursor:     "pointer",
        overflow:   "hidden",
        background: "var(--surface)",
        outline:    isSelected ? "2px solid var(--ink)" : "2px solid transparent",
        outlineOffset: "-2px",
        transition: "outline-color 0.2s",
        aspectRatio: "3/2",
      }}
    >
      {/* Loading skeleton */}
      {!loaded && !errored && (
        <div
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, var(--surface) 25%, var(--bg-dim) 50%, var(--surface) 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
      )}

      {/* Error state */}
      {errored && (
        <div
          style={{
            position: "absolute", inset: 0,
            background: "var(--surface)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span style={{ fontFamily: "var(--font-body)", fontSize: "9px", letterSpacing: "1.5px", color: "rgba(14,12,11,0.2)", textTransform: "uppercase" }}>
            {String(index + 1).padStart(3, "0")}
          </span>
        </div>
      )}

      <img
        src={url}
        alt={`Photo ${index + 1}`}
        loading={loadingAttr}
        fetchpriority={priorityAttr}
        decoding={isAboveFold ? "sync" : "async"}
        onLoad={() => setLoaded(true)}
        onError={() => { setLoaded(true); setErrored(true); }}
        style={{
          width: "100%", height: "100%",
          objectFit: "cover",
          display: "block",
          transition: "opacity 0.3s",
          opacity: loaded && !errored ? 1 : 0,
        }}
      />

      {/* Hover overlay */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "rgba(14,12,11,0.0)",
          transition: "background 0.2s",
        }}
        className="photo-hover-overlay"
      />

      {/* Photo number */}
      <span
        style={{
          position:      "absolute",
          bottom:         10,
          left:           12,
          fontFamily:    "var(--font-body)",
          fontSize:       "10px",
          letterSpacing:  "1.5px",
          color:          "rgba(255,252,242,0.5)",
          textShadow:    "0 1px 3px rgba(0,0,0,0.5)",
        }}
      >
        {String(index + 1).padStart(3, "0")}
      </span>

      {/* Selection badge */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            exit={{   scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{
              position:       "absolute",
              top:             10,
              right:           10,
              width:           26,
              height:          26,
              borderRadius:   "50%",
              background:     "var(--ink)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
            }}
          >
            <Check size={13} color="var(--off-white)" strokeWidth={2.5} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unselected ring hint */}
      {!isSelected && (
        <div
          style={{
            position:   "absolute",
            top:         10,
            right:       10,
            width:       26,
            height:      26,
            borderRadius: "50%",
            border:      "1.5px solid rgba(255,252,242,0.35)",
          }}
        />
      )}
    </motion.div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ photos, index, selections, onClose, onNav, onToggle, onCommentChange }) {
  const photo = photos[index];
  const photoId = photo?.id;
  const isSelected = selections.has(photoId);
  const comment = selections.get(photoId) ?? "";

  useEffect(() => {
    const fn = (e) => {
      const inText = e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT";
      if (e.key === "Escape")                    onClose();
      if (e.key === "ArrowLeft"  && !inText)     onNav(-1);
      if (e.key === "ArrowRight" && !inText)     onNav(1);
      if (e.key === " "          && !inText)     { e.preventDefault(); onToggle(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, onNav, onToggle]);

  if (!photo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{   opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position:       "fixed",
        inset:           0,
        zIndex:          200,
        background:     "rgba(14,12,11,0.94)",
        backdropFilter: "blur(8px)",
        display:        "flex",
        flexDirection:  "column",
      }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "16px 20px",
          borderBottom:   "0.5px solid rgba(255,252,242,0.08)",
          flexShrink:      0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          style={{
            fontFamily:    "var(--font-body)",
            fontSize:       "10px",
            letterSpacing:  "2px",
            textTransform:  "uppercase",
            color:          "rgba(255,252,242,0.3)",
          }}
        >
          {index + 1} / {photos.length}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none", border: "none",
            color: "rgba(255,252,242,0.5)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: "var(--font-body)", fontSize: "10px",
            letterSpacing: "2px", textTransform: "uppercase",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,252,242,0.9)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,252,242,0.5)")}
        >
          <X size={14} strokeWidth={1.5} /> Close
        </button>
      </div>

      {/* Image area */}
      <div
        style={{
          flex: 1, display: "flex", alignItems: "center",
          justifyContent: "center", position: "relative",
          padding: "20px 60px", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={photo.id}
            src={getPickPhotoUrl(photo.storage_path)}
            alt=""
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{   opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            style={{
              maxWidth: "100%", maxHeight: "100%",
              objectFit: "contain",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          />
        </AnimatePresence>

        {/* Nav arrows */}
        {index > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNav(-1); }}
            style={arrowStyle("left")}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--off-white)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,252,242,0.4)")}
          >
            <ChevronLeft size={28} strokeWidth={1.5} />
          </button>
        )}
        {index < photos.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNav(1); }}
            style={arrowStyle("right")}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--off-white)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,252,242,0.4)")}
          >
            <ChevronRight size={28} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Bottom panel */}
      <div
        style={{
          borderTop:   "0.5px solid rgba(255,252,242,0.08)",
          padding:     "16px 24px",
          display:     "flex",
          gap:          16,
          alignItems:  "flex-end",
          background:  "rgba(14,12,11,0.6)",
          flexShrink:   0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Comment */}
        <div style={{ flex: 1 }}>
          <label
            style={{
              display:       "block",
              fontFamily:    "var(--font-body)",
              fontSize:       "9px",
              letterSpacing:  "2px",
              textTransform:  "uppercase",
              color:          "rgba(255,252,242,0.25)",
              marginBottom:   7,
            }}
          >
            Add a comment (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(photoId, e.target.value)}
            placeholder="Notes for the photographer…"
            rows={2}
            style={{
              width:       "100%",
              background:  "rgba(255,252,242,0.05)",
              border:      "0.5px solid rgba(255,252,242,0.15)",
              padding:     "10px 14px",
              color:       "rgba(255,252,242,0.85)",
              fontFamily:  "var(--font-body)",
              fontSize:     "13px",
              resize:      "none",
              outline:     "none",
              transition:  "border-color 0.2s",
              boxSizing:   "border-box",
            }}
            onFocus={(e)  => (e.target.style.borderColor = "rgba(255,252,242,0.4)")}
            onBlur={(e)   => (e.target.style.borderColor = "rgba(255,252,242,0.15)")}
          />
        </div>

        {/* Select / Deselect */}
        <button
          onClick={onToggle}
          style={{
            padding:       "12px 24px",
            background:    isSelected ? "var(--off-white)" : "transparent",
            color:         isSelected ? "var(--ink)" : "rgba(255,252,242,0.7)",
            border:        `0.5px solid ${isSelected ? "var(--off-white)" : "rgba(255,252,242,0.3)"}`,
            fontFamily:    "var(--font-body)",
            fontSize:       "10px",
            letterSpacing:  "2.5px",
            textTransform:  "uppercase",
            cursor:        "pointer",
            display:       "flex",
            alignItems:    "center",
            gap:            8,
            transition:    "all 0.2s",
            flexShrink:     0,
            minWidth:       140,
            justifyContent: "center",
          }}
          onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = "rgba(255,252,242,0.7)"; e.currentTarget.style.color = "var(--off-white)"; }}}
          onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = "rgba(255,252,242,0.3)"; e.currentTarget.style.color = "rgba(255,252,242,0.7)"; }}}
        >
          {isSelected ? <><Check size={12} strokeWidth={2.5} /> Selected</> : "Select Photo"}
        </button>
      </div>
    </motion.div>
  );
}

const arrowStyle = (side) => ({
  position:   "absolute",
  [side]:      0,
  top:        "50%",
  transform:  "translateY(-50%)",
  background: "none",
  border:     "none",
  color:      "rgba(255,252,242,0.4)",
  cursor:     "pointer",
  padding:    "16px",
  transition: "color 0.2s",
  display:    "flex",
});

// ─── Sticky footer bar ────────────────────────────────────────────────────────
function FooterBar({ count, maxSelections, onSubmit, submitting, submitted }) {
  const over = maxSelections > 0 && count > maxSelections;

  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      style={{
        position:       "fixed",
        bottom: 0, left: 0, right: 0,
        zIndex:          100,
        background:     "rgba(237,232,220,0.95)",
        backdropFilter: "blur(18px)",
        borderTop:      "0.5px solid var(--border)",
        padding:        "14px clamp(20px, 5vw, 48px)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        gap:             12,
      }}
    >
      <p
        style={{
          fontFamily:    "var(--font-body)",
          fontSize:       "11px",
          letterSpacing:  "1.5px",
          textTransform:  "uppercase",
          color:          over ? "#c0392b" : "var(--ink-muted)",
          margin:          0,
        }}
      >
        {count} photo{count !== 1 ? "s" : ""} selected
        {maxSelections > 0 && (
          <span style={{ color: over ? "#c0392b" : "var(--ink-faint)" }}>
            {" "}/ {maxSelections} max
          </span>
        )}
      </p>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {submitted && (
          <span
            style={{
              fontFamily:    "var(--font-body)",
              fontSize:       "10px",
              letterSpacing:  "1.5px",
              textTransform:  "uppercase",
              color:          "var(--ink-muted)",
            }}
          >
            ✓ Sent
          </span>
        )}
        <button
          onClick={onSubmit}
          disabled={count === 0 || submitting || over}
          style={{
            padding:        "11px 24px",
            background:     count === 0 || over ? "transparent" : "var(--ink)",
            color:          count === 0 || over ? "var(--ink-faint)" : "var(--off-white)",
            border:         `0.5px solid ${count === 0 || over ? "var(--border)" : "var(--ink)"}`,
            fontFamily:     "var(--font-body)",
            fontSize:        "10px",
            letterSpacing:   "2.5px",
            textTransform:   "uppercase",
            cursor:         count === 0 || over ? "not-allowed" : "pointer",
            transition:     "all 0.2s",
          }}
          onMouseEnter={(e) => { if (count > 0 && !over) e.currentTarget.style.background = "rgba(14,12,11,0.75)"; }}
          onMouseLeave={(e) => { if (count > 0 && !over) e.currentTarget.style.background = "var(--ink)"; }}
        >
          {submitting ? "Sending…" : "Send to Photographer"}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Success toast ────────────────────────────────────────────────────────────
function SuccessToast({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{   opacity: 0, y: 20,  scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
      style={{
        position:       "fixed",
        bottom:          100,
        left:            20,
        right:           20,
        margin:         "0 auto",
        maxWidth:        440,
        zIndex:          300,
        background:     "var(--ink)",
        border:         "0.5px solid rgba(255,252,242,0.12)",
        padding:        "18px 24px",
        display:        "flex",
        alignItems:     "center",
        gap:             14,
        boxShadow:      "0 24px 60px rgba(0,0,0,0.35)",
        pointerEvents:  "none",
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 28 }}
        style={{
          width:          30,
          height:         30,
          borderRadius:  "50%",
          background:    "rgba(76,175,114,0.18)",
          border:        "0.5px solid rgba(76,175,114,0.45)",
          display:       "flex",
          alignItems:    "center",
          justifyContent:"center",
          flexShrink:     0,
        }}
      >
        <Check size={13} color="#4caf72" strokeWidth={2.5} />
      </motion.div>
      <div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--off-white)", margin: 0 }}>
          Selections sent
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "1px", color: "rgba(255,252,242,0.35)", margin: "3px 0 0" }}>
          Your photographer will receive your picks
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ClientPicks() {
  const { galleryId } = useParams();
  const { gallery, photos, selections: initialSelections, submittedAt, loading, error } = usePickGallery(galleryId);

  // selections: Map<photoId, comment>
  const [selections, setSelections] = useState(new Map());
  const [lbIndex, setLbIndex]       = useState(null); // null = closed
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Hydrate selections from DB on load
  useEffect(() => {
    if (initialSelections.length > 0) {
      const map = new Map(initialSelections.map(s => [s.photo_id, s.comment || ""]));
      setSelections(map);
    }
    if (submittedAt) setSubmitted(true);
  }, [initialSelections, submittedAt]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lbIndex !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lbIndex]);

  const toggleSelection = useCallback((photoId) => {
    setSelections(prev => {
      const next = new Map(prev);
      const max  = gallery?.max_selections || 0;
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        if (max > 0 && next.size >= max) return prev; // at limit
        next.set(photoId, "");
      }
      return next;
    });
  }, [gallery]);

  const setComment = useCallback((photoId, comment) => {
    setSelections(prev => {
      if (!prev.has(photoId)) return prev;
      const next = new Map(prev);
      next.set(photoId, comment);
      return next;
    });
  }, []);

  const handleLbToggle = useCallback(() => {
    if (lbIndex === null) return;
    toggleSelection(photos[lbIndex]?.id);
  }, [lbIndex, photos, toggleSelection]);

  const handleLbCommentChange = useCallback((photoId, comment) => {
    setSelections(prev => {
      const next = new Map(prev);
      // Allow writing comment even if not yet selected (pending)
      next.set(photoId, comment);
      return next;
    });
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    // Only submit photos that are actually in selections Map AND have been marked (not just typed a comment)
    const { error } = await submitPickSelections(galleryId, selections);
    setSubmitting(false);
    if (error) { setSubmitError(error); return; }
    setSubmitted(true);
    setShowSuccess(true);
  };

  // ── Loading / error ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100svh", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,252,242,0.3)" }}
        >
          Loading gallery…
        </motion.div>
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div style={{ minHeight: "100svh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 5vw, 56px)", color: "var(--ink)", marginBottom: 16 }}>Gallery not found.</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--ink-muted)", marginBottom: 32 }}>The link may be incorrect or the gallery has been removed.</p>
        <Link to="/" style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--ink)", textDecoration: "none", borderBottom: "0.5px solid var(--border)", paddingBottom: 2 }}>Back to Home</Link>
      </div>
    );
  }

  const selCount = selections.size;
  const max = gallery.max_selections || 0;

  return (
    <>
      <PicksNavbar
        galleryName={gallery.name}
        selectionCount={selCount}
        maxSelections={max}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ minHeight: "100svh" }}
      >
        {/* ── Dark hero panel ── */}
        <div
          style={{
            background:    "var(--ink)",
            padding:       "clamp(100px, 14vh, 140px) clamp(24px, 6vw, 80px) clamp(48px, 7vh, 80px)",
            minHeight:      "50svh",
            display:       "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          {gallery.client_name && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                fontFamily:    "var(--font-body)",
                fontSize:       "10px",
                letterSpacing:  "3px",
                textTransform:  "uppercase",
                color:          "rgba(255,252,242,0.3)",
                marginBottom:   "clamp(12px, 2vh, 20px)",
              }}
            >
              For {gallery.client_name}
            </motion.p>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.6 }}
            style={{
              fontFamily:            "var(--font-display)",
              fontWeight:             900,
              fontSize:               "clamp(40px, 6vw, 84px)",
              letterSpacing:         "-0.03em",
              lineHeight:             0.9,
              textTransform:          "uppercase",
              color:                  "var(--off-white)",
              fontVariationSettings:  "'opsz' 144",
              margin:                 0,
            }}
          >
            {gallery.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              fontFamily:    "var(--font-display)",
              fontStyle:     "italic",
              fontWeight:    300,
              fontSize:      "clamp(20px, 2.8vw, 36px)",
              letterSpacing: "-0.01em",
              color:         "rgba(255,252,242,0.35)",
              margin:        "8px 0 0",
            }}
          >
            Pick your favorites.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            style={{
              display:    "flex",
              gap:         24,
              marginTop:  "clamp(24px, 4vh, 40px)",
              flexWrap:   "wrap",
              alignItems: "center",
            }}
          >
            <span style={tagStyle}>{photos.length} photos</span>
            {max > 0 && <span style={tagStyle}>Choose up to {max}</span>}
            <span style={tagStyle}>Click a photo to select · Add a comment · Send when done</span>
          </motion.div>

          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop:   "clamp(20px, 3vh, 28px)",
                padding:     "10px 16px",
                border:      "0.5px solid rgba(76,175,114,0.4)",
                background:  "rgba(76,175,114,0.08)",
                display:     "inline-flex",
                alignItems:  "center",
                gap:          8,
                alignSelf:   "flex-start",
              }}
            >
              <Check size={12} color="#4caf72" strokeWidth={2.5} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(76,175,114,0.8)" }}>
                Selections sent — you can still update them
              </span>
            </motion.div>
          )}
        </div>

        {/* ── Photo grid ── */}
        <div
          style={{
            background: "var(--bg)",
            padding:    "clamp(28px, 4vh, 48px) clamp(16px, 4vw, 40px) 120px",
          }}
        >
          {photos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--ink-muted)", fontFamily: "var(--font-body)", fontSize: "13px" }}>
              No photos in this gallery yet.
            </div>
          ) : (
            <>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    marginBottom: 20,
                    padding:      "12px 16px",
                    background:   "rgba(14,12,11,0.05)",
                    border:       "0.5px solid rgba(14,12,11,0.15)",
                    fontFamily:   "var(--font-body)",
                    fontSize:      "11px",
                    color:        "var(--ink)",
                    letterSpacing: "0.5px",
                  }}
                >
                  Error: {submitError}
                </motion.div>
              )}

              <div
                style={{
                  display:               "grid",
                  gridTemplateColumns:   "repeat(auto-fill, minmax(260px, 1fr))",
                  gap:                   "8px",
                }}
              >
                {photos.map((photo, i) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    index={i}
                    isSelected={selections.has(photo.id)}
                    onClick={() => setLbIndex(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lbIndex !== null && (
          <Lightbox
            photos={photos}
            index={lbIndex}
            selections={selections}
            onClose={() => setLbIndex(null)}
            onNav={(dir) => setLbIndex(i => Math.max(0, Math.min(photos.length - 1, i + dir)))}
            onToggle={handleLbToggle}
            onCommentChange={handleLbCommentChange}
          />
        )}
      </AnimatePresence>

      {/* Success toast */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessToast onDone={() => setShowSuccess(false)} />
        )}
      </AnimatePresence>

      {/* Sticky footer */}
      <FooterBar
        count={selCount}
        maxSelections={max}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitted={submitted}
      />

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </>
  );
}

const tagStyle = {
  fontFamily:    "var(--font-body)",
  fontSize:       "10px",
  letterSpacing:  "2px",
  textTransform:  "uppercase",
  color:          "rgba(255,252,242,0.2)",
};
