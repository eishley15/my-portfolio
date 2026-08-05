import { useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, useScroll, useTransform } from "framer-motion";
import { Instagram, Facebook, Mail, ArrowUpRight } from "lucide-react";
import { ButtonLink } from "../components/ui/button";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICES = [
  "Wedding", "Debut", "Christening", "Birthday",
  "Portraits", "Lifestyle", "Product", "Pageant",
  "Commercial", "SaaS Films",
];

const GEAR = [
  { label: "Shoots with",   value: "Sony A7 IV · Sony A6400" },
  { label: "Favorite light", value: "Overcast diffused & golden hour" },
  { label: "Never without",  value: "Three backup cards and a playlist" },
  { label: "Always brings",  value: "A reflector and a sense of calm" },
];

const SOCIAL = [
  { href: "mailto:payawalkyle@gmail.com",             Icon: Mail,      label: "Email" },
  { href: "https://www.instagram.com/payawalkyle/",   Icon: Instagram,  label: "Instagram" },
  { href: "https://www.facebook.com/kyle.payawal",    Icon: Facebook,   label: "Facebook" },
];

// ─── Service Marquee ──────────────────────────────────────────────────────────

function ServiceMarquee({ onAccent = false }) {
  const doubled = [...SERVICES, ...SERVICES];
  const textColor = onAccent ? "rgba(255,252,242,0.85)" : "var(--ink-muted)";
  return (
    <div style={{ overflow: "hidden" }}>
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
        style={{
          display:    "flex",
          gap:        "clamp(32px, 5vw, 64px)",
          alignItems: "baseline",
          willChange: "transform",
        }}
      >
        {doubled.map((s, i) => {
          const isItalic = i % 3 === 1;
          return (
            <span
              key={i}
              style={{
                fontFamily:            "var(--font-display)",
                fontStyle:             isItalic ? "italic" : "normal",
                fontWeight:            300,
                fontSize:              "clamp(32px, 4vw, 52px)",
                letterSpacing:         "-0.025em",
                color:                 textColor,
                flexShrink:            0,
                fontVariationSettings: "'opsz' 72",
                lineHeight:            1,
              }}
            >
              {s}
            </span>
          );
        })}
      </motion.div>
    </div>
  );
}

// ─── Parallax Photo ───────────────────────────────────────────────────────────

function ParallaxPhoto() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target:  ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <div
      ref={ref}
      style={{
        position:   "relative",
        overflow:   "hidden",
        height:     "100%",
        minHeight:  "clamp(420px, 70vh, 820px)",
      }}
    >
      <motion.img
        src="/kylepayawalprofile.webp"
        alt="Kyle Payawal"
        style={{
          y,
          width:      "100%",
          height:     "112%",
          objectFit:  "cover",
          display:    "block",
          marginTop:  "-6%",
        }}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const px = "clamp(24px, 6vw, 80px)";

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100svh", "--font-display": "'Fraunces', serif" }}
    >
      <Helmet>
        <title>About — Kyle Payawal</title>
        <meta name="description" content="Kyle Payawal is a photographer and videographer based in Tarlac and Angeles City. He shoots images and films that live between flash-lit editorial and sun-bleached handycam footage." />
        <link rel="canonical" href="https://kylepayawal.studio/about" />
      </Helmet>

      {/* ── §1 HERO ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          display:             "grid",
          gridTemplateColumns: "1fr 1fr",
          height:              "100svh",
          overflow:            "hidden",
        }}
      >
        {/* Photo — left column */}
        <ParallaxPhoto />

        {/* Text — right column */}
        <div
          style={{
            display:        "flex",
            flexDirection:  "column",
            justifyContent: "flex-end",
            padding:        `clamp(72px, 8vh, 96px) ${px} clamp(32px, 4vh, 52px)`,
            gap:             0,
            overflow:       "hidden",
          }}
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            style={{
              fontFamily:    "var(--font-body)",
              fontSize:       "11px",
              letterSpacing:  "3px",
              textTransform:  "uppercase",
              color:          "var(--ink-muted)",
              marginBottom:   "clamp(20px, 3vh, 32px)",
            }}
          >
            Photographer · Videographer · Editor
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.55 }}
            style={{
              fontFamily:            "'Outfit', sans-serif",
              fontWeight:             500,
              fontSize:               "clamp(56px, 7.5vw, 96px)",
              letterSpacing:         "-0.035em",
              lineHeight:             0.88,
              color:                  "var(--ink)",
              margin:                 0,
              fontVariationSettings:  "'opsz' 144",
              textTransform:          "uppercase",
            }}
          >
            Kyle
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.55 }}
            style={{
              fontFamily:           "var(--font-display)",
              fontWeight:            500,
              fontStyle:             "italic",
              fontSize:              "clamp(44px, 6.5vw, 84px)",
              letterSpacing:        "-0.025em",
              lineHeight:            1.0,
              color:                 "var(--ink)",
              margin:                0,
              fontVariationSettings: "'opsz' 120",
              marginBottom:          "clamp(20px, 2.5vh, 32px)",
            }}
          >
            Payawal
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            style={{
              fontFamily:  "var(--font-body)",
              fontWeight:   500,
              fontSize:     "clamp(14px, 1.5vw, 16px)",
              lineHeight:   1.7,
              color:        "var(--ink-muted)",
              maxWidth:     "44ch",
              margin:       0,
            }}
          >
            Based in Tarlac and Angeles City, Pampanga. I shoot images and
            films that live somewhere between flash-lit editorial and
            sun-bleached handycam footage — because every event deserves both
            polish and soul.
          </motion.p>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            style={{
              marginTop:     "clamp(36px, 5vh, 56px)",
              display:       "flex",
              alignItems:    "center",
              gap:            8,
            }}
          >
            <div
              style={{
                width:       24,
                height:      "0.5px",
                background:  "var(--ink-faint)",
              }}
            />
            <span
              style={{
                fontFamily:    "var(--font-body)",
                fontSize:       "10px",
                letterSpacing:  "2px",
                textTransform:  "uppercase",
                color:          "var(--ink-faint)",
              }}
            >
              Scroll
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── §2 BIO ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--bg)",
          padding:    `clamp(64px, 8vw, 120px) ${px}`,
          display:    "grid",
          gridTemplateColumns: "1fr 1fr",
          gap:        "clamp(40px, 6vw, 96px)",
          alignItems: "start",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p
            style={{
              fontFamily:  "var(--font-body)",
              fontWeight:   500,
              fontSize:     "clamp(15px, 1.6vw, 17px)",
              lineHeight:   1.75,
              color:        "var(--ink)",
              margin:       "0 0 24px",
            }}
          >
            From debut celebrations to pageant advocacy films, product shoots
            to wedding days — I bring a consistent obsession with light,
            texture, and the in-between moments that make everything real.
          </p>
          <p
            style={{
              fontFamily:  "var(--font-body)",
              fontWeight:   500,
              fontSize:     "clamp(15px, 1.6vw, 17px)",
              lineHeight:   1.75,
              color:        "var(--ink)",
              margin:       0,
            }}
          >
            The work comes from a belief that photography isn't about
            capturing what's there — it's about noticing what almost wasn't.
            The blink before the tears. The hands that don't know where to
            go. The light that arrives exactly once.
          </p>
        </motion.div>

        {/* Pull quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{
            margin:        0,
            paddingLeft:   "clamp(20px, 3vw, 36px)",
            borderLeft:    "0.5px solid rgba(37,36,34,0.2)",
          }}
        >
          <p
            style={{
              fontFamily:           "var(--font-display)",
              fontStyle:             "italic",
              fontWeight:            500,
              fontSize:              "clamp(21px, 2.4vw, 28px)",
              lineHeight:            1.35,
              letterSpacing:        "-0.015em",
              color:                 "var(--ink)",
              fontVariationSettings: "'opsz' 48",
              margin:                "0 0 20px",
            }}
          >
            "Every frame is a conversation between the light and what it
            refuses to show."
          </p>
          <cite
            style={{
              fontFamily:    "var(--font-body)",
              fontSize:       "10px",
              letterSpacing:  "2px",
              textTransform:  "uppercase",
              color:          "var(--ink-muted)",
              fontStyle:      "normal",
            }}
          >
            Kyle Payawal
          </cite>
        </motion.blockquote>
      </section>

      {/* ── §3 SERVICES MARQUEE ─────────────────────────────────────────────── */}
      <section
        style={{
          background:    "var(--accent)",
          padding:       `clamp(48px, 6vw, 80px) 0`,
          overflow:      "hidden",
        }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            fontFamily:    "var(--font-body)",
            fontSize:       "10px",
            letterSpacing:  "3px",
            textTransform:  "uppercase",
            color:          "rgba(255,252,242,0.7)",
            textAlign:      "center",
            marginBottom:   "clamp(24px, 3vh, 40px)",
          }}
        >
          Services
        </motion.p>
        <ServiceMarquee onAccent />
      </section>

      {/* ── §4 BEHIND THE LENS ──────────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--bg)",
          padding:    `clamp(64px, 8vw, 120px) ${px}`,
          display:    "grid",
          gridTemplateColumns: "1fr 2fr",
          gap:        "clamp(32px, 5vw, 80px)",
          alignItems: "start",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            style={{
              fontFamily:            "var(--font-display)",
              fontWeight:             500,
              fontSize:               "clamp(36px, 4.5vw, 56px)",
              letterSpacing:         "-0.03em",
              lineHeight:             0.92,
              color:                  "var(--ink)",
              margin:                 0,
              textTransform:          "uppercase",
              fontVariationSettings:  "'opsz' 72",
            }}
          >
            Behind
          </h2>
          <h2
            style={{
              fontFamily:           "var(--font-display)",
              fontStyle:             "italic",
              fontWeight:            500,
              fontSize:              "clamp(32px, 4vw, 48px)",
              letterSpacing:        "-0.02em",
              lineHeight:            1.05,
              color:                 "var(--ink)",
              margin:                0,
              fontVariationSettings: "'opsz' 60",
            }}
          >
            the Lens
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display:       "flex",
            flexDirection: "column",
            gap:            0,
          }}
        >
          {GEAR.map(({ label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
              style={{
                display:       "grid",
                gridTemplateColumns: "clamp(110px, 14vw, 160px) 1fr",
                gap:            "clamp(16px, 3vw, 40px)",
                alignItems:    "baseline",
                padding:        "clamp(16px, 2.2vw, 24px) 0",
                borderBottom:   "0.5px solid rgba(37,36,34,0.15)",
              }}
            >
              <span
                style={{
                  fontFamily:    "var(--font-body)",
                  fontSize:       "10px",
                  letterSpacing:  "1.8px",
                  textTransform:  "uppercase",
                  color:          "var(--ink-muted)",
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontFamily:  "var(--font-body)",
                  fontSize:     "clamp(13px, 1.4vw, 15px)",
                  color:        "var(--ink)",
                  lineHeight:   1.5,
                }}
              >
                {value}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── §5 CONNECT ──────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "var(--bg)",
          padding:    `clamp(64px, 8vw, 120px) ${px}`,
          display:    "grid",
          gridTemplateColumns: "1fr 1fr",
          gap:        "clamp(40px, 6vw, 96px)",
          alignItems: "start",
        }}
      >
        {/* Links + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{
            display:       "flex",
            flexDirection: "column",
            gap:            "clamp(32px, 4vh, 48px)",
            order:          2,
          }}
        >
          {/* Social links */}
          <div
            style={{
              display:       "flex",
              flexDirection: "column",
              gap:            16,
            }}
          >
            {SOCIAL.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noreferrer"
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:             10,
                  color:           "var(--ink-muted)",
                  textDecoration:  "none",
                  transition:      "color 0.2s",
                  width:           "fit-content",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-muted)")}
              >
                <Icon size={15} strokeWidth={1.5} />
                <span
                  style={{
                    fontFamily:    "var(--font-body)",
                    fontSize:       "11px",
                    letterSpacing:  "2px",
                    textTransform:  "uppercase",
                  }}
                >
                  {label}
                </span>
              </a>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <ButtonLink to="/inquire" variant="default">
              Book a Session
              <ArrowUpRight size={13} strokeWidth={1.5} />
            </ButtonLink>
            <ButtonLink to="/work" variant="outline">
              View Work
            </ButtonLink>
          </div>

          {/* Location note */}
          <p
            style={{
              fontFamily:    "var(--font-body)",
              fontSize:       "10px",
              letterSpacing:  "2px",
              textTransform:  "uppercase",
              color:          "var(--ink-faint)",
              margin:         0,
            }}
          >
            Tarlac · Angeles City, Pampanga · Philippines
          </p>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ order: 1 }}
        >
          <h2
            style={{
              fontFamily:   "'Outfit', sans-serif",
              fontWeight:    500,
              fontSize:      "clamp(40px, 5.5vw, 80px)",
              letterSpacing: "-0.035em",
              lineHeight:    0.9,
              color:         "var(--ink)",
              textTransform: "uppercase",
              margin:        "0 0 8px",
            }}
          >
            Let's make
          </h2>
          <h2
            style={{
              fontFamily:           "var(--font-display)",
              fontStyle:             "italic",
              fontWeight:            500,
              fontSize:              "clamp(36px, 5vw, 72px)",
              letterSpacing:        "-0.025em",
              lineHeight:            1.0,
              color:                 "var(--ink)",
              fontVariationSettings: "'opsz' 120",
              margin:                0,
            }}
          >
            something real.
          </h2>
        </motion.div>
      </section>
    </motion.div>
  );
}
