import { useState, useRef, useEffect, useCallback } from "react";
import { Download, Play, Heart, MessageSquare, Send, CheckCircle } from "lucide-react";

import { isLoggedIn, clearToken, getAccessCodeFromToken } from "../lib/galleryAuth";
import { useGalleryConfig } from "../hooks/useGalleryConfig";
import { useFavorites } from "../hooks/useFavorites";
import { useDownloadZip } from "../hooks/useDownloadZip";
import { useToast, ToastContainer } from "../components/Toast";

import AccessGate      from "../components/gallery/AccessGate";
import ExpiredNotice   from "../components/gallery/ExpiredNotice";
import GalleryHero     from "../components/gallery/GalleryHero";
import GalleryNav      from "../components/gallery/GalleryNav";
import SectionTabs     from "../components/gallery/SectionTabs";
import SectionHeader   from "../components/gallery/SectionHeader";
import MasonryGrid     from "../components/gallery/MasonryGrid";
import GalleryLightbox from "../components/gallery/GalleryLightbox";

export default function Gallery() {
  const [loggedIn,      setLoggedIn]  = useState(isLoggedIn);
  const [lightboxItem,  setLightbox]  = useState(null);
  const [selectedItems, setSelected]  = useState([]);
  const [viewTab,       setViewTab]   = useState("photos");
  const galleryRef = useRef(null);

  // Testimonial state
  const [testimonialStatus, setTestimonialStatus] = useState("loading"); // loading | none | submitted
  const [testimonialQuote,  setTestimonialQuote]  = useState("");
  const [testimonialEvent,  setTestimonialEvent]  = useState("");
  const [testimonialSending, setTestimonialSending] = useState(false);

  const { toasts, addToast, removeToast } = useToast();
  const { downloadZip, isZipping, error: zipError, clearError } = useDownloadZip();
  const { config, scenes, photos, videos, files, loading, expired, error: configError, refetch } = useGalleryConfig();
  const { favorites, toggle: toggleFavorite } = useFavorites(addToast);

  const accessCode = getAccessCodeFromToken();
  const allMedia   = [...photos, ...videos];

  function handleLogout()       { clearToken(); setLoggedIn(false); }
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

  function openLightbox(file) { setLightbox(file); }
  function closeLightbox()    { setLightbox(null); }

  function activeItems() {
    if (viewTab === "favorites") return photos.filter((f) => favorites.has(f.id));
    if (viewTab === "videos")    return videos;
    return allMedia;
  }

  function nextItem() {
    const items = activeItems();
    const idx = items.findIndex((f) => f.id === lightboxItem?.id);
    if (idx < items.length - 1) setLightbox(items[idx + 1]);
  }
  function prevItem() {
    const items = activeItems();
    const idx = items.findIndex((f) => f.id === lightboxItem?.id);
    if (idx > 0) setLightbox(items[idx - 1]);
  }

  function toggleSelect(id) {
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
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
    const r = await downloadZip({ accessCode });
    if (r.success) addToast("ZIP download started!", "success");
    else if (r.error) addToast(r.error, "error");
  }

  async function handleDownloadSelected() {
    if (!selectedItems.length) return;
    const names = allMedia.filter((f) => selectedItems.includes(f.id)).map((f) => f.filename);
    const r = await downloadZip({ accessCode, files: names });
    if (r.success) addToast("ZIP download started!", "success");
    else if (r.error) addToast(r.error, "error");
  }

  const filesForScene   = (id) => files.filter((f) => f.scene_id === id && f.type === "photo");
  const unsortedPhotos  = photos.filter((f) => !f.scene_id);

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

  const bg      = config?.gallery_bg_color   || "#faf9f7";
  const text    = config?.gallery_text_color || "#3d2b2b";
  const cols    = config?.columns_count      || 4;
  const gap     = config?.grid_gap           ?? 4;
  const hdrStyle = config?.section_header_style || "dot";

  return (
    <>
      {/* Per-gallery CSS variables */}
      <style>{`
        :root {
          --g-bg: ${bg}; --g-text: ${text};
          --g-columns: ${cols}; --g-gap: ${gap}px;
        }
        @media (max-width: 1024px) { :root { --g-columns: ${Math.min(cols, 3)}; } }
        @media (max-width: 767px)  { :root { --g-columns: ${Math.min(cols, 2)}; } }
      `}</style>

      <GalleryNav config={config} onLogout={handleLogout} accessCode={accessCode} onDownloadAll={handleDownloadAll} isZipping={isZipping} />

      <div style={{ background: bg, minHeight: "100svh", color: text }}>

        {/* Hero cover */}
        <GalleryHero config={config} onScrollToGallery={() => galleryRef.current?.scrollIntoView({ behavior: "smooth" })} />

        {/* Primary view tabs: Photos / Favorites / Videos */}
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: `${bg}eb`, backdropFilter: "blur(18px)", borderBottom: `0.5px solid ${text}18` }}>
          <div style={{ display: "flex", overflowX: "auto", justifyContent: "center", scrollbarWidth: "none", padding: "0 24px" }}>
            {[
              { id: "photos",    label: "Photos" },
              { id: "favorites", label: "Favorites", icon: <Heart size={11} style={{ marginRight: 5 }} /> },
              ...(videos.length > 0 ? [{ id: "videos", label: "Videos", icon: <Play size={11} style={{ marginRight: 5 }} /> }] : []),
              // Review tab only shows if client hasn't submitted yet (and check is complete)
              ...(testimonialStatus === "none" ? [{ id: "review", label: "Review", icon: <MessageSquare size={11} style={{ marginRight: 5 }} /> }] : []),
            ].map(({ id, label, icon }) => {
              const active = viewTab === id;
              return (
                <button
                  key={id}
                  onClick={() => { setViewTab(id); setSelected([]); }}
                  style={{
                    fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase",
                    color: text, opacity: active ? 1 : 0.4, background: "none", border: "none",
                    borderBottom: active ? `1px solid ${text}` : "1px solid transparent",
                    padding: "18px 20px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                    transition: "all 0.2s ease", display: "flex", alignItems: "center",
                  }}
                >
                  {icon}{label}
                  {id === "favorites" && favorites.size > 0 && (
                    <span style={{ marginLeft: 6, fontSize: 9, opacity: 0.6 }}>({favorites.size})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scene scroll-tabs — only under Photos */}
        {viewTab === "photos" && <SectionTabs scenes={scenes} bgColor={bg} textColor={text} />}

        {/* ── PHOTOS view ────────────────────────────────────────────────── */}
        {viewTab === "photos" && (
          <>
            {/* Download toolbar */}
            <div ref={galleryRef} style={{ padding: "32px 40px 16px", display: "flex", flexWrap: "wrap", gap: 12 }}>
              {zipError && (
                <div style={{ width: "100%", padding: "10px 16px", background: "rgba(200,50,50,0.08)", display: "flex", justifyContent: "space-between", fontSize: 12, color: text }}>
                  {zipError}
                  <button onClick={clearError} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>×</button>
                </div>
              )}
              {config?.downloads_enabled !== false && (
                <>
                  <button onClick={handleDownloadAll} disabled={isZipping}
                    style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: bg, background: text, border: "none", padding: "10px 20px", cursor: isZipping ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8, opacity: isZipping ? 0.5 : 1 }}>
                    <Download size={14} /> {isZipping ? "Zipping…" : "Download All"}
                  </button>
                  {selectedItems.length > 0 && (
                    <button onClick={handleDownloadSelected} disabled={isZipping}
                      style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: text, background: "transparent", border: `0.5px solid ${text}`, padding: "10px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, opacity: isZipping ? 0.5 : 1 }}>
                      <Download size={14} /> Download Selected ({selectedItems.length})
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Grid */}
            <div style={{ padding: "0 40px 80px" }}>
              {scenes.length > 0 ? (
                <>
                  {unsortedPhotos.length > 0 && (
                    <section id="highlights">
                      <SectionHeader scene={{ name: "Highlights" }} variant={hdrStyle} textColor={text} />
                      <MasonryGrid files={unsortedPhotos} columnsCount={cols} gap={gap} favorites={favorites} selectedItems={selectedItems} onFavoriteToggle={toggleFavorite} onSelect={toggleSelect} onOpen={openLightbox} accessCode={accessCode} onError={(msg) => addToast(msg, "error")} />
                    </section>
                  )}
                  {scenes.map((scene) => {
                    const sf = filesForScene(scene.id);
                    if (!sf.length) return null;
                    return (
                      <section key={scene.id} id={scene.slug}>
                        <SectionHeader scene={scene} variant={hdrStyle} textColor={text} />
                        <MasonryGrid files={sf} columnsCount={cols} gap={gap} favorites={favorites} selectedItems={selectedItems} onFavoriteToggle={toggleFavorite} onSelect={toggleSelect} onOpen={openLightbox} accessCode={accessCode} onError={(msg) => addToast(msg, "error")} />
                      </section>
                    );
                  })}
                </>
              ) : (
                <section id="highlights">
                  <MasonryGrid files={photos} columnsCount={cols} gap={gap} favorites={favorites} selectedItems={selectedItems} onFavoriteToggle={toggleFavorite} onSelect={toggleSelect} onOpen={openLightbox} accessCode={accessCode} onError={(msg) => addToast(msg, "error")} />
                </section>
              )}
            </div>
          </>
        )}

        {/* ── FAVORITES view ─────────────────────────────────────────────── */}
        {viewTab === "favorites" && (() => {
          const favPhotos = photos.filter((f) => favorites.has(f.id));
          return (
            <div style={{ padding: "40px 40px 80px" }}>
              {favPhotos.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 12, opacity: 0.4 }}>
                  <Heart size={36} strokeWidth={1} style={{ color: text }} />
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: text, margin: 0 }}>No favorites yet</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: text, margin: 0, opacity: 0.7 }}>Tap the heart on any photo to save it here.</p>
                </div>
              ) : (
                <MasonryGrid files={favPhotos} columnsCount={cols} gap={gap} favorites={favorites} selectedItems={selectedItems} onFavoriteToggle={toggleFavorite} onSelect={toggleSelect} onOpen={openLightbox} accessCode={accessCode} onError={(msg) => addToast(msg, "error")} />
              )}
            </div>
          );
        })()}

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
                  <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: text, opacity: 0.5, marginBottom: 8 }}>
                    Event type <span style={{ opacity: 0.4 }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={testimonialEvent}
                    onChange={(e) => setTestimonialEvent(e.target.value)}
                    placeholder="e.g. Wedding, Debut, Portrait…"
                    maxLength={80}
                    style={{ width: "100%", padding: "12px 14px", background: "transparent", border: `0.5px solid ${text}30`, color: text, fontFamily: "var(--font-body)", fontSize: 13, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = `${text}80`)}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = `${text}30`)}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: text, opacity: 0.5, marginBottom: 8 }}>
                    Your words <span style={{ opacity: 0.6 }}>*</span>
                  </label>
                  <textarea
                    value={testimonialQuote}
                    onChange={(e) => setTestimonialQuote(e.target.value)}
                    placeholder="Tell us about your experience…"
                    required
                    maxLength={1000}
                    rows={5}
                    style={{ width: "100%", padding: "12px 14px", background: "transparent", border: `0.5px solid ${text}30`, color: text, fontFamily: "var(--font-body)", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6, transition: "border-color 0.2s" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = `${text}80`)}
                    onBlur={(e)  => (e.currentTarget.style.borderColor = `${text}30`)}
                  />
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 1, color: text, opacity: 0.3, marginTop: 6, textAlign: "right" }}>{testimonialQuote.length}/1000</p>
                </div>
                <button
                  type="submit"
                  disabled={!testimonialQuote.trim() || testimonialSending}
                  style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: text, color: bg, fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", border: "none", cursor: (!testimonialQuote.trim() || testimonialSending) ? "not-allowed" : "pointer", opacity: (!testimonialQuote.trim() || testimonialSending) ? 0.4 : 1, transition: "opacity 0.2s" }}
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
          <div style={{ padding: "40px 40px 80px" }}>
            {videos.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 12, opacity: 0.4 }}>
                <Play size={36} strokeWidth={1} style={{ color: text }} />
                <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: text, margin: 0 }}>No videos yet</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: `${gap * 2}px` }}>
                {videos.map((v) => (
                  <div key={v.id} onClick={() => openLightbox(v)}
                    style={{ position: "relative", cursor: "pointer", background: "#111", borderRadius: 2, overflow: "hidden" }}>
                    <video src={v.url} style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover" }} muted />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)" }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Play size={20} fill="white" stroke="white" />
                      </div>
                    </div>
                    {v.filename && (
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 14px 12px", background: "linear-gradient(transparent,rgba(0,0,0,0.5))" }}>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 1.5, color: "#fff", opacity: 0.8, margin: 0, textTransform: "uppercase" }}>{v.filename}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {lightboxItem && (
        <GalleryLightbox
          item={lightboxItem} allItems={activeItems()}
          onClose={closeLightbox} onNext={nextItem} onPrev={prevItem}
          isFavorited={favorites.has(lightboxItem.id)}
          onFavoriteToggle={toggleFavorite}
          accessCode={accessCode}
          onError={(msg) => addToast(msg, "error")}
          bgColor={bg}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
