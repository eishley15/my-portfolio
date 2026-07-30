import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import CardNav from "./reactbits/CardNav";
import { useFeaturedPortfolio } from "../hooks/usePortfolio";

// Routes whose top-of-page hero is dark — navbar needs light text
const DARK_HERO_ROUTES = ["/inquire", "/gallery"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { items } = useFeaturedPortfolio(5);

  const isDarkHero  = DARK_HERO_ROUTES.includes(location.pathname);
  // Once scrolled, the cream backdrop appears → always use ink text
  const useLightText = isDarkHero && !scrolled;

  const logoColor = useLightText ? "rgba(240,235,224,0.85)" : "var(--ink)";
  const menuColor = useLightText ? "rgba(240,235,224,0.5)"  : "var(--ink-muted)";
  const menuHover = useLightText ? "rgba(240,235,224,0.9)"  : "var(--ink)";

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
            style={{
              fontFamily:    "var(--font-display)",
              fontWeight:     400,
              fontSize:       "13px",
              letterSpacing:  "3.5px",
              color:           logoColor,
              textDecoration: "none",
              textTransform:  "uppercase",
              transition:     "color 0.35s ease",
            }}
          >
            Kyle Payawal
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
              fontSize:       "11px",
              letterSpacing:  "2.5px",
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
        thumbnails={items}
      />
    </>
  );
}
