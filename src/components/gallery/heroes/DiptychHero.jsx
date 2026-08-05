import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ExpiryCountdown from "../ExpiryCountdown";
import { resolveCoverFont } from "./coverFont";

/**
 * DiptychHero — two photos side by side filling the upper ~65% of the screen,
 * with a clean text panel below. Contact-sheet / film-diptych aesthetic.
 *
 * Left photo  → cover_image_url
 * Right photo → cover_collage_urls[0]   (falls back gracefully if absent)
 */
export default function DiptychHero({ config, onScrollToGallery }) {
  const bg        = config.cover_bg_color    || "#f5f2ee";
  const text      = config.cover_text_color  || "#1c1812";
  const title     = config.gallery_title     || config.client_name  || "Gallery";
  const subtitle  = config.gallery_subtitle  || config.event_date   || "";
  const leftImg   = config.cover_image_url;
  const rightImg  = (config.cover_collage_urls || [])[0];
  const titleFont = resolveCoverFont(config.cover_font);

  const photoHeight = "clamp(240px, 55vh, 600px)";

  return (
    <>
      <style>{`
        .diptych-photos {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(4px, 1vw, 12px);
        }
        .diptych-meta {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
        @media (max-width: 540px) {
          .diptych-photos { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{
        minHeight:     "100svh",
        background:    bg,
        display:       "flex",
        flexDirection: "column",
        padding:       "clamp(20px,4vw,48px)",
        gap:           "clamp(16px,3vw,32px)",
      }}>

        {/* ── Top meta row ── */}
        <div className="diptych-meta">
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            style={{
              fontFamily: "var(--font-body)", fontSize: 8, letterSpacing: 3,
              textTransform: "uppercase", color: text, opacity: 0.35, margin: 0,
            }}
          >
            Kyle Payawal — Private Gallery
          </motion.p>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              style={{
                fontFamily: "var(--font-body)", fontSize: 8, letterSpacing: 2,
                textTransform: "uppercase", color: text, opacity: 0.35, margin: 0,
              }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {/* ── Diptych photos ── */}
        <div className="diptych-photos" style={{ flex: "0 0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            {leftImg ? (
              <img src={leftImg} alt={`${title} — 1`}
                style={{ width: "100%", height: photoHeight, objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: photoHeight, background: `${text}10` }} />
            )}
          </motion.div>

          {/* Right photo — staggered slightly lower for rhythm */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden", marginTop: "clamp(16px,3vw,40px)" }}
          >
            {rightImg ? (
              <img src={rightImg} alt={`${title} — 2`}
                style={{ width: "100%", height: photoHeight, objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: photoHeight, background: `${text}07` }} />
            )}
          </motion.div>
        </div>

        {/* ── Title + CTA ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 12 }}>
          <div style={{ height: 1, background: `${text}18` }} />

          <div style={{
            display: "flex", alignItems: "flex-end",
            justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          }}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                ...titleFont,
                fontSize:  "clamp(36px,7vw,96px)",
                lineHeight: 0.88,
                color:     text,
                margin:    0,
                wordBreak: "break-word",
                flex:      "1 1 auto",
              }}
            >
              {title}
            </motion.h1>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flex: "0 0 auto" }}>
              {config.show_countdown && config.expires_at && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                  <ExpiryCountdown expiresAt={config.expires_at} textColor={text} />
                </motion.div>
              )}
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                onClick={onScrollToGallery}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2.5,
                  textTransform: "uppercase", color: text, opacity: 0.4, padding: 0,
                }}
              >
                <ChevronDown size={14} /> View Gallery
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
