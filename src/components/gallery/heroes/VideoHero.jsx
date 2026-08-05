import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ExpiryCountdown from "../ExpiryCountdown";
import { resolveCoverFont } from "./coverFont";

export default function VideoHero({ config, onScrollToGallery }) {
  const bg        = config.cover_bg_color   || "#0e0c0b";
  const text      = config.cover_text_color || "#f5f2ee";
  const title     = config.gallery_title    || config.client_name;
  const subtitle  = config.gallery_subtitle || config.event_date;
  const titleFont = resolveCoverFont(config.cover_font);

  return (
    <div style={{ minHeight: "100svh", position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end", background: bg }}>
      {config.cover_video_url && (
        <video
          src={config.cover_video_url} autoPlay muted loop playsInline
          poster={config.cover_image_url}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />

      <div style={{ position: "relative", zIndex: 1, padding: "clamp(40px,6vw,80px)", width: "100%", maxWidth: 800 }}>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: text, opacity: 0.4, marginBottom: 20 }}>
          Private Gallery
        </motion.p>

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
          style={{ ...titleFont, fontSize: "clamp(48px,7vw,100px)", lineHeight: 0.88, color: text, margin: 0 }}>
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: 2, color: text, opacity: 0.5, marginTop: 16 }}>
            {subtitle}
          </motion.p>
        )}

        {config.show_countdown && config.expires_at && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} style={{ marginTop: 28 }}>
            <ExpiryCountdown expiresAt={config.expires_at} textColor={text} />
          </motion.div>
        )}

        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          onClick={onScrollToGallery}
          style={{ marginTop: 36, background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: text, opacity: 0.4, padding: 0 }}>
          <ChevronDown size={14} /> View Gallery
        </motion.button>
      </div>
    </div>
  );
}
