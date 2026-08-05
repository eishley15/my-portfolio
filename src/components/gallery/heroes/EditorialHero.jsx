import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ExpiryCountdown from "../ExpiryCountdown";
import { resolveCoverFont } from "./coverFont";

/**
 * EditorialHero — true magazine-cover layout.
 * Photo runs full-height on the right (~42% width).
 * Left column: ruled lines, byline, large title, CTA.
 * Inspired by KINFOLK / Ransom on Pic-Time.
 */
export default function EditorialHero({ config, onScrollToGallery }) {
  const bg        = config.cover_bg_color   || "#f5f2ee";
  const text      = config.cover_text_color || "#2a1f1f";
  const title     = config.gallery_title    || config.client_name  || "Gallery";
  const subtitle  = config.gallery_subtitle || config.event_date   || "";
  const imgUrl    = config.cover_image_url;
  const titleFont = resolveCoverFont(config.cover_font || "serif");

  return (
    <>
      <style>{`
        .editorial-layout {
          display: grid;
          grid-template-columns: 1fr 42%;
          min-height: 100svh;
        }
        @media (max-width: 680px) {
          .editorial-layout {
            grid-template-columns: 1fr;
            grid-template-rows: auto 52vw;
          }
          .editorial-photo { order: -1; }
        }
      `}</style>

      <div className="editorial-layout" style={{ background: bg }}>

        {/* ── Left column: text ── */}
        <div style={{
          display:       "flex",
          flexDirection: "column",
          padding:       "clamp(24px,4vw,52px)",
          paddingRight:  "clamp(24px,5vw,64px)",
          position:      "relative",
        }}>

          {/* Top rule */}
          <div style={{ height: 1, background: `${text}20`, marginBottom: "clamp(16px,2.5vw,28px)" }} />

          {/* Meta row: byline left, date right */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "clamp(32px,6vw,72px)" }}>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              style={{
                fontFamily: "var(--font-body)", fontSize: 8, letterSpacing: 3,
                textTransform: "uppercase", color: text, opacity: 0.4, margin: 0,
              }}
            >
              Kyle Payawal
            </motion.p>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                style={{
                  fontFamily: "var(--font-body)", fontSize: 8, letterSpacing: 2,
                  textTransform: "uppercase", color: text, opacity: 0.4, margin: 0,
                }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {/* Spacer — pushes title to the bottom */}
          <div style={{ flex: 1 }} />

          {/* Large title */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            style={{
              ...titleFont,
              fontSize:   "clamp(40px,8vw,108px)",
              lineHeight: 0.88,
              color:      text,
              margin:     0,
              wordBreak:  "break-word",
              marginBottom: "clamp(24px,4vw,40px)",
            }}
          >
            {title}
          </motion.h1>

          {/* Bottom rule */}
          <div style={{ height: 1, background: `${text}20`, marginBottom: "clamp(16px,2.5vw,24px)" }} />

          {/* CTA row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              onClick={onScrollToGallery}
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 8,
                fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2.5,
                textTransform: "uppercase", color: text, opacity: 0.45, padding: 0,
              }}
            >
              <ChevronDown size={14} /> View Gallery
            </motion.button>

            {config.show_countdown && config.expires_at && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                <ExpiryCountdown expiresAt={config.expires_at} textColor={text} />
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
              style={{
                fontFamily: "var(--font-body)", fontSize: 8, letterSpacing: 2,
                textTransform: "uppercase", color: text, opacity: 0.22, margin: 0,
              }}
            >
              Private Gallery
            </motion.p>
          </div>
        </div>

        {/* ── Right column: full-height photo ── */}
        <motion.div
          className="editorial-photo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.9 }}
          style={{ position: "relative", overflow: "hidden", minHeight: "52vw" }}
        >
          {imgUrl ? (
            <motion.img
              src={imgUrl} alt={title}
              initial={{ scale: 1.04 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, duration: 1.2, ease: "easeOut" }}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center top",
                display: "block",
              }}
            />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: `${text}0c` }} />
          )}
        </motion.div>

      </div>
    </>
  );
}
