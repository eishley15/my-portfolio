import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Play, Heart, MessageSquare, Send, X, CheckSquare } from "lucide-react";

import { isLoggedIn, clearToken, getAccessCodeFromToken } from "../lib/galleryAuth";
import { useGalleryConfig } from "../hooks/useGalleryConfig";
import { useFavorites } from "../hooks/useFavorites";
import { useDownloadZip } from "../hooks/useDownloadZip";
import { useResponsiveColumns } from "../hooks/useResponsiveColumns";
import { scrollIntoViewInstant, isInViewport } from "../hooks/useBodyScrollLock";
import { stickyHeaderOffset } from "../lib/galleryLayout";
import { useToast, ToastContainer } from "../components/Toast";
import { GallerySessionContext, DEFAULT_GALLERY_SESSION, OWNER_PERMISSIONS } from "../lib/gallerySession";

import AccessGate      from "../components/gallery/AccessGate";
import ExpiredNotice   from "../components/gallery/ExpiredNotice";
import GalleryHero     from "../components/gallery/GalleryHero";
import GalleryNav      from "../components/gallery/GalleryNav";
import SectionTabs     from "../components/gallery/SectionTabs";
import SectionHeader   from "../components/gallery/SectionHeader";
import MasonryGrid     from "../components/gallery/MasonryGrid";
import GalleryLightbox from "../components/gallery/GalleryLightbox";
import PinDialog       from "../components/gallery/PinDialog";
import "../components/gallery/gallery.css";

export default function Gallery() {
  const [loggedIn,      setLoggedIn]   = useState(isLoggedIn);
  const [lightbox,      setLightbox]   = useState(null); // { items, index } | null
  const [selectedItems, setSelected]   = useState([]);
  const [selectMode,    setSelectMode] = useState(false);
  const [viewTab,       setViewTab]    = useState("photos");
  const lastViewedId = useRef(null);

  // Testimonial state
  const [testimonialStatus, setTestimonialStatus] = useState("loading"); // loading | none | submitted
  const [testimonialQuote,  setTestimonialQuote]  = useState("");
  const [testimonialEvent,  setTestimonialEvent]  = useState("");
  const [testimonialSending, setTestimonialSending] = useState(false);

  const { toasts, addToast, removeToast } = useToast();
  const { downloadZip, isZipping, error: zipError, clearError } = useDownloadZip();
  const { config, scenes, photos, videos, files, loading, expired, error: configError, session, refetch } = useGalleryConfig();
  const { favorites, toggle: toggleFavorite } = useFavorites(addToast);

  const accessCode = getAccessCodeFromToken();

  // addToast is recreated every render; keep a stable error callback for memoised tiles
  const toastRef = useRef(addToast);
  useEffect(() => { toastRef.current = addToast; });
  const showError = useCallback((msg) => toastRef.current(msg, "error"), []);

  // ── Share-link session: role permissions + download PIN ───────────────────
  const permissions = session?.permissions ?? OWNER_PERMISSIONS;
  const [pinPrompt,   setPinPrompt]   = useState(null);   // { resolve } while the dialog is open
  const [pinVerified, setPinVerified] = useState(false);
  const pinRequiredRef = useRef(false);
  useEffect(() => { pinRequiredRef.current = Boolean(session?.pinRequired) && !pinVerified; });

  const askPin = useCallback(() => new Promise((resolve) => setPinPrompt({ resolve })), []);
  const closePin = useCallback((ok) => {
    setPinPrompt((prompt) => { prompt?.resolve(ok); return null; });
    if (ok) setPinVerified(true);
  }, []);

  // Runs a download, asking for the PIN first when the link has one, or after
  // the server answers pin_required. Resolves to null if the visitor cancels.
  const runDownload = useCallback(async (task) => {
    if (pinRequiredRef.current && !(await askPin())) return null;
    try {
      return await task();
    } catch (err) {
      if (err?.code === "pin_required") return (await askPin()) ? task() : null;
      if (err?.code === "role_forbidden") { showError(err.message); return null; }
      throw err;
    }
  }, [askPin, showError]);

  const sessionValue = useMemo(() => ({
    ...DEFAULT_GALLERY_SESSION,
    role:        session?.role ?? "owner",
    isShare:     Boolean(session?.isShare),
    permissions,
    pinRequired: Boolean(session?.pinRequired) && !pinVerified,
    runDownload,
  }), [session, permissions, pinVerified, runDownload]);

  function handleLogout()       { clearToken(); setPinVerified(false); setLoggedIn(false); }
  function handleLoginSuccess() { setLoggedIn(true); }

  useEffect(() => { if (loggedIn) refetch(); }, [loggedIn]); // eslint-disable-line

  // Check if client already submitted a testimonial
  const checkTestimonial = useCallback(async () => {
    if (!loggedIn) return;
    try {
      const token = localStorage.getItem("gallery_token");
      const res = await fetch("/api/gallery-favorites?type=testimonial", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setTestimonialStatus("none"); return; }
      const { testimonial } = await res.json();
      setTestimonialStatus(testimonial ? "submitted" : "none");
    } catch {
      setTestimonialStatus("none");
    }
  }, [loggedIn]);

  useEffect(() => { checkTestimonial(); }, [checkTestimonial]);

  // ── Per-gallery settings ──────────────────────────────────────────────────
  const bg       = config?.gallery_bg_color   || "#faf9f7";
  const text     = config?.gallery_text_color || "#3d2b2b";
  const cols     = config?.columns_count      || 4;
  const gap      = config?.grid_gap           ?? 4;
  const hdrStyle = config?.section_header_style || "dot";
  const downloadsEnabled   = config?.downloads_enabled !== false && permissions.download;
  const favoritesEnabled   = permissions.favorite;
  const testimonialEnabled = permissions.testimonial;
  const columns  = useResponsiveColumns(Math.max(2, Math.min(5, cols)));
  const placeholder = `${text}0f`;

  const showingGallery = loggedIn && configError !== "session_expired" && !expired;

  // Client pages hide the site navbar/back-to-top and the film-grain overlay
  useEffect(() => {
    if (!showingGallery) return undefined;
    document.body.classList.add("client-view");
    return () => document.body.classList.remove("client-view");
  }, [showingGallery]);

  // ── Photo lists (visual order = lightbox order) ───────────────────────────
  const unsortedPhotos = useMemo(() => photos.filter((f) => !f.scene_id), [photos]);
  const sceneGroups = useMemo(
    () => scenes.map((scene) => ({ scene, files: files.filter((f) => f.scene_id === scene.id && f.type === "photo") })),
    [scenes, files],
  );
  const photoSequence = useMemo(
    () => (scenes.length > 0 ? [...unsortedPhotos, ...sceneGroups.flatMap((g) => g.files)] : photos),
    [scenes.length, unsortedPhotos, sceneGroups, photos],
  );
  const favPhotos   = useMemo(() => photos.filter((f) => favorites.has(f.id)), [photos, favorites]);
  const selectedSet = useMemo(() => new Set(selectedItems), [selectedItems]);

  const lightboxList = viewTab === "favorites" ? favPhotos : viewTab === "videos" ? videos : photoSequence;

  // ── Lightbox ──────────────────────────────────────────────────────────────
  // The list is snapshotted on open so un-favoriting inside the viewer doesn't yank the photo away
  const openLightbox = useCallback((file) => {
    const index = Math.max(0, lightboxList.findIndex((f) => f.id === file.id));
    lastViewedId.current = file.id;
    setLightbox({ items: lightboxList, index });
  }, [lightboxList]);

  const changeLightboxIndex = useCallback((index) => {
    setLightbox((lb) => {
      if (!lb) return lb;
      lastViewedId.current = lb.items[index]?.id ?? lastViewedId.current;
      return { ...lb, index };
    });
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  // After closing, make sure the last photo viewed is on screen (the viewer may have
  // been swiped far from where it was opened). Waits for the scroll lock to release.
  const revealLastViewed = useCallback(() => {
    const id = lastViewedId.current;
    if (!id) return;
    let frames = 0;
    const tick = () => {
      if (document.body.style.position === "fixed" && frames++ < 10) { requestAnimationFrame(tick); return; }
      const el = document.querySelector(`[data-file-id="${CSS.escape(id)}"]`);
      if (el && !isInViewport(el, 140)) scrollIntoViewInstant(el, "center");
    };
    requestAnimationFrame(tick);
  }, []);

  // ── Selection ─────────────────────────────────────────────────────────────
  const toggleSelect = useCallback((id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }, []);

  function exitSelection() { setSelected([]); setSelectMode(false); }

  function switchTab(id) {
    setViewTab(id);
    exitSelection();
  }

  function scrollToGallery() {
    const el = document.querySelector(".g-sticky");
    if (!el) return;
    const navH = stickyHeaderOffset() - el.offsetHeight;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - navH, behavior: "smooth" });
  }

  async function handleSubmitTestimonial(e) {
    e.preventDefault();
    if (!testimonialQuote.trim() || testimonialSending) return;
    setTestimonialSending(true);
    try {
      const token = localStorage.getItem("gallery_token");
      const res = await fetch("/api/gallery-favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: "testimonial", quote: testimonialQuote, eventType: testimonialEvent }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        addToast(error || "Failed to submit. Please try again.", "error");
        return;
      }
      setTestimonialStatus("submitted");
      // Switch back to photos tab — the review tab disappears
      setViewTab("photos");
    } catch {
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setTestimonialSending(false);
    }
  }

  async function handleDownloadAll() {
    const r = await runDownload(() => downloadZip());
    if (!r) return;
    if (r.success) addToast("ZIP download started!", "success");
    else if (r.error) addToast(r.error, "error");
  }

  async function handleDownloadSelected() {
    if (!selectedItems.length) return;
    const names = files.filter((f) => selectedSet.has(f.id)).map((f) => f.filename);
    const r = await runDownload(() => downloadZip({ files: names }));
    if (!r) return;
    if (r.success) { addToast("ZIP download started!", "success"); exitSelection(); }
    else if (r.error) addToast(r.error, "error");
  }

  // ── Not logged in / session expired ─────────────────────────────────────────
  if (!loggedIn || configError === "session_expired") {
    return (
      <>
        <AccessGate onSuccess={handleLoginSuccess} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  // ── Gallery expired ──────────────────────────────────────────────────────────
  if (expired) return <ExpiredNotice config={config} />;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--ink)", opacity: 0.3 }}>Loading…</p>
      </div>
    );
  }

  const gridProps = {
    columns, gap, favorites, selectedSet, selectMode, downloadsEnabled, favoritesEnabled,
    onFavoriteToggle: toggleFavorite, onSelect: toggleSelect, onOpen: openLightbox,
    accessCode, onError: showError, placeholder,
  };

  const tabs = [
    { id: "photos", label: "Photos" },
    ...(favoritesEnabled ? [{ id: "favorites", label: "Favorites", icon: <Heart size={11} /> }] : []),
    ...(videos.length > 0 ? [{ id: "videos", label: "Videos", icon: <Play size={11} /> }] : []),
    // Review tab only shows if client hasn't submitted yet (and check is complete)
    ...(testimonialEnabled && testimonialStatus === "none" ? [{ id: "review", label: "Review", icon: <MessageSquare size={11} /> }] : []),
  ];

  const solidBtn   = { color: bg, background: text, border: "none" };
  const outlineBtn = { color: text, background: "transparent", border: `0.5px solid ${text}` };
  const showSelectionBar = downloadsEnabled && (selectMode || selectedItems.length > 0);

  // Download / select toolbar shared by the Photos and Favorites views
  const toolbar = (showDownloadAll) => (zipError || downloadsEnabled) && (
    <div style={{ padding: "clamp(16px,3vw,32px) var(--g-pad) clamp(12px,2vw,16px)", display: "flex", flexWrap: "wrap", gap: 10 }}>
      {zipError && (
        <div style={{ width: "100%", padding: "10px 16px", background: "rgba(200,50,50,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: text }}>
          {zipError}
          <button onClick={clearError} aria-label="Dismiss error" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: text, width: 32, height: 32 }}>×</button>
        </div>
      )}
      {downloadsEnabled && (
        <>
          {showDownloadAll && (
            <button className="g-btn" onClick={handleDownloadAll} disabled={isZipping} style={solidBtn}>
              <Download size={14} /> {isZipping ? "Zipping…" : "Download All"}
            </button>
          )}
          <button className="g-btn" onClick={() => (selectMode ? exitSelection() : setSelectMode(true))} aria-pressed={selectMode} style={outlineBtn}>
            {selectMode ? <><X size={14} /> Cancel</> : <><CheckSquare size={14} /> Select</>}
          </button>
        </>
      )}
    </div>
  );

  return (
    <GallerySessionContext.Provider value={sessionValue}>
      {/* Per-gallery CSS variables */}
      <style>{`:root { --g-bg: ${bg}; --g-text: ${text}; --g-gap: ${gap}px; }`}</style>

      <GalleryNav config={config} onLogout={handleLogout} onDownloadAll={handleDownloadAll} isZipping={isZipping} downloadsEnabled={downloadsEnabled} />

      <div style={{ background: bg, minHeight: "100svh", color: text }}>

        {/* Hero cover */}
        <GalleryHero config={config} onScrollToGallery={scrollToGallery} />

        {/* Sticky header: view tabs + (Photos) scene jump links, pinned under the nav */}
        <div className="g-sticky" style={{ background: bg, color: text, borderBottom: `0.5px solid ${text}18` }}>
          <div className="g-tabs">
            <div className="g-tabs-inner" role="tablist" aria-label="Gallery views">
              {tabs.map(({ id, label, icon }) => (
                <button key={id} type="button" role="tab" aria-selected={viewTab === id} className="g-tab" onClick={() => switchTab(id)}>
                  {icon}{label}
                  {id === "favorites" && favorites.size > 0 && (
                    <span style={{ fontSize: 9, opacity: 0.6 }}>({favorites.size})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {viewTab === "photos" && <SectionTabs scenes={scenes} textColor={text} />}
        </div>

        {/* ── PHOTOS view ────────────────────────────────────────────────── */}
        {viewTab === "photos" && (
          <>
            {toolbar(true)}
            <div style={{ padding: "0 var(--g-pad) 96px" }}>
              {scenes.length > 0 ? (
                <>
                  {unsortedPhotos.length > 0 && (
                    <section id="highlights">
                      <SectionHeader scene={{ name: "Highlights" }} variant={hdrStyle} textColor={text} />
                      <MasonryGrid files={unsortedPhotos} {...gridProps} />
                    </section>
                  )}
                  {sceneGroups.map(({ scene, files: sf }) => {
                    if (!sf.length) return null;
                    return (
                      <section key={scene.id} id={scene.slug}>
                        <SectionHeader scene={scene} variant={hdrStyle} textColor={text} />
                        <MasonryGrid files={sf} {...gridProps} />
                      </section>
                    );
                  })}
                </>
              ) : (
                <section id="highlights">
                  <MasonryGrid files={photos} {...gridProps} />
                </section>
              )}
            </div>
          </>
        )}

        {/* ── FAVORITES view ─────────────────────────────────────────────── */}
        {viewTab === "favorites" && (
          favPhotos.length === 0 ? (
            <div style={{ padding: "40px var(--g-pad) 96px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 12, opacity: 0.55, textAlign: "center" }}>
                <Heart size={36} strokeWidth={1} style={{ color: text }} />
                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: text, margin: 0 }}>No favorites yet</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: text, margin: 0, opacity: 0.8 }}>Tap the heart on any photo to save it here.</p>
              </div>
            </div>
          ) : (
            <>
              {toolbar(false)}
              <div style={{ padding: "0 var(--g-pad) 96px" }}>
                <MasonryGrid files={favPhotos} {...gridProps} />
              </div>
            </>
          )
        )}

        {/* ── REVIEW view ────────────────────────────────────────────────── */}
        {viewTab === "review" && (
          <div style={{ padding: "clamp(40px, 6vw, 80px) clamp(24px, 6vw, 80px) 80px", display: "flex", justifyContent: "center" }}>
            <div style={{ maxWidth: 560, width: "100%" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: text, opacity: 0.4, marginBottom: 12 }}>Share Your Experience</p>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-0.03em", lineHeight: 1, color: text, marginBottom: 32 }}>
                How was<br /><span style={{ fontStyle: "italic", fontWeight: 300 }}>your session?</span>
              </h2>
              <form onSubmit={handleSubmitTestimonial} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label htmlFor="review-event" style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: text, opacity: 0.5, marginBottom: 8 }}>
                    Event type <span style={{ opacity: 0.4 }}>(optional)</span>
                  </label>
                  <input
                    id="review-event"
                    type="text"
                    className="g-input"
                    value={testimonialEvent}
                    onChange={(e) => setTestimonialEvent(e.target.value)}
                    placeholder="e.g. Wedding, Debut, Portrait…"
                    maxLength={80}
                    style={{ width: "100%", padding: "12px 14px", background: "transparent", border: `0.5px solid ${text}30`, color: text, fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = `${text}80`)}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = `${text}30`)}
                  />
                </div>
                <div>
                  <label htmlFor="review-quote" style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: text, opacity: 0.5, marginBottom: 8 }}>
                    Your words <span style={{ opacity: 0.6 }}>*</span>
                  </label>
                  <textarea
                    id="review-quote"
                    className="g-input"
                    value={testimonialQuote}
                    onChange={(e) => setTestimonialQuote(e.target.value)}
                    placeholder="Tell us about your experience…"
                    required
                    maxLength={1000}
                    rows={5}
                    style={{ width: "100%", padding: "12px 14px", background: "transparent", border: `0.5px solid ${text}30`, color: text, fontFamily: "var(--font-body)", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6, transition: "border-color 0.2s" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = `${text}80`)}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = `${text}30`)}
                  />
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 1, color: text, opacity: 0.3, marginTop: 6, textAlign: "right" }}>{testimonialQuote.length}/1000</p>
                </div>
                <button
                  type="submit"
                  className="g-btn"
                  disabled={!testimonialQuote.trim() || testimonialSending}
                  style={{ ...solidBtn, alignSelf: "flex-start", minHeight: 44, padding: "0 24px", letterSpacing: 2.5 }}
                >
                  <Send size={13} />
                  {testimonialSending ? "Sending…" : "Submit Review"}
                </button>
              </form>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 1, color: text, opacity: 0.3, marginTop: 20, lineHeight: 1.6 }}>
                Reviews are privately reviewed before appearing publicly. Thank you for taking the time.
              </p>
            </div>
          </div>
        )}

        {/* ── VIDEOS view ────────────────────────────────────────────────── */}
        {viewTab === "videos" && (
          <div style={{ padding: "clamp(20px,4vw,40px) var(--g-pad) 96px" }}>
            {videos.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 12, opacity: 0.4 }}>
                <Play size={36} strokeWidth={1} style={{ color: text }} />
                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: text, margin: 0 }}>No videos yet</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(300px,100%),1fr))", gap: `${gap * 2}px` }}>
                {videos.map((v, i) => (
                  <button key={v.id} type="button" data-file-id={v.id} onClick={() => openLightbox(v)} aria-label={`Play video ${i + 1}`}
                    style={{ position: "relative", cursor: "pointer", background: "#111", borderRadius: 2, overflow: "hidden", border: "none", padding: 0, display: "block", width: "100%" }}>
                    {/* #t=0.1 makes iOS paint the first frame; metadata-only keeps the grid light */}
                    <video src={`${v.url}#t=0.1`} preload="metadata" muted playsInline tabIndex={-1}
                      style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)" }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Play size={20} fill="white" stroke="white" />
                      </div>
                    </div>
                    {v.filename && (
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 14px 12px", background: "linear-gradient(transparent,rgba(0,0,0,0.5))", textAlign: "left" }}>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 1.5, color: "#fff", opacity: 0.8, margin: 0, textTransform: "uppercase" }}>{v.filename}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selection action bar — appears in Select mode or after picking photos */}
      <AnimatePresence>
        {showSelectionBar && (
          <motion.div
            key="selbar"
            className="g-selbar"
            role="region"
            aria-label="Selected photos"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 40 }}
            style={{ background: text, color: bg }}
          >
            <span aria-live="polite">
              {selectedItems.length > 0 ? `${selectedItems.length} selected` : "Tap photos to select"}
            </span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="g-btn" onClick={handleDownloadSelected} disabled={!selectedItems.length || isZipping}
                style={{ color: text, background: bg, border: "none", minHeight: 44 }}>
                <Download size={14} /> {isZipping ? "Zipping…" : "Download"}
              </button>
              <button className="g-btn" onClick={exitSelection} aria-label="Cancel selection"
                style={{ color: bg, background: "transparent", border: `0.5px solid ${bg}66`, minHeight: 44, padding: "0 12px" }}>
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence onExitComplete={revealLastViewed}>
        {lightbox && (
          <GalleryLightbox
            key="lightbox"
            items={lightbox.items}
            index={lightbox.index}
            onIndexChange={changeLightboxIndex}
            onClose={closeLightbox}
            favorites={favorites}
            onFavoriteToggle={toggleFavorite}
            accessCode={accessCode}
            onError={showError}
            downloadsEnabled={downloadsEnabled}
            favoritesEnabled={favoritesEnabled}
            bgColor={bg}
            textColor={text}
          />
        )}
      </AnimatePresence>

      {pinPrompt && <PinDialog onResult={closePin} textColor={text} bgColor={bg} />}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </GallerySessionContext.Provider>
  );
}
