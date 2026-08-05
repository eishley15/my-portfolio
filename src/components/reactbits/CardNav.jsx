import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { isVideo } from "../../lib/isVideo";

const NAV_CARDS = [
  { to: "/",        label: "Home",    subtitle: "Start here"    },
  { to: "/work",    label: "Work",    subtitle: "Portfolio"     },
  { to: "/about",   label: "About",   subtitle: "The story"     },
  { to: "/gallery", label: "Gallery", subtitle: "Client access" },
  { to: "/inquire", label: "Inquire", subtitle: "Book a session"},
];

const overlayVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit:   { opacity: 0, transition: { duration: 0.22, ease: "easeIn" } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.06 + i * 0.065, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  }),
  exit: (i) => ({
    opacity: 0,
    y: 16,
    transition: { delay: i * 0.025, duration: 0.2 },
  }),
};

// ─── Single nav card ──────────────────────────────────────────────────────────
function NavCard({ card, i, isActive, thumbItem }) {
  const [hovered, setHovered] = useState(false);
  const thumb = thumbItem?.url || null;

  return (
    <motion.div
      custom={i}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      style={{ flex: "1 1 clamp(110px, 15vw, 160px)", maxWidth: 180 }}
    >
      <Link
        to={card.to}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display:        "block",
          width:          "100%",
          aspectRatio:    "3 / 4",
          position:       "relative",
          overflow:       "hidden",
          textDecoration: "none",
          background:     "var(--gray-dark)",
          border: isActive
            ? "1px solid rgba(255,252,242,0.45)"
            : hovered
            ? "1px solid rgba(255,252,242,0.28)"
            : "1px solid rgba(255,252,242,0.07)",
          transition: "border-color 0.25s",
        }}
      >
        {/* ── Thumbnail — hidden at rest, reveals on hover ─────────────── */}
        {thumb && (
          <motion.div
            style={{ position: "absolute", inset: 0 }}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
          >
            {thumbItem && isVideo(thumbItem) ? (
              <video
                src={thumb}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  position:  "absolute",
                  inset:      0,
                  width:      "100%",
                  height:     "100%",
                  objectFit:  "cover",
                  display:    "block",
                  opacity:    0.55,
                }}
              />
            ) : (
              <img
                src={thumb}
                alt={card.label}
                style={{
                  position:  "absolute",
                  inset:      0,
                  width:      "100%",
                  height:     "100%",
                  objectFit:  "cover",
                  display:    "block",
                  opacity:    0.55,
                }}
                loading="lazy"
              />
            )}
          </motion.div>
        )}

        {/* ── Flat dark fill at rest ────────────────────────────────────── */}
        <div
          style={{
            position:  "absolute",
            inset:      0,
            background: "linear-gradient(160deg, rgba(40,38,35,0.92) 0%, rgba(20,18,16,1) 100%)",
            opacity:    hovered && thumb ? 0 : 1,
            transition: "opacity 0.45s",
          }}
        />

        {/* ── Bottom gradient — fades in alongside the thumbnail ────────── */}
        {thumb && (
          <div
            style={{
              position:  "absolute",
              inset:      0,
              background: "linear-gradient(to top, rgba(14,12,11,0.92) 0%, rgba(14,12,11,0.35) 55%, rgba(14,12,11,0.06) 100%)",
              opacity:    hovered ? 1 : 0,
              transition: "opacity 0.45s",
            }}
          />
        )}

        {/* ── Active dot ───────────────────────────────────────────────── */}
        {isActive && (
          <div
            style={{
              position:    "absolute",
              top:          10,
              right:        10,
              width:        5,
              height:       5,
              borderRadius: "50%",
              background:   "var(--off-white)",
            }}
          />
        )}

        {/* ── Rest label — large, vertically centered, fades out on hover ─ */}
        <motion.div
          style={{
            position:     "absolute",
            top:           "50%",
            left:          0,
            right:         0,
            padding:       "0 12px",
            textAlign:     "center",
            pointerEvents: "none",
          }}
          animate={{
            y:       hovered ? "-62%" : "-50%",
            opacity: hovered ? 0 : 1,
          }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            style={{
              fontFamily:    "var(--font-display)",
              fontWeight:    700,
              fontSize:      "clamp(20px, 2.4vw, 28px)",
              letterSpacing: "-0.02em",
              color:          "var(--off-white)",
              lineHeight:    1,
            }}
          >
            {card.label}
          </div>
        </motion.div>

        {/* ── Hover label — bottom position, slides up + fades in ──────── */}
        <motion.div
          style={{
            position:     "absolute",
            bottom:        0,
            left:          0,
            right:         0,
            padding:       "14px 12px",
            pointerEvents: "none",
          }}
          animate={{
            opacity: hovered ? 1 : 0,
            y:       hovered ? 0 : 10,
          }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            style={{
              fontFamily:    "var(--font-display)",
              fontWeight:    700,
              fontSize:      "clamp(16px, 2vw, 22px)",
              letterSpacing: "-0.01em",
              color:          "var(--off-white)",
              lineHeight:    1,
              marginBottom:  5,
            }}
          >
            {card.label}
          </div>
          <div
            style={{
              fontFamily:    "var(--font-body)",
              fontSize:       "9px",
              letterSpacing:  "1.8px",
              textTransform:  "uppercase",
              color:          "rgba(255,252,242,0.38)",
            }}
          >
            {card.subtitle}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ─── Overlay ──────────────────────────────────────────────────────────────────
export default function CardNav({ isOpen, onClose, thumbnails = [] }) {
  const location = useLocation();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => { onClose(); }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="card-nav"
          variants={overlayVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          onClick={onClose}
          style={{
            position:     "fixed",
            inset:         0,
            background:   "rgba(14,12,11,0.75)",
            zIndex:        200,
            display:       "flex",
            flexDirection: "column",
            padding:       "clamp(20px, 4vw, 44px)",
          }}
        >
          {/* Top bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display:        "flex",
              justifyContent:  "space-between",
              alignItems:     "center",
              marginBottom:   "clamp(32px, 5vh, 56px)",
            }}
          >
            <span
              style={{
                fontFamily:    "var(--font-display)",
                fontSize:      "13px",
                letterSpacing: "3.5px",
                color:          "rgba(255,252,242,0.35)",
                textTransform:  "uppercase",
              }}
            >
              Kyle Payawal
            </span>

            <button
              onClick={onClose}
              aria-label="Close menu"
              style={{
                background:     "none",
                border:          "0.5px solid rgba(255,252,242,0.14)",
                color:           "var(--off-white)",
                cursor:         "pointer",
                width:           36,
                height:          36,
                display:         "flex",
                alignItems:     "center",
                justifyContent:  "center",
                transition:      "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "rgba(255,252,242,0.38)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(255,252,242,0.14)")
              }
            >
              <X size={13} strokeWidth={1.5} />
            </button>
          </div>

          {/* Cards */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              flex:           1,
              display:        "flex",
              alignItems:    "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display:        "flex",
                gap:             "clamp(8px, 1.4vw, 14px)",
                flexWrap:       "wrap",
                justifyContent:  "center",
                maxWidth:        940,
                width:           "100%",
              }}
            >
              {NAV_CARDS.map((card, i) => (
                <NavCard
                  key={card.to}
                  card={card}
                  i={i}
                  isActive={location.pathname === card.to}
                  thumbItem={thumbnails[i] || null}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", paddingTop: "clamp(20px, 3vh, 36px)" }}>
            <span
              style={{
                fontFamily:    "var(--font-body)",
                fontSize:       "9px",
                letterSpacing:  "2px",
                textTransform:  "uppercase",
                color:          "rgba(255,252,242,0.18)",
              }}
            >
              Tarlac · Angeles City, Pampanga
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
