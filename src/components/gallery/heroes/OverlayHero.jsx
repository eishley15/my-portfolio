import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ExpiryCountdown from "../ExpiryCountdown";

/**
 * OverlayHero — full-bleed photo with giant Kiya Handwrite text smashed over it.
 * Inspired by editorial covers: broken title across 2–4 lines, large, white, slightly
 * offset so the photo breathes through the letters.
 */
export default function OverlayHero({ config, onScrollToGallery }) {
  const title    = config.gallery_title   || config.client_name || "Gallery";
  const subtitle = config.gallery_subtitle || config.event_date || "";
  const imgUrl   = config.cover_image_url;

  // Break title into chunks — max 2 words per line for big impact
  const words = title.split(/\s+/).filter(Boolean);
  const lines = chunkWords(words);

  // Color from config; default white for max contrast on dark photos
  const textColor = config.cover_text_color || "#ffffff";

  return (
    <>
    <style>{`
      .overlay-hero { position: relative; width: 100%; min-height: 100svh; overflow: hidden; background: var(--black); }
      .overlay-hero__scrim {
        position: absolute; inset: 0; pointer-events: none;
        background: linear-gradient(160deg, rgba(37,36,34,0.18) 0%, rgba(37,36,34,0.42) 100%);
      }
    `}</style>
    <div className="overlay-hero">

      {/* ── Background photo ── */}
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={title}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center",
            display: "block",
          }}
        />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "var(--gray-dark)" }} />
      )}

      {/* ── Subtle dark gradient so white text stays legible ── */}
      <div className="overlay-hero__scrim" />

      {/* ── Overlay text ── */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        minHeight: "100svh",
        padding: "clamp(24px,6vw,64px)",
        paddingBottom: "clamp(48px,8vw,80px)",
      }}>

        {/* Stacked title lines */}
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(2px,1vw,8px)" }}>
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <span style={{
                fontFamily: "'KiyaHandwrite', cursive",
                fontSize:   "clamp(52px, 13vw, 160px)",
                lineHeight: 0.9,
                color:      textColor,
                display:    "block",
                whiteSpace: "nowrap",
                /* Alternate lines nudged right for staggered editorial feel */
                marginLeft: i % 2 === 1 ? "clamp(12px,4vw,48px)" : 0,
              }}>
                {line}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: lines.length * 0.12 + 0.15 }}
            style={{
              fontFamily:    "var(--font-body)",
              fontSize:      11,
              letterSpacing: 2.5,
              textTransform: "uppercase",
              color:         textColor,
              opacity:       0.6,
              marginTop:     "clamp(16px,3vw,32px)",
              marginBottom:  0,
            }}
          >
            · {subtitle} ·
          </motion.p>
        )}

        {/* Countdown */}
        {config.show_countdown && config.expires_at && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: lines.length * 0.12 + 0.3 }}
            style={{ marginTop: 24 }}
          >
            <ExpiryCountdown expiresAt={config.expires_at} textColor={textColor} />
          </motion.div>
        )}

        {/* Scroll CTA */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: lines.length * 0.12 + 0.45 }}
          onClick={onScrollToGallery}
          style={{
            marginTop:     "clamp(24px,4vw,40px)",
            background:    "none", border: "none", cursor: "pointer",
            display:       "flex", alignItems: "center", gap: 8,
            fontFamily:    "var(--font-body)",
            fontSize:      9, letterSpacing: 2.5,
            textTransform: "uppercase",
            color:         textColor, opacity: 0.45,
            padding:       0, alignSelf: "flex-start",
          }}
        >
          <ChevronDown size={14} /> View Gallery
        </motion.button>
      </div>

      {/* Byline — top-left, small */}
      <p style={{
        position:      "absolute", top: "clamp(18px,3vw,28px)", left: "clamp(18px,3vw,28px)",
        fontFamily:    "var(--font-body)",
        fontSize:      9, letterSpacing: 1.5,
        textTransform: "uppercase",
        color:         textColor, opacity: 0.3,
        margin:        0, zIndex: 2,
      }}>
        Gallery by Kyle Payawal
      </p>
    </div>
    </>
  );
}

/** Split words into lines of ≤2 words each */
function chunkWords(words) {
  const lines = [];
  for (let i = 0; i < words.length; i += 2) {
    lines.push(words.slice(i, i + 2).join(" "));
  }
  return lines.length ? lines : ["Gallery"];
}
