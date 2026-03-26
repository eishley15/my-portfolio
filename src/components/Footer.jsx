import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
import { useState, useEffect } from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <footer
      style={{
        background: "var(--black-pure)",
        borderTop: "0.5px solid rgba(240,235,224,0.06)",
        padding: "60px clamp(24px, 6vw, 80px) 36px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          gap: !isMobile ? "40px" : "48px",
          marginBottom: "48px",
          textAlign: !isMobile ? "left" : "center",
          flexDirection: !isMobile ? "row" : "column",
        }}
      >
        {/* Left */}
        <div
          style={{
            textAlign: !isMobile ? "left" : "center",
            width: !isMobile ? "auto" : "100%",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              letterSpacing: "3px",
              color: "var(--off-white)",
              marginBottom: "8px",
            }}
          >
            KYLE PAYAWAL
          </p>
          <p
            className="font-serif"
            style={{
              fontStyle: "italic",
              fontSize: "13px",
              color: "var(--text-muted)",
              lineHeight: 1.6,
            }}
          >
            It's gonna look a little different.
            <br />
            That's the point.
          </p>
        </div>

        {/* Right — socials */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: !isMobile ? "flex-end" : "center",
            gap: "16px",
            width: !isMobile ? "auto" : "100%",
          }}
        >
          <a
            href="https://instagram.com/payawalkyle/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "rgba(240,235,224,0.35)",
              textDecoration: "none",
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--off-white)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(240,235,224,0.35)")
            }
          >
            <Instagram size={14} /> Instagram
          </a>
          <a
            href="https://facebook.com/kyle.payawal"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "rgba(240,235,224,0.35)",
              textDecoration: "none",
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--off-white)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(240,235,224,0.35)")
            }
          >
            <Facebook size={14} /> Facebook
          </a>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "9px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "rgba(240,235,224,0.18)",
              marginTop: "8px",
            }}
          >
            kylepayawal.studio
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "0.5px solid rgba(240,235,224,0.06)",
          paddingTop: "24px",
          display: "flex",
          justifyContent: !isMobile ? "space-between" : "center",
          alignItems: "center",
          flexDirection: !isMobile ? "row" : "column",
          flexWrap: "wrap",
          gap: "12px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "10px",
            letterSpacing: "1px",
            color: "rgba(240,235,224,0.18)",
          }}
        >
          © {year} Kyle Payawal · Tarlac · Angeles City, Pampanga
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "10px",
            letterSpacing: "1px",
            color: "rgba(240,235,224,0.12)",
          }}
        >
          Photo & Video · Philippines
        </p>
      </div>
    </footer>
  );
}
