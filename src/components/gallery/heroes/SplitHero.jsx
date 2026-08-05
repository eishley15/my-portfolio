import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ExpiryCountdown from "../ExpiryCountdown";
import { resolveCoverFont } from "./coverFont";

export default function SplitHero({ config, onScrollToGallery }) {
  const bg        = config.cover_bg_color   || "#f5f2ee";
  const text      = config.cover_text_color || "#3d2b2b";
  const title     = config.gallery_title    || config.client_name;
  const subtitle  = config.gallery_subtitle || config.event_date;
  const titleFont = resolveCoverFont(config.cover_font);

  return (
    <>
      {/* Responsive grid — React inline styles can't contain media queries */}
      <style>{`
        .split-hero-grid { grid-template-columns: 1fr 1fr; }
        @media (max-width: 767px) { .split-hero-grid { grid-template-columns: 1fr; } }
      `}</style>
    <div className="split-hero-grid" style={{ minHeight: "100svh", background: bg, display: "grid" }}>
      {/* Left — image; minWidth:0 prevents the grid item from overflowing its track */}
      <div style={{ minHeight: "50svh", overflow: "hidden", padding: "clamp(32px,6vw,80px)", minWidth: 0 }}>
        {config.cover_image_url ? (
          <img src={config.cover_image_url} alt={title} style={{ width: "100%", height: "55svh", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "55svh", background: `${text}12` }} />
        )}
      </div>

      {/* Right — text; minWidth:0 + overflow:hidden contain long titles inside the track */}
      <div style={{ padding: "clamp(32px,6vw,80px)", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0, overflow: "hidden" }}>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: text, opacity: 0.4, marginBottom: 24 }}>
          Private Gallery
        </motion.p>

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          style={{ ...titleFont, fontSize: "clamp(36px,5vw,72px)", lineHeight: 0.92, color: text, margin: 0, wordBreak: "break-word" }}>
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            style={{ fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: 1.5, color: text, opacity: 0.5, marginTop: 16, marginBottom: 0 }}>
            · {subtitle} ·
          </motion.p>
        )}

        {config.show_countdown && config.expires_at && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ marginTop: 32 }}>
            <ExpiryCountdown expiresAt={config.expires_at} textColor={text} />
          </motion.div>
        )}

        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          onClick={onScrollToGallery}
          style={{ marginTop: 40, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: text, opacity: 0.4, padding: 0 }}>
          <ChevronDown size={14} /> View Gallery
        </motion.button>

        <p style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 1.5, color: text, opacity: 0.25, marginTop: "auto", paddingTop: 48 }}>
          Gallery by Kyle Payawal
        </p>
      </div>
    </div>
    </>
  );
}
