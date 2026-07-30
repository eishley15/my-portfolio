import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

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

export default function CardNav({ isOpen, onClose, thumbnails = [] }) {
  const location = useLocation();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

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
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--black-pure)",
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            padding: "clamp(20px, 4vw, 44px)",
          }}
        >
          {/* Top bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "clamp(32px, 5vh, 56px)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "13px",
                letterSpacing: "3.5px",
                color: "rgba(240,235,224,0.35)",
                textTransform: "uppercase",
              }}
            >
              Kyle Payawal
            </span>

            <button
              onClick={onClose}
              aria-label="Close menu"
              style={{
                background: "none",
                border: "0.5px solid rgba(240,235,224,0.14)",
                color: "var(--off-white)",
                cursor: "pointer",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "rgba(240,235,224,0.38)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(240,235,224,0.14)")
              }
            >
              <X size={13} strokeWidth={1.5} />
            </button>
          </div>

          {/* Cards */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "clamp(8px, 1.4vw, 14px)",
                flexWrap: "wrap",
                justifyContent: "center",
                maxWidth: 940,
                width: "100%",
              }}
            >
              {NAV_CARDS.map((card, i) => {
                const isActive = location.pathname === card.to;
                const thumb = thumbnails[i]?.url || null;

                return (
                  <motion.div
                    key={card.to}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    style={{ flex: "1 1 clamp(110px, 15vw, 160px)", maxWidth: 180 }}
                  >
                    <Link
                      to={card.to}
                      style={{
                        display: "block",
                        width: "100%",
                        aspectRatio: "3 / 4",
                        position: "relative",
                        overflow: "hidden",
                        textDecoration: "none",
                        background: "var(--gray-dark)",
                        border: isActive
                          ? "1px solid rgba(240,235,224,0.45)"
                          : "1px solid rgba(240,235,224,0.07)",
                        transition: "border-color 0.25s, transform 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(240,235,224,0.28)";
                        e.currentTarget.style.transform = "translateY(-5px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = isActive
                          ? "rgba(240,235,224,0.45)"
                          : "rgba(240,235,224,0.07)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {/* Thumbnail photo */}
                      {thumb && (
                        <img
                          src={thumb}
                          alt={card.label}
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            opacity: 0.75,
                          }}
                          loading="lazy"
                        />
                      )}

                      {/* Gradient overlay — always present */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: thumb
                            ? "linear-gradient(to top, rgba(14,12,11,0.9) 0%, rgba(14,12,11,0.3) 55%, rgba(14,12,11,0.1) 100%)"
                            : "linear-gradient(160deg, rgba(40,38,35,0.9) 0%, rgba(20,18,16,1) 100%)",
                        }}
                      />

                      {/* Active dot */}
                      {isActive && (
                        <div
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "var(--off-white)",
                          }}
                        />
                      )}

                      {/* Label */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: "14px 12px",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 700,
                            fontSize: "clamp(16px, 2vw, 22px)",
                            letterSpacing: "-0.01em",
                            color: "var(--off-white)",
                            lineHeight: 1,
                            marginBottom: 5,
                          }}
                        >
                          {card.label}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "9px",
                            letterSpacing: "1.8px",
                            textTransform: "uppercase",
                            color: "rgba(240,235,224,0.38)",
                          }}
                        >
                          {card.subtitle}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", paddingTop: "clamp(20px, 3vh, 36px)" }}>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "9px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "rgba(240,235,224,0.18)",
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
