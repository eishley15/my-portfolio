import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ExpiryCountdown from "../ExpiryCountdown";
import { resolveCoverFont } from "./coverFont";

/**
 * MarqueeHero — full-bleed photo with the gallery title running as a
 * continuous horizontal ticker across the lower third.
 * Inspired by editorial motion-cover aesthetics (Monika Frias / Pic-Time).
 */
export default function MarqueeHero({ config, onScrollToGallery }) {
  const text      = config.cover_text_color || "#f5f2ee";
  const title     = config.gallery_title    || config.client_name  || "Gallery";
  const subtitle  = config.gallery_subtitle || config.event_date   || "";
  const imgUrl    = config.cover_image_url;
  const titleFont = resolveCoverFont(config.cover_font);

  // Build a repeated ticker string so it always overflows the viewport
  const tickerUnit = subtitle ? `${title} / ${subtitle} / ` : `${title} / `;
  const repeated   = tickerUnit.repeat(8);

  return (
    <>
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee-scroll 55s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>

      <div style={{ position: "relative", minHeight: "100svh", overflow: "hidden", background: "#0e0c0b" }}>

        {/* ── Background photo ── */}
        {imgUrl ? (
          <motion.img
            src={imgUrl} alt={title}
            initial={{ scale: 1.04 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
            }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "#2a2420" }} />
        )}

        {/* ── Gradient scrim ── */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.18) 45%, transparent 75%)",
          pointerEvents: "none",
        }} />

        {/* ── Byline top-left ── */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{
            position: "absolute", top: "clamp(18px,3vw,28px)", left: "clamp(18px,3vw,28px)",
            fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2,
            textTransform: "uppercase", color: text, opacity: 0.4, margin: 0, zIndex: 2,
          }}
        >
          Gallery by Kyle Payawal
        </motion.p>

        {/* ── Subtitle top-right ── */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            style={{
              position: "absolute", top: "clamp(18px,3vw,28px)", right: "clamp(18px,3vw,28px)",
              fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2,
              textTransform: "uppercase", color: text, opacity: 0.4, margin: 0, zIndex: 2,
            }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* ── Scrolling ticker band ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            bottom: "clamp(80px,14vw,140px)",
            left: 0, right: 0,
            overflow: "hidden",
            zIndex: 2,
            borderTop:    `1px solid ${text}22`,
            borderBottom: `1px solid ${text}22`,
            padding: "clamp(6px,1.4vw,14px) 0",
          }}
        >
          <div className="marquee-track">
            <span style={{
              ...titleFont,
              fontSize: "clamp(28px,6vw,80px)", lineHeight: 1,
              color: text, whiteSpace: "nowrap",
              paddingRight: "clamp(24px,4vw,48px)",
              textTransform: "uppercase",
            }}>
              {repeated}
            </span>
            <span aria-hidden style={{
              ...titleFont,
              fontSize: "clamp(28px,6vw,80px)", lineHeight: 1,
              color: text, whiteSpace: "nowrap",
              paddingRight: "clamp(24px,4vw,48px)",
              textTransform: "uppercase",
            }}>
              {repeated}
            </span>
          </div>
        </motion.div>

        {/* ── Countdown + scroll CTA ── */}
        <div style={{
          position: "absolute", bottom: "clamp(24px,5vw,48px)", left: "clamp(18px,4vw,40px)",
          zIndex: 2, display: "flex", flexDirection: "column", gap: 12,
        }}>
          {config.show_countdown && config.expires_at && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              <ExpiryCountdown expiresAt={config.expires_at} textColor={text} />
            </motion.div>
          )}
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
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
        </div>
      </div>
    </>
  );
}
