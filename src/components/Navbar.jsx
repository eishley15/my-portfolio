import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const isHomePage = location.pathname === "/";
  const isContactPage = location.pathname === "/contact";
  const isGalleryPage = location.pathname === "/gallery";
  const isDarkBackground = isHomePage || isContactPage || isGalleryPage;

  return (
    <>
      <nav
        className={!scrolled && !isDarkBackground ? "navbar-transparent" : ""}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          background: menuOpen && isMobile
            ? (scrolled || isDarkBackground
                ? "rgba(14,12,11,0.7)"
                : "rgba(240,235,224,0.7)")
            : scrolled
            ? "rgba(14,12,11,0.88)"
            : "transparent",
          backdropFilter: scrolled || (menuOpen && isMobile) ? "blur(16px)" : "none",
          transition:
            "background 0.4s ease, backdrop-filter 0.4s ease, color 0.4s ease",
          borderBottom:
            scrolled || (menuOpen && isMobile)
              ? (scrolled || isDarkBackground
                  ? "0.5px solid rgba(240,235,224,0.06)"
                  : "0.5px solid rgba(14,12,11,0.08)")
              : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "22px 40px",
          }}
        >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "15px",
            letterSpacing: "3.5px",
            color:
              scrolled || isDarkBackground
                ? "var(--off-white)"
                : "var(--black)",
            textDecoration: "none",
            transition: "color 0.4s ease",
          }}
        >
          KYLE PAYAWAL
        </Link>

        {/* Desktop nav */}
        <div
          style={{
            display: !isMobile ? "flex" : "none",
            gap: "36px",
            alignItems: "center",
          }}
        >
          <Link 
            to="/" 
            className="nav-link"
            style={{
              color: location.pathname === "/" 
                ? (scrolled || isDarkBackground ? "var(--off-white)" : "var(--black)")
                : undefined,
              fontWeight: location.pathname === "/" ? "400" : "300",
            }}
          >
            Home
            {location.pathname === "/" && (
              <motion.div
                layoutId="activeIndicator"
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: scrolled || isDarkBackground ? "var(--red)" : "var(--red)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
          <Link 
            to="/work" 
            className="nav-link"
            style={{
              color: location.pathname === "/work" 
                ? (scrolled || isDarkBackground ? "var(--off-white)" : "var(--black)")
                : undefined,
              fontWeight: location.pathname === "/work" ? "400" : "300",
            }}
          >
            Work
            {location.pathname === "/work" && (
              <motion.div
                layoutId="activeIndicator"
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: scrolled || isDarkBackground ? "var(--red)" : "var(--red)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
          <Link 
            to="/about" 
            className="nav-link"
            style={{
              color: location.pathname === "/about" 
                ? (scrolled || isDarkBackground ? "var(--off-white)" : "var(--black)")
                : undefined,
              fontWeight: location.pathname === "/about" ? "400" : "300",
            }}
          >
            About
            {location.pathname === "/about" && (
              <motion.div
                layoutId="activeIndicator"
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: scrolled || isDarkBackground ? "var(--red)" : "var(--red)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
          <Link 
            to="/contact" 
            className="nav-link"
            style={{
              color: location.pathname === "/contact" 
                ? (scrolled || isDarkBackground ? "var(--off-white)" : "var(--black)")
                : undefined,
              fontWeight: location.pathname === "/contact" ? "400" : "300",
            }}
          >
            Contact
            {location.pathname === "/contact" && (
              <motion.div
                layoutId="activeIndicator"
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: scrolled || isDarkBackground ? "var(--red)" : "var(--red)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        </div>

        {/* Client Gallery CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link
            to="/gallery"
            style={{
              display: !isMobile ? "block" : "none",
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color:
                scrolled || isDarkBackground
                  ? "var(--off-white)"
                  : "var(--black)",
              textDecoration: "none",
              border:
                scrolled || isDarkBackground
                  ? "0.5px solid rgba(240,235,224,0.25)"
                  : "0.5px solid rgba(14,12,11,0.25)",
              padding: "9px 18px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "var(--red)";
              e.target.style.borderColor = "var(--red)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.borderColor =
                scrolled || isDarkBackground
                  ? "rgba(240,235,224,0.25)"
                  : "rgba(14,12,11,0.25)";
            }}
          >
            Client Gallery
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              color:
                scrolled || isDarkBackground
                  ? "var(--off-white)"
                  : "var(--black)",
              cursor: "pointer",
              display: isMobile ? "block" : "none",
              transition: "color 0.4s ease",
              zIndex: 100,
            }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        </div>

        {/* Mobile menu */}
        {isMobile && (
          <motion.div
            initial={false}
            animate={{
              height: menuOpen ? "100vh" : "0",
              opacity: menuOpen ? 1 : 0,
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              background: scrolled || isDarkBackground ? "var(--black)" : "var(--off-white)",
              overflow: "hidden",
              zIndex: 99,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "32px", alignItems: "center" }}>
              {[
                { to: "/", label: "Home" },
                { to: "/work", label: "Work" },
                { to: "/about", label: "About" },
                { to: "/contact", label: "Contact" },
              ].map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: menuOpen ? 1 : 0,
                    y: menuOpen ? 0 : 20,
                  }}
                  transition={{ delay: menuOpen ? i * 0.1 : 0, duration: 0.3 }}
                >
                  <Link
                    to={link.to}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "48px",
                      letterSpacing: "2px",
                      color: scrolled || isDarkBackground ? "var(--off-white)" : "var(--black)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onClick={() => setMenuOpen(false)}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color =
                        scrolled || isDarkBackground ? "var(--off-white)" : "var(--black)")
                    }
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: menuOpen ? 1 : 0,
                  y: menuOpen ? 0 : 20,
                }}
                transition={{ delay: menuOpen ? 0.4 : 0, duration: 0.3 }}
              >
                <Link
                  to="/gallery"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "10px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: scrolled || isDarkBackground ? "var(--off-white)" : "var(--black)",
                    textDecoration: "none",
                    border:
                      scrolled || isDarkBackground
                        ? "0.5px solid rgba(240,235,224,0.3)"
                        : "0.5px solid rgba(14,12,11,0.3)",
                    padding: "12px 24px",
                    display: "inline-block",
                    marginTop: "20px",
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  Client Gallery
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </nav>
    </>
  );
}
