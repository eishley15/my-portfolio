import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, LogOut, Menu, X, Download } from "lucide-react";

export default function GalleryNav({ config, onLogout, onDownloadAll, isZipping, downloadsEnabled = true }) {
  const [scrolled,  setScrolled] = useState(false);
  const [menuOpen,  setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => {
      const isScrolled = window.scrollY > 40;
      setScrolled(isScrolled);
      if (isScrolled) setMenuOpen(false);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const bg   = config?.gallery_bg_color   || "#faf9f7";
  const text = config?.gallery_text_color || "#3d2b2b";

  const btnStyle = {
    fontFamily: "var(--font-body)",
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: text,
    background: "none",
    border: "0.5px solid rgba(14,12,11,0.18)",
    padding: "8px 14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
    transition: "border-color 0.2s",
  };
  // Full-width, 44px-tall rows in the phone menu
  const menuItemStyle = { ...btnStyle, justifyContent: "flex-start", minHeight: 44, padding: "0 16px" };

  return (
    <nav aria-label="Gallery navigation" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 101,
      background: scrolled ? `${bg}f0` : `${bg}0a`,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      boxShadow: scrolled ? "0 0.5px 0 rgba(14,12,11,0.08)" : "none",
      transition: "background 0.4s",
    }}>
      <div className="gnav-inner">
        <Link to="/" aria-label="Kyle Payawal — home" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <img src="/logo.svg" alt="Kyle Payawal" className="gnav-logo" style={{ filter: "brightness(0)", opacity: 0.85 }} />
        </Link>

        {/* Desktop actions */}
        <div className="gnav-desktop" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {config?.slideshow_enabled && (
            <button onClick={() => navigate("/slideshow")} style={btnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = text)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(14,12,11,0.18)")}>
              <Play size={11} /> Slideshow
            </button>
          )}
          {downloadsEnabled && onDownloadAll && (
            <button onClick={onDownloadAll} disabled={isZipping}
              style={{ ...btnStyle, opacity: isZipping ? 0.5 : 1, cursor: isZipping ? "not-allowed" : "pointer" }}
              onMouseEnter={(e) => { if (!isZipping) e.currentTarget.style.borderColor = text; }}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(14,12,11,0.18)")}>
              <Download size={11} /> {isZipping ? "Zipping…" : "Download All"}
            </button>
          )}
          <button onClick={onLogout} style={btnStyle}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = text)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(14,12,11,0.18)")}>
            <LogOut size={11} /> Logout
          </button>
        </div>

        {/* Mobile hamburger — 44px touch target */}
        <button className="gnav-hamburger" onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          style={{ background: "none", border: "none", cursor: "pointer", color: text, width: 44, height: 44, marginRight: -10, alignItems: "center", justifyContent: "center" }}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{ borderTop: "0.5px solid rgba(14,12,11,0.08)", background: `${bg}f8`, padding: "12px clamp(16px,4vw,40px) 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {config?.slideshow_enabled && (
            <button onClick={() => { navigate("/slideshow"); setMenuOpen(false); }} style={menuItemStyle}>
              <Play size={11} /> Slideshow
            </button>
          )}
          {downloadsEnabled && onDownloadAll && (
            <button onClick={() => { onDownloadAll(); setMenuOpen(false); }} disabled={isZipping}
              style={{ ...menuItemStyle, opacity: isZipping ? 0.5 : 1 }}>
              <Download size={11} /> {isZipping ? "Zipping…" : "Download All"}
            </button>
          )}
          <button onClick={() => { onLogout(); setMenuOpen(false); }} style={menuItemStyle}>
            <LogOut size={11} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
