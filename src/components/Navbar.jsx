import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import CardNav from "./reactbits/CardNav";
import { useNavThumbnails } from "../hooks/useNavThumbnails";

// Routes whose top-of-page hero is dark — navbar needs light text
const DARK_HERO_ROUTES = ["/inquire", "/gallery"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { thumbnails } = useNavThumbnails();

  const isDarkHero  = DARK_HERO_ROUTES.includes(location.pathname);
  // Once scrolled, the cream backdrop appears → always use ink text
  const useLightText = isDarkHero && !scrolled;
  // /gallery is split-screen: logo is over dark left, menu button is over cream right
  const isGallery = location.pathname === "/gallery";

  // Logo filter mirrors menu color logic: white on dark hero, dark (ink) on cream
  const logoFilter = useLightText ? "brightness(0) invert(1)" : "brightness(0)";

  // On gallery the menu button sits over the cream right panel — always use ink
  const menuColor = (useLightText && !isGallery) ? "rgba(255,252,242,0.5)" : "var(--ink-muted)";
  const menuHover = (useLightText && !isGallery) ? "rgba(255,252,242,0.9)" : "var(--ink)";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <>
      <nav
        style={{
          position:      "fixed",
          top:            0,
          left:           0,
          right:          0,
          zIndex:         100,
          background:     scrolled ? "rgba(237,232,220,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(18px)" : "none",
          borderBottom:   scrolled ? "0.5px solid var(--border)" : "none",
          transition:     "background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease",
        }}
      >
        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            padding:        "18px clamp(20px, 5vw, 48px)",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            aria-label="Kyle Payawal — home"
            style={{ textDecoration: "none", display: "flex", alignItems: "center" }}
          >
            <img
              src="/logo.svg"
              alt="Kyle Payawal"
              width={48}
              height={48}
              style={{
                filter:     logoFilter,
                transition: "filter 0.35s ease",
                display:    "block",
              }}
            />
          </Link>

          {/* Menu button */}
          <motion.button
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            style={{
              background:   "none",
              border:        "none",
              color:          menuColor,
              cursor:        "pointer",
              display:       "flex",
              alignItems:    "center",
              gap:            7,
              padding:        0,
              fontFamily:    "var(--font-body)",
              fontSize:       "13px",
              letterSpacing:  "2px",
              textTransform:  "uppercase",
              transition:     "color 0.35s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = menuHover)}
            onMouseLeave={(e) => (e.currentTarget.style.color = menuColor)}
          >
            <span style={{ display: "flex", flexDirection: "column", gap: 4, width: 18 }}>
              {[0, 1].map((i) => (
                <motion.span
                  key={i}
                  style={{
                    display:        "block",
                    height:          "0.5px",
                    background:      "currentColor",
                    transformOrigin: i === 0 ? "right" : "left",
                    width:           i === 0 ? "100%" : "60%",
                  }}
                />
              ))}
            </span>
            Menu
          </motion.button>
        </div>
      </nav>

      <CardNav
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        thumbnails={thumbnails}
      />
    </>
  );
}
