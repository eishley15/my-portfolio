import { memo, useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { usePickGallery, submitPickSelections, getPickPhotoUrl } from "../hooks/usePickGallery";
import { useBodyScrollLock, scrollIntoViewInstant, isInViewport } from "../hooks/useBodyScrollLock";
import LightboxStage from "../components/lightbox/LightboxStage";
import "./ClientPicks.css";

const IS_TOUCH = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

// ─── Minimal top nav (no CardNav, no hamburger — just the brand) ──────────────
function PicksNavbar({ selectionCount, maxSelections }) {
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
// Tap the photo to view it; tap the circle to select without leaving the grid.
const PhotoCard = memo(function PhotoCard({ photo, index, isSelected, onOpen, onToggle }) {
  const [loaded,  setLoaded]  = useState(false);
  const [errored, setErrored] = useState(false);
  const num = String(index + 1).padStart(3, "0");

  // Cached images can finish before React attaches onLoad
  const imgRef = useCallback((img) => {
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <div
      className="pk-card"
      data-pick-index={index}
      data-selected={isSelected ? "true" : undefined}
      role="button"
      tabIndex={0}
      aria-label={`View photo ${index + 1}`}
      onClick={() => onOpen(index)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(index); }
      }}
    >
      {!loaded && !errored && <div className="pk-shimmer" aria-hidden="true" />}

      {errored ? (
        <span className="pk-card-error">{num}</span>
      ) : (
        <img
          ref={imgRef}
          src={getPickPhotoUrl(photo.storage_path)}
          alt={`Photo ${index + 1}`}
          loading={index < 6 ? "eager" : "lazy"}
          fetchpriority={index < 4 ? "high" : undefined}
          decoding="async"
          draggable={false}
          data-loaded={loaded ? "true" : "false"}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      )}

      <span className="pk-num">{num}</span>

      <button
        type="button"
        className="pk-select"
        aria-pressed={isSelected}
        aria-label={isSelected ? `Deselect photo ${index + 1}` : `Select photo ${index + 1}`}
        onClick={(e) => { e.stopPropagation(); onToggle(photo.id); }}
      >
        <span className="pk-select-dot">{isSelected && <Check size={13} strokeWidth={2.5} />}</span>
      </button>
    </div>
  );
});

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const getPickSrc = (p) => getPickPhotoUrl(p.storage_path);
const getPickKey = (p) => p.id;
const getPickAlt = (p, i) => `Photo ${i + 1}`;

function Lightbox({ photos, index, selections, atLimit, maxSelections, onClose, onIndexChange, onToggle, onCommentChange }) {
  const rootRef  = useRef(null);
  const stageRef = useRef(null);
  const backdrop = useMotionValue(1);
  const photo      = photos[index];
  const photoId    = photo?.id;
  const isSelected = selections.has(photoId);
  const comment    = selections.get(photoId) ?? "";
  const blocked    = !isSelected && atLimit;

  useBodyScrollLock(true);

  useEffect(() => { rootRef.current?.focus({ preventScroll: true }); }, []);

  // iOS shrinks only the visual viewport when the keyboard opens — follow it so
  // the note field and Select button stay visible above the keyboard.
  useEffect(() => {
    const vv = window.visualViewport;
    const el = rootRef.current;
    if (!vv || !el) return undefined;
    const update = () => {
      el.style.height = `${vv.height}px`;
      el.style.top    = `${vv.offsetTop}px`;
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  useEffect(() => {
    const fn = (e) => {
      const inText = e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT";
      if (e.key === "Escape")                onClose();
      if (e.key === "ArrowLeft"  && !inText) stageRef.current?.prev();
      if (e.key === "ArrowRight" && !inText) stageRef.current?.next();
      if (e.key === " "          && !inText) { e.preventDefault(); onToggle(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, onToggle]);

  if (!photo) return null;

  return (
    <motion.div
      ref={rootRef}
      className="pk-lb"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{   opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div className="pk-lb-bg" style={{ opacity: backdrop }} />

      {/* Top bar */}
      <motion.div className="pk-lb-top" style={{ opacity: backdrop }}>
        <span className="pk-lb-count" aria-live="polite">{index + 1} / {photos.length}</span>
        <button type="button" className="pk-lb-close" onClick={onClose}>
          <X size={16} strokeWidth={1.5} /> Close
        </button>
      </motion.div>

      {/* Photo — swipe to browse, pinch / double-tap to zoom, swipe down to close */}
      <div className="pk-lb-stage">
        <LightboxStage
          ref={stageRef}
          items={photos}
          index={index}
          onIndexChange={onIndexChange}
          getSrc={getPickSrc}
          getKey={getPickKey}
          getAlt={getPickAlt}
          onClose={onClose}
          backdropOpacity={backdrop}
        />
        {index > 0 && (
          <button type="button" className="pk-lb-arrow pk-lb-arrow-prev" onClick={() => stageRef.current?.prev()} aria-label="Previous photo">
            <ChevronLeft size={28} strokeWidth={1.5} />
          </button>
        )}
        {index < photos.length - 1 && (
          <button type="button" className="pk-lb-arrow pk-lb-arrow-next" onClick={() => stageRef.current?.next()} aria-label="Next photo">
            <ChevronRight size={28} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Bottom panel — notes belong to a selection, so the field appears once selected */}
      <motion.div className="pk-lb-panel" style={{ opacity: backdrop }}>
        {isSelected && (
          <label className="pk-lb-label" htmlFor="pk-note">Note for the photographer (optional)</label>
        )}
        {blocked && (
          <p className="pk-lb-label" data-tone="limit">
            You&rsquo;ve chosen {maxSelections} — deselect one to pick this photo
          </p>
        )}
        <div className="pk-lb-row">
          {isSelected && (
            <textarea
              id="pk-note"
              className="pk-note"
              value={comment}
              onChange={(e) => onCommentChange(photoId, e.target.value)}
              placeholder="Notes for the photographer…"
              rows={2}
            />
          )}
          <button
            type="button"
            className="pk-lb-select"
            data-selected={isSelected ? "true" : undefined}
            aria-pressed={isSelected}
            disabled={blocked}
            onClick={onToggle}
          >
            {isSelected ? <><Check size={12} strokeWidth={2.5} /> Selected</> : blocked ? "Limit reached" : "Select Photo"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Sticky footer bar ────────────────────────────────────────────────────────
function FooterBar({ count, maxSelections, onSubmit, submitting, submitted, limitHit }) {
  const over   = maxSelections > 0 && count > maxSelections;
  const active = count > 0 && !submitting && !over;

  return (
    <motion.div className="pk-footer" initial={{ y: 80 }} animate={{ y: 0 }}>
      <div className="pk-footer-count" aria-live="polite">
        {limitHit ? (
          <span className="pk-footer-limit">Limit of {maxSelections} reached — deselect one first</span>
        ) : (
          <>
            <span className="pk-footer-num" data-over={over ? "true" : undefined}>
              {count}
              {maxSelections > 0 && <span className="pk-footer-max"> / {maxSelections}</span>}
            </span>
            <span className="pk-footer-label">
              {count === 1 ? "photo" : "photos"} selected{submitted ? " · ✓ Sent" : ""}
            </span>
          </>
        )}
      </div>

      <button className="pk-send" onClick={onSubmit} disabled={!active} data-active={active ? "true" : undefined}>
        {submitting ? "Sending…" : (
          <>
            <span className="pk-send-long">Send to Photographer</span>
            <span className="pk-send-short">Send picks</span>
          </>
        )}
      </button>
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
  const [selections, setSelections]     = useState(new Map());
  const [hydratedFrom, setHydratedFrom] = useState(null);
  const [lbIndex, setLbIndex]           = useState(null); // null = closed
  const [submitting, setSubmitting]     = useState(false);
  const [submittedNow, setSubmittedNow] = useState(false);
  const [showSuccess, setShowSuccess]   = useState(false);
  const [submitError, setSubmitError]   = useState(null);
  const [limitHit, setLimitHit]         = useState(false);
  const selectionsRef = useRef(selections);
  const limitTimer    = useRef(0);
  const lastViewed    = useRef(null);

  const max       = gallery?.max_selections || 0;
  const submitted = submittedNow || Boolean(submittedAt);

  // Hydrate selections from the DB once they arrive
  if (!loading && initialSelections !== hydratedFrom) {
    setHydratedFrom(initialSelections);
    setSelections(new Map(initialSelections.map((s) => [s.photo_id, s.comment || ""])));
  }

  useEffect(() => { selectionsRef.current = selections; });
  useEffect(() => () => clearTimeout(limitTimer.current), []);

  // No film grain over client photos on this page
  useEffect(() => {
    document.body.classList.add("client-view");
    return () => document.body.classList.remove("client-view");
  }, []);

  const flashLimit = useCallback(() => {
    setLimitHit(true);
    clearTimeout(limitTimer.current);
    limitTimer.current = setTimeout(() => setLimitHit(false), 2600);
  }, []);

  const toggleSelection = useCallback((photoId) => {
    const current = selectionsRef.current;
    if (!current.has(photoId) && max > 0 && current.size >= max) { flashLimit(); return; }
    setSelections((prev) => {
      const next = new Map(prev);
      if (next.has(photoId)) next.delete(photoId);
      else if (max > 0 && next.size >= max) return prev; // at limit
      else next.set(photoId, "");
      return next;
    });
  }, [max, flashLimit]);

  // Notes only attach to selected photos (so typing can't bypass the limit)
  const setComment = useCallback((photoId, comment) => {
    setSelections((prev) => {
      if (!prev.has(photoId)) return prev;
      const next = new Map(prev);
      next.set(photoId, comment);
      return next;
    });
  }, []);

  const openLightbox = useCallback((index) => {
    lastViewed.current = index;
    setLbIndex(index);
  }, []);

  const changeLightboxIndex = useCallback((index) => {
    lastViewed.current = index;
    setLbIndex(index);
  }, []);

  const closeLightbox = useCallback(() => setLbIndex(null), []);
  const hideSuccess   = useCallback(() => setShowSuccess(false), []);

  const handleLbToggle = useCallback(() => {
    if (lbIndex === null) return;
    toggleSelection(photos[lbIndex]?.id);
  }, [lbIndex, photos, toggleSelection]);

  // After closing, bring the last photo viewed into view (it may be far from where the viewer opened)
  const revealLastViewed = useCallback(() => {
    const i = lastViewed.current;
    if (i === null) return;
    let frames = 0;
    const tick = () => {
      if (document.body.style.position === "fixed" && frames++ < 10) { requestAnimationFrame(tick); return; }
      const el = document.querySelector(`[data-pick-index="${i}"]`);
      if (el && !isInViewport(el, 90)) scrollIntoViewInstant(el, "center");
    };
    requestAnimationFrame(tick);
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    const { error: err } = await submitPickSelections(galleryId, selections);
    setSubmitting(false);
    if (err) { setSubmitError(err); return; }
    setSubmittedNow(true);
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
  const howTo = IS_TOUCH
    ? "Tap ○ to select · Tap a photo to view & add a note · Send when done"
    : "Click ○ to select · Click a photo to view & add a note · Send when done";

  return (
    <>
      <PicksNavbar selectionCount={selCount} maxSelections={max} />

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
            padding:       "clamp(100px, 14vh, 140px) clamp(24px, 6vw, 80px) clamp(40px, 7vh, 80px)",
            minHeight:      "clamp(360px, 50svh, 640px)",
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
                color:          "rgba(255,252,242,0.45)",
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
              overflowWrap:          "anywhere",
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
              color:         "rgba(255,252,242,0.45)",
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
              gap:        "10px 24px",
              marginTop:  "clamp(24px, 4vh, 40px)",
              flexWrap:   "wrap",
              alignItems: "center",
            }}
          >
            <span style={tagStyle}>{photos.length} photos</span>
            {max > 0 && <span style={tagStyle}>Choose up to {max}</span>}
            <span style={{ ...tagStyle, lineHeight: 1.6 }}>{howTo}</span>
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
            padding:    "clamp(16px, 4vh, 48px) clamp(4px, 4vw, 40px) calc(env(safe-area-inset-bottom, 0px) + 120px)",
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

              <div className="pk-grid">
                {photos.map((photo, i) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    index={i}
                    isSelected={selections.has(photo.id)}
                    onOpen={openLightbox}
                    onToggle={toggleSelection}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence onExitComplete={revealLastViewed}>
        {lbIndex !== null && (
          <Lightbox
            key="lightbox"
            photos={photos}
            index={lbIndex}
            selections={selections}
            atLimit={max > 0 && selCount >= max}
            maxSelections={max}
            onClose={closeLightbox}
            onIndexChange={changeLightboxIndex}
            onToggle={handleLbToggle}
            onCommentChange={setComment}
          />
        )}
      </AnimatePresence>

      {/* Success toast */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessToast onDone={hideSuccess} />
        )}
      </AnimatePresence>

      {/* Sticky footer */}
      <FooterBar
        count={selCount}
        maxSelections={max}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitted={submitted}
        limitHit={limitHit}
      />
    </>
  );
}

const tagStyle = {
  fontFamily:    "var(--font-body)",
  fontSize:       "10px",
  letterSpacing:  "2px",
  textTransform:  "uppercase",
  color:          "rgba(255,252,242,0.5)",
};
