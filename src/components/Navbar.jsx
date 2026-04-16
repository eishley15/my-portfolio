import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

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
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/work" className="nav-link">
            Work
          </Link>
          <Link to="/about" className="nav-link">
            About
          </Link>
          <Link to="/contact" className="nav-link">
            Contact
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
          <div
            style={{
              maxHeight: menuOpen ? "400px" : "0",
              overflow: "hidden",
              transition: "max-height 0.4s ease",
              padding: menuOpen ? "0 40px 20px 40px" : "0 40px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <Link
                to="/"
                className="nav-link"
                style={{
                  color:
                    scrolled || isDarkBackground
                      ? "var(--off-white)"
                      : "var(--black)",
                  fontSize: "14px",
                }}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/work"
                className="nav-link"
                style={{
                  color:
                    scrolled || isDarkBackground
                      ? "var(--off-white)"
                      : "var(--black)",
                  fontSize: "14px",
                }}
                onClick={() => setMenuOpen(false)}
              >
                Work
              </Link>
              <Link
                to="/about"
                className="nav-link"
                style={{
                  color:
                    scrolled || isDarkBackground
                      ? "var(--off-white)"
                      : "var(--black)",
                  fontSize: "14px",
                }}
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="nav-link"
                style={{
                  color:
                    scrolled || isDarkBackground
                      ? "var(--off-white)"
                      : "var(--black)",
                  fontSize: "14px",
                }}
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/gallery"
                style={{
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
                      ? "0.5px solid rgba(240,235,224,0.3)"
                      : "0.5px solid rgba(14,12,11,0.3)",
                  padding: "12px 18px",
                  background: "transparent",
                  marginTop: "10px",
                  width: "fit-content",
                  display: "block",
                }}
                onClick={() => setMenuOpen(false)}
              >
                Client Gallery
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
