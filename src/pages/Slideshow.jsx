import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronLeft, ChevronRight, Maximize, Minimize, X, Volume2, VolumeX } from "lucide-react";

import { isLoggedIn } from "../lib/galleryAuth";
import { useGalleryConfig } from "../hooks/useGalleryConfig";
import { useSwipe } from "../hooks/useSwipe";

const HIDE_DELAY = 3000;
const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Slideshow() {
  const navigate = useNavigate();
  const { config, photos, loading } = useGalleryConfig();

  const [index,   setIndex]   = useState(0);
  const [playing, setPlaying] = useState(true);
  const [fsMode,  setFsMode]  = useState(false);
  const [showUI,  setShowUI]  = useState(true);
  const [muted,   setMuted]   = useState(true);

  const wrapRef  = useRef(null);
  const audioRef = useRef(null);
  const hideTimer = useRef(null);

  const intervalMs = config?.slideshow_interval_ms ?? 5000;

  useEffect(() => { if (!isLoggedIn()) navigate("/gallery"); }, [navigate]);

  const go = useCallback((n) => {
    setIndex((i) => (i + n + (photos.length || 1)) % (photos.length || 1));
  }, [photos.length]);

  // Autoplay
  useEffect(() => {
    if (!playing || photos.length < 2) return;
    const id = setInterval(() => go(1), intervalMs);
    return () => clearInterval(id);
  }, [playing, intervalMs, go, photos.length]);

  // Keyboard
  useEffect(() => {
    function onKey(e) {
      if (e.key === " ")          { e.preventDefault(); setPlaying((p) => !p); }
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft")  go(-1);
      if (e.key === "Escape")     navigate("/gallery");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, navigate]);

  // Auto-hide UI
  function bumpUI() {
    setShowUI(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowUI(false), HIDE_DELAY);
  }
  useEffect(() => { bumpUI(); return () => clearTimeout(hideTimer.current); }, []); // eslint-disable-line

  useSwipe(wrapRef, { onLeft: () => go(1), onRight: () => go(-1) });

  // Fix: React doesn't reliably set the `muted` DOM attribute via props.
  // Force-mute and start playback imperatively whenever the music URL is ready.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !config?.slideshow_music_url) return;
    el.muted = true; // enforce muted DOM attribute (bypasses React muted prop bug)
    el.play().catch(() => {}); // start playback; browsers allow muted autoplay
  }, [config?.slideshow_music_url]);

  function toggleFS() {
    if (!fsMode) { wrapRef.current?.requestFullscreen?.(); setFsMode(true); }
    else         { document.exitFullscreen?.();             setFsMode(false); }
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    if (!audioRef.current) return;
    audioRef.current.muted = next;
    // If audio was never started (e.g. autoplay was blocked), kick it off now.
    if (audioRef.current.paused) audioRef.current.play().catch(() => {});
  }

  if (!isLoggedIn() || loading) {
    return (
      <div style={{ minHeight: "100svh", background: "#0e0c0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,252,242,0.3)" }}>
          {loading ? "Loading…" : ""}
        </p>
      </div>
    );
  }

  if (!photos.length) {
    return (
      <div style={{ minHeight: "100svh", background: "#0e0c0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,252,242,0.3)" }}>No photos available.</p>
      </div>
    );
  }

  const current = photos[index];
  const bg      = config?.cover_bg_color || "#0e0c0b";
  const r       = reduced();

  return (
    <div
      ref={wrapRef}
      onMouseMove={bumpUI}
      onClick={bumpUI}
      style={{ position: "fixed", inset: 0, background: bg, overflow: "hidden", cursor: showUI ? "default" : "none" }}
    >
      {/* Slide with Ken Burns */}
      <AnimatePresence mode="crossfade">
        <motion.img
          key={current.id}
          src={current.url}
          alt={current.filename}
          initial={{ opacity: 0, scale: r ? 1 : 1.04 }}
          animate={{ opacity: 1, scale: r ? 1 : 1.09 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.9 }, scale: { duration: intervalMs / 1000, ease: "linear" } }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
        />
      </AnimatePresence>

      {config?.slideshow_music_url && (
        <audio ref={audioRef} src={config.slideshow_music_url} loop muted={muted} autoPlay />
      )}

      {/* UI overlay */}
      <AnimatePresence>
        {showUI && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>

            {/* Top bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)", pointerEvents: "auto" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", margin: 0 }}>
                {config?.gallery_title || config?.client_name}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {config?.slideshow_music_url && (
                  <button onClick={toggleMute} style={btn} aria-label={muted ? "Unmute" : "Mute"}>
                    {muted ? <VolumeX size={16} stroke="white" /> : <Volume2 size={16} stroke="white" />}
                  </button>
                )}
                <button onClick={toggleFS} style={btn} aria-label="Toggle fullscreen">
                  {fsMode ? <Minimize size={16} stroke="white" /> : <Maximize size={16} stroke="white" />}
                </button>
                <button onClick={() => navigate("/gallery")} style={btn} aria-label="Exit slideshow">
                  <X size={16} stroke="white" />
                </button>
              </div>
            </div>

            {/* Arrows */}
            <button onClick={() => go(-1)} style={{ ...btn, position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", pointerEvents: "auto" }} aria-label="Previous">
              <ChevronLeft size={28} stroke="white" />
            </button>
            <button onClick={() => go(1)} style={{ ...btn, position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", pointerEvents: "auto" }} aria-label="Next">
              <ChevronRight size={28} stroke="white" />
            </button>

            {/* Bottom bar */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 28px", background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)", display: "flex", alignItems: "center", gap: 16, pointerEvents: "auto" }}>
              <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.15)", borderRadius: 1 }}>
                {playing && (
                  <motion.div key={`${index}-bar`} initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: intervalMs / 1000, ease: "linear" }}
                    style={{ height: "100%", background: "rgba(255,255,255,0.7)", borderRadius: 1 }} />
                )}
              </div>
              <button onClick={() => setPlaying((p) => !p)} style={btn} aria-label={playing ? "Pause" : "Play"}>
                {playing ? <Pause size={18} stroke="white" /> : <Play size={18} stroke="white" />}
              </button>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 1.5, color: "rgba(255,255,255,0.4)", margin: 0, minWidth: 52, textAlign: "right" }}>
                {index + 1} / {photos.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const btn = {
  width: 40, height: 40, borderRadius: "50%",
  background: "rgba(255,255,255,0.12)", border: "none",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", backdropFilter: "blur(8px)",
};
