import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail } from "lucide-react";

const NAV_LINKS = [
  { to: "/",        label: "Home"          },
  { to: "/work",    label: "Work"          },
  { to: "/about",   label: "About"         },
  { to: "/inquire", label: "Inquire"       },
  { to: "/gallery", label: "Client Gallery"},
];

const SOCIAL = [
  { href: "mailto:payawalkyle@gmail.com",           Icon: Mail,      label: "Email"     },
  { href: "https://instagram.com/payawalkyle/",     Icon: Instagram, label: "Instagram" },
  { href: "https://facebook.com/kyle.payawal",      Icon: Facebook,  label: "Facebook"  },
];

const px = "clamp(24px, 6vw, 80px)";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "var(--ink)", color: "var(--off-white)" }}>

      {/* ── Top — tagline ── */}
      <div
        style={{
          padding:      `clamp(48px, 6vh, 80px) ${px} 0`,
          borderBottom: "0.5px solid rgba(240,235,224,0.08)",
          paddingBottom: "clamp(40px, 5vh, 64px)",
        }}
      >
        <p
          style={{
            fontFamily:            "var(--font-display)",
            fontStyle:              "italic",
            fontWeight:             300,
            fontSize:               "clamp(28px, 4vw, 52px)",
            letterSpacing:         "-0.02em",
            lineHeight:             1.1,
            color:                  "rgba(240,235,224,0.18)",
            fontVariationSettings:  "'opsz' 72",
            margin:                 0,
          }}
        >
          It's gonna look a little different.
          <br />
          That's the point.
        </p>
      </div>

      {/* ── Middle — columns ── */}
      <div
        style={{
          display:               "grid",
          gridTemplateColumns:   "1fr auto auto",
          gap:                   "clamp(40px, 6vw, 96px)",
          padding:               `clamp(40px, 5vh, 64px) ${px}`,
          borderBottom:          "0.5px solid rgba(240,235,224,0.08)",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <p
              style={{
                fontFamily:    "var(--font-display)",
                fontWeight:     700,
                fontSize:       "clamp(16px, 1.8vw, 22px)",
                letterSpacing:  "3px",
                textTransform:  "uppercase",
                color:          "var(--off-white)",
                margin:         "0 0 8px",
              }}
            >
              Kyle Payawal
            </p>
            <p
              style={{
                fontFamily:    "var(--font-body)",
                fontSize:       "11px",
                letterSpacing:  "2px",
                textTransform:  "uppercase",
                color:          "rgba(240,235,224,0.25)",
                margin:         0,
              }}
            >
              Photo &amp; Video · Philippines
            </p>
          </div>
          <p
            style={{
              fontFamily:    "var(--font-body)",
              fontSize:       "10px",
              letterSpacing:  "1.5px",
              color:          "rgba(240,235,224,0.15)",
              marginTop:      32,
            }}
          >
            Tarlac · Angeles City, Pampanga
          </p>
        </div>

        {/* Pages */}
        <div>
          <p style={colHeading}>Pages</p>
          <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={navLink}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--off-white)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,235,224,0.32)")}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Connect */}
        <div>
          <p style={colHeading}>Connect</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SOCIAL.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noreferrer"
                style={{ ...navLink, display: "flex", alignItems: "center", gap: 8 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--off-white)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,235,224,0.32)")}
              >
                <Icon size={12} strokeWidth={1.5} />
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        style={{
          padding:        `20px ${px}`,
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          gap:             16,
        }}
      >
        <p style={bottomText}>© {year} Kyle Payawal</p>
        <p style={bottomText}>All rights reserved</p>
      </div>
    </footer>
  );
}

// ─── Shared style tokens ───────────────────────────────────────────────────────

const colHeading = {
  fontFamily:    "var(--font-body)",
  fontSize:       "10px",
  letterSpacing:  "2.5px",
  textTransform:  "uppercase",
  color:          "rgba(240,235,224,0.2)",
  margin:         "0 0 16px",
};

const navLink = {
  fontFamily:    "var(--font-body)",
  fontSize:       "11px",
  letterSpacing:  "1.5px",
  textTransform:  "uppercase",
  color:          "rgba(240,235,224,0.32)",
  textDecoration: "none",
  transition:     "color 0.2s",
};

const bottomText = {
  fontFamily:    "var(--font-body)",
  fontSize:       "10px",
  letterSpacing:  "1px",
  color:          "rgba(240,235,224,0.15)",
  margin:         0,
};
