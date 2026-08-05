import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ExpiryCountdown from "../ExpiryCountdown";
import { resolveCoverFont } from "./coverFont";

export default function CircleHero({ config, onScrollToGallery }) {
  const bg        = config.cover_bg_color   || "#3d2b2b";
  const text      = config.cover_text_color || "#f5f2ee";
  const title     = config.gallery_title    || config.client_name;
  const subtitle  = config.gallery_subtitle || config.event_date;
  // CircleHero defaults to serif-italic when no font set — editorial feel
  const titleFont = resolveCoverFont(config.cover_font || "serif");

  return (
    <div style={{ minHeight: "100svh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center", position: "relative" }}>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 4, textTransform: "uppercase", color: text, opacity: 0.3, position: "absolute", top: 28, left: 36, margin: 0 }}>
        Kyle Payawal
      </motion.p>

      {config.cover_image_url && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
          style={{ width: "clamp(220px,38vw,400px)", height: "clamp(220px,38vw,400px)", borderRadius: "50%", overflow: "hidden", marginBottom: 48 }}>
          <img src={config.cover_image_url} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </motion.div>
      )}

      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
        style={{ ...titleFont, fontSize: "clamp(36px,5vw,68px)", lineHeight: 1, color: text, margin: 0 }}>
        {title}
      </motion.h1>

      {subtitle && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 2, color: text, opacity: 0.4, marginTop: 16 }}>
          {subtitle}
        </motion.p>
      )}

      {config.show_countdown && config.expires_at && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ marginTop: 28 }}>
          <ExpiryCountdown expiresAt={config.expires_at} textColor={text} />
        </motion.div>
      )}

      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
        onClick={onScrollToGallery}
        style={{ marginTop: 40, background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: text, opacity: 0.35, padding: 0 }}>
        <ChevronDown size={14} /> View Gallery
      </motion.button>
    </div>
  );
}
