import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ExpiryCountdown from "../ExpiryCountdown";
import { resolveCoverFont } from "./coverFont";

export default function CollageHero({ config, onScrollToGallery }) {
  const bg        = config.cover_bg_color    || "#1a1a1a";
  const text      = config.cover_text_color  || "#ffffff";
  const accent    = config.cover_accent_color || "#e8f0a8";
  const title     = config.gallery_title     || config.client_name;
  const subtitle  = config.gallery_subtitle  || config.event_date;
  const extras    = config.cover_collage_urls || [];
  const titleFont = resolveCoverFont(config.cover_font);

  return (
    <div style={{ minHeight: "100svh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      {extras[0] && (
        <img src={extras[0]} alt="" aria-hidden style={{ position: "absolute", left: "-8%", top: "50%", transform: "translateY(-50%) rotate(-3deg)", width: "28%", height: "55vh", objectFit: "cover", opacity: 0.45 }} />
      )}
      {extras[1] && (
        <img src={extras[1]} alt="" aria-hidden style={{ position: "absolute", right: "-8%", top: "50%", transform: "translateY(-50%) rotate(3deg)", width: "28%", height: "55vh", objectFit: "cover", opacity: 0.45 }} />
      )}

      <div style={{ textAlign: "center", zIndex: 1, padding: "0 40px" }}>
        {config.cover_image_url && (
          <motion.img initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}
            src={config.cover_image_url} alt={title}
            style={{ width: "clamp(200px,38vw,460px)", height: "clamp(240px,48vh,540px)", objectFit: "cover", display: "block", margin: "0 auto 40px" }} />
        )}

        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }}
          style={{ ...titleFont, fontSize: "clamp(48px,8vw,120px)", lineHeight: 0.88, textTransform: "uppercase", color: accent, margin: 0 }}>
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: 2, color: text, opacity: 0.5, marginTop: 16 }}>
            {subtitle}
          </motion.p>
        )}

        {config.show_countdown && config.expires_at && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
            <ExpiryCountdown expiresAt={config.expires_at} textColor={text} />
          </motion.div>
        )}

        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          onClick={onScrollToGallery}
          style={{ marginTop: 40, background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: text, opacity: 0.4, padding: 0 }}>
          <ChevronDown size={14} /> View Gallery
        </motion.button>
      </div>
    </div>
  );
}
