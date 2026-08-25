import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useFeaturedPortfolio, usePortfolio } from "../hooks/usePortfolio";
import { isVideo } from "../lib/isVideo";
import LoadingScreen from "../components/LoadingScreen";
import DraggableStrip from "../components/DraggableStrip";
import TrueFocus from "../components/reactbits/TrueFocus";
import RotatingText from "../components/reactbits/RotatingText";
import CountUp from "../components/reactbits/CountUp";
import SpecularButton from "../components/reactbits/SpecularButton";
import LineSidebar from "../components/reactbits/LineSidebar";
import ScrollReveal from "../components/reactbits/ScrollReveal";
import GridMotion from "../components/reactbits/GridMotion";

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICES = ["Weddings", "Debuts", "Pageants", "Portraits", "Campaigns"];

const STATS = [
  { end: 200, suffix: "+", label: "Projects Delivered" },
  { end: 5,   suffix: "+", label: "Years of Experience" },
  { end: 10,  suffix: "",  label: "Services Offered" },
];

// Testimonials are loaded dynamically from the API (approved + show_on_home only)

const FAQ = [
  {
    q: "What types of events do you cover?",
    a: "Weddings, debuts, pageants, christenings, portrait sessions, and commercial campaigns. If it's worth capturing, it's worth doing right.",
  },
  {
    q: "Where are you based and do you travel?",
    a: "Based in Tarlac City and Angeles City, Pampanga. Available for travel anywhere in the Philippines — and internationally for the right project.",
  },
  {
    q: "How far in advance should I book?",
    a: "Weddings: 3–6 months in advance. Debuts, portraits, and commercial shoots: 2–4 weeks is usually enough, though earlier is always better during peak season.",
  },
  {
    q: "How long until I receive my photos?",
    a: "Weddings: 4–6 weeks. Portraits and shorter sessions: 1–2 weeks. Rush delivery is available for time-sensitive projects.",
  },
  {
    q: "Do you offer both photography and videography?",
    a: "Yes — both services are available together or separately. Combined photo + video packages offer better value and a unified visual story from the same shoot.",
  },
  {
    q: "How many images will I receive?",
    a: "Weddings typically receive 400–600 fully edited images. Portrait sessions: 80–150 images. The count is driven by the work, not an arbitrary cap.",
  },
  {
    q: "Do you offer same-day edits?",
    a: "Same-day edits (SDEs) are available as an add-on for events — a highlight reel delivered on the day itself, perfect for debut programs and wedding receptions.",
  },
  {
    q: "What does the booking process look like?",
    a: "Send an inquiry → receive a quote and package details → sign contract + pay deposit to hold your date → shoot day → photo delivery. Simple and transparent.",
  },
];

const BASE_SECTIONS = [
  { id: "hero",         label: "Intro"   },
  { id: "work-preview", label: "Work"    },
  { id: "stats",        label: "Stats"   },
  { id: "testimonials", label: "Reviews" },
  { id: "faq",          label: "FAQ"     },
  { id: "cta",          label: "Book"    },
];

// ─── CategoryCard ─────────────────────────────────────────────────────────────

function CategoryCard({ item }) {
  return (
    <Link
      to={`/work?category=${encodeURIComponent(item.category)}`}
      style={{ display: "block", textDecoration: "none" }}
    >
      <motion.div
        whileHover="hover"
        initial="rest"
        style={{
          position: "relative",
          overflow: "hidden",
          aspectRatio: "3 / 4",
          background: "var(--bg-dim)",
          cursor: "pointer",
        }}
      >
        <motion.img
          variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          src={item.url}
          alt={item.category}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          loading="lazy"
        />

        {/* Always-on gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(14,12,11,0.85) 0%, rgba(14,12,11,0.12) 55%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Text block */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "clamp(14px, 2.5vw, 24px)",
          }}
        >
          <motion.p
            variants={{ rest: { y: 0 }, hover: { y: -6 } }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(18px, 2.2vw, 28px)",
              color: "#FFFCF2",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              marginBottom: 6,
            }}
          >
            {item.category}
          </motion.p>

          <motion.span
            variants={{ rest: { opacity: 0, y: 8 }, hover: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={{
              display: "inline-block",
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              color: "rgba(255,252,242,0.6)",
            }}
          >
            View Work →
          </motion.span>
        </div>
      </motion.div>
    </Link>
  );
}

// ─── FaqItem ──────────────────────────────────────────────────────────────────

function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="faq-item">
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 24,
          padding: "22px 0",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(14px, 1.6vw, 17px)",
            fontWeight: 500,
            color: "var(--off-white)",
            letterSpacing: "0.2px",
          }}
        >
          {q}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            display: "inline-flex",
            fontFamily: "var(--font-body)",
            fontSize: "18px",
            fontWeight: 500,
            color: "rgba(255,252,242,0.6)",
            flexShrink: 0,
          }}
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(13px, 1.4vw, 15px)",
                fontWeight: 500,
                lineHeight: 1.75,
                color: "rgba(255,252,242,0.7)",
                paddingBottom: 24,
                maxWidth: 620,
              }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { items, isLoading } = useFeaturedPortfolio(12);
  // Portfolio photos for CTA GridMotion background (all, no category filter)
  const { items: allItems } = usePortfolio(null);
  const gridMotionUrls = allItems
    .filter((it) => it.url && !isVideo(it))
    .map((it) => it.url);
  const [openFaq, setOpenFaq] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler, { passive: true });
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    fetch("/api/picks?action=testimonials")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(({ testimonials: data }) => setTestimonials(data || []))
      .catch(() => {}); // Silently fail — section hides when empty
  }, []);

  const heroPhoto = "/kylepayawalprofile.webp";

  return (
    <>
      <Helmet>
        <title>Kyle Payawal — Photographer & Videographer | Tarlac & Angeles City</title>
        <meta
          name="description"
          content="Kyle Payawal is a photographer and videographer based in Tarlac and Angeles City, Philippines. Specializing in weddings, debuts, pageants, portraits, and commercial campaigns."
        />
        <meta property="og:title" content="Kyle Payawal — Photographer & Videographer" />
        <meta property="og:type" content="website" />
      </Helmet>

      <AnimatePresence>
        {isLoading && <LoadingScreen key="loading" isVisible={isLoading} />}
      </AnimatePresence>

      <LineSidebar sections={BASE_SECTIONS.filter((s) => s.id !== "testimonials" || testimonials.length > 0)} />

      {/* ══ HERO ════════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        style={{
          height: "100svh",
          overflow: "hidden",
          ...(isMobile
            ? { position: "relative" }
            : { display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr" }),
        }}
      >
        {/* Mobile: full-bleed background photo */}
        {isMobile && heroPhoto && (
          <motion.img
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src={heroPhoto}
            alt="Portfolio"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 15%",
              display: "block",
            }}
          />
        )}

        {/* Text column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            position: isMobile ? "absolute" : "relative",
            ...(isMobile
              ? {
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(to bottom, transparent, var(--bg) 30%)",
                  padding: "0 clamp(20px, 5vw, 36px) clamp(28px, 5vw, 40px)",
                }
              : {
                  background: "var(--bg)",
                  justifyContent: "center",
                  padding: "clamp(40px, 6vw, 80px)",
                  overflow: "hidden",
                }),
          }}
        >
          {!isMobile && (
            <motion.p
              className="eyebrow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              style={{ marginBottom: "clamp(20px, 3vw, 32px)" }}
            >
              Photographer · Videographer · Editor
            </motion.p>
          )}

          <TrueFocus
            duration={1.0}
            pause={1.6}
            blurAmount={5}
            borderColor="var(--ink-faint)"
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: isMobile
                  ? "clamp(28px, 7.5vw, 40px)"
                  : "clamp(42px, 4.9vw, 76px)",
                textTransform: "uppercase",
                letterSpacing: "-0.03em",
                lineHeight: isMobile ? 1.0 : 0.92,
                display: "block",
                color: "var(--ink)",
              }}
            >
              It's gonna look
            </span>
            <span
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 700,
                fontStyle: "italic",
                fontSize: isMobile
                  ? "clamp(22px, 6vw, 32px)"
                  : "clamp(38px, 4.5vw, 72px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                fontVariationSettings: "'opsz' 120",
                display: "block",
                paddingBottom: isMobile ? "2px" : 0,
                color: "var(--ink)",
              }}
            >
              a little different.
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: isMobile
                  ? "clamp(28px, 7.5vw, 40px)"
                  : "clamp(42px, 4.9vw, 76px)",
                textTransform: "uppercase",
                letterSpacing: "-0.03em",
                lineHeight: isMobile ? 1.0 : 0.92,
                display: "block",
                color: "var(--ink)",
              }}
            >
              That's the point.
            </span>
          </TrueFocus>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.55, ease: "easeOut" }}
            style={{
              height: "0.5px",
              background: "var(--border)",
              margin: isMobile ? "clamp(16px, 4vw, 24px) 0" : "clamp(20px, 3.5vw, 36px) 0",
              transformOrigin: "left",
            }}
          />

          {/* Available for */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(14px, 1.5vw, 16px)",
              fontWeight: 500,
              color: "var(--ink-muted)",
              lineHeight: 1.5,
            }}
          >
            Available for{" "}
            <RotatingText
              words={SERVICES}
              style={{
                fontWeight: 500,
                color: "var(--ink)",
                minWidth: "6.5em",
              }}
            />
          </motion.p>

          <motion.p
            className="eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            style={{ marginTop: 6 }}
          >
            Tarlac · Angeles City, Pampanga
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            style={{ marginTop: isMobile ? "clamp(20px, 4vw, 32px)" : "clamp(28px, 4.5vw, 52px)" }}
          >
            <SpecularButton
              to="/work"
              size="md"
              radius={0}
              tint="#252422"
              tintOpacity={0.06}
              blur={0}
              textColor="#252422"
              lineColor="#EB5E28"
              baseColor="#403D39"
              intensity={1.1}
              shineSize={12}
              shineFade={38}
              thickness={1.2}
              speed={0.3}
              followMouse
              proximity={280}
              autoAnimate={false}
            >
              View Work
            </SpecularButton>
          </motion.div>

        </div>

        {/* Desktop: photo on right */}
        {!isMobile && (
          <div style={{ position: "relative", overflow: "hidden", background: "var(--bg-dim)" }}>
            {heroPhoto && (
              <motion.img
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                src={heroPhoto}
                alt="Portfolio"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            )}
          </div>
        )}
      </section>

      {/* ══ WORK PREVIEW ════════════════════════════════════════════════════════ */}
      <section
        id="work-preview"
        style={{
          paddingTop:    "clamp(64px, 8vw, 120px)",
          paddingBottom: "clamp(40px, 5vw, 72px)",
          background:    "var(--bg)",
        }}
      >
        {/* Header — padded horizontally */}
        <div style={{ paddingLeft: "clamp(24px, 6vw, 80px)", paddingRight: "clamp(24px, 6vw, 80px)" }}>
          <ScrollReveal>
            <div
              style={{
                display:        "flex",
                justifyContent: "space-between",
                alignItems:     "flex-end",
                marginBottom:   "clamp(28px, 4vw, 48px)",
                flexWrap:       "wrap",
                gap:             16,
              }}
            >
              <div>
                <p className="eyebrow" style={{ marginBottom: 12 }}>Selected Work</p>
                <h2
                  style={{
                    fontFamily:           "var(--font-display)",
                    fontWeight:            500,
                    fontSize:              "clamp(36px, 5vw, 72px)",
                    letterSpacing:        "-0.03em",
                    lineHeight:            0.95,
                    fontVariationSettings: "'opsz' 144",
                    color:                 "var(--ink)",
                  }}
                >
                  What I{" "}
                  <span className="font-serif">shoot.</span>
                </h2>
              </div>
              <Link
                to="/work"
                style={{
                  fontFamily:    "var(--font-body)",
                  fontSize:       "11px",
                  letterSpacing:  "2.5px",
                  textTransform:  "uppercase",
                  color:          "var(--ink-muted)",
                  textDecoration: "none",
                  borderBottom:   "0.5px solid var(--border)",
                  paddingBottom:   2,
                  alignSelf:      "flex-end",
                  transition:     "color 0.2s",
                }}
              >
                All Work →
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* Draggable strip — full bleed */}
        {items.length > 0 ? (
          <DraggableStrip items={items} />
        ) : (
          !isLoading && (
            <p
              style={{
                fontFamily:  "var(--font-body)",
                fontSize:     14,
                color:        "var(--ink-muted)",
                paddingLeft:  "clamp(24px, 6vw, 80px)",
              }}
            >
              No portfolio categories found.
            </p>
          )
        )}
      </section>

      {/* ══ STATS ═══════════════════════════════════════════════════════════════ */}
      <section
        id="stats"
        style={{
          padding: "clamp(56px, 7vw, 96px) clamp(24px, 6vw, 80px)",
          borderTop: "0.5px solid var(--border)",
          borderBottom: "0.5px solid var(--border)",
          background: "var(--bg)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "clamp(32px, 4vw, 48px)",
            textAlign: "center",
          }}
        >
          {STATS.map(({ end, suffix, label }) => (
            <div key={label}>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: "clamp(40px, 5vw, 72px)",
                  letterSpacing: "-0.04em",
                  lineHeight: 0.9,
                  fontVariationSettings: "'opsz' 144",
                  color: "var(--ink)",
                }}
              >
                <CountUp end={end} suffix={suffix} duration={2} />
              </p>
              <p className="eyebrow" style={{ marginTop: 14 }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TESTIMONIALS — only renders when approved reviews exist ════════════ */}
      {testimonials.length > 0 && (
        <section
          id="testimonials"
          style={{
            padding: "clamp(64px, 8vw, 120px) clamp(24px, 6vw, 80px)",
            background: "var(--surface)",
          }}
        >
          <ScrollReveal>
            <p className="eyebrow" style={{ marginBottom: 12 }}>Client Words</p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: "clamp(32px, 4.5vw, 64px)",
                letterSpacing: "-0.03em",
                lineHeight: 0.95,
                marginBottom: "clamp(40px, 6vw, 72px)",
                fontVariationSettings: "'opsz' 144",
                color: "var(--ink)",
              }}
            >
              What they{" "}
              <span className="font-serif">say.</span>
            </h2>
          </ScrollReveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
              gap: "clamp(16px, 2vw, 24px)",
            }}
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                style={{
                  padding: "clamp(24px, 3vw, 36px)",
                  border: "0.5px solid var(--border)",
                  background: "var(--bg)",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontWeight: 500,
                    fontSize: "clamp(16px, 1.8vw, 21px)",
                    lineHeight: 1.5,
                    color: "var(--ink)",
                    letterSpacing: "-0.01em",
                    marginBottom: 24,
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ borderTop: "0.5px solid var(--border)", paddingTop: 16 }}>
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 13, color: "var(--ink)", marginBottom: 3 }}>
                    {t.client_name}
                  </p>
                  <p className="eyebrow">
                    {t.event_type || "Client"} · {new Date(t.created_at).getFullYear()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ══ FAQ ═════════════════════════════════════════════════════════════════ */}
      <section
        id="faq"
        style={{
          padding: "clamp(64px, 8vw, 120px) clamp(24px, 6vw, 80px)",
          background: "var(--bg-dim)",
          "--border": "rgba(255,252,242,0.2)",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <ScrollReveal>
            <p className="eyebrow" style={{ marginBottom: 12, color: "rgba(255,252,242,0.6)" }}>Got Questions</p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: "clamp(32px, 4.5vw, 64px)",
                letterSpacing: "-0.03em",
                lineHeight: 0.95,
                marginBottom: "clamp(36px, 5.5vw, 64px)",
                fontVariationSettings: "'opsz' 144",
                color: "var(--off-white)",
              }}
            >
              Let's clear{" "}
              <span className="font-serif">things up.</span>
            </h2>
          </ScrollReveal>

          {FAQ.map((item, i) => (
            <FaqItem
              key={i}
              {...item}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* ══ CTA ═════════════════════════════════════════════════════════════════ */}
      <section
        id="cta"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "clamp(80px, 10vw, 140px) clamp(24px, 6vw, 80px)",
          background: "var(--black)",
          textAlign: "center",
        }}
      >
        {/* GridMotion background */}
        {gridMotionUrls.length > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              pointerEvents: "none",
              opacity: 0.2,
            }}
          >
            <GridMotion items={gridMotionUrls} gradientColor="rgba(14,12,11,0.55)" />
          </div>
        )}

        {/* Dark vignette overlay so text stays readable */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "radial-gradient(ellipse at center, rgba(14,12,11,0.35) 0%, rgba(14,12,11,0.82) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* CTA content sits above the background */}
        <div style={{ position: "relative", zIndex: 2 }}>
        <ScrollReveal>
          <p
            className="eyebrow"
            style={{ color: "rgba(255,252,242,0.35)", marginBottom: 20 }}
          >
            Ready When You Are
          </p>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(42px, 4.9vw, 76px)",
              letterSpacing: "-0.03em",
              lineHeight: 0.92,
              color: "var(--off-white)",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Make something
          </h2>

          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(38px, 4.5vw, 72px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              color: "var(--off-white)",
              fontVariationSettings: "'opsz' 120",
              marginBottom: "clamp(28px, 3.5vw, 48px)",
            }}
          >
            unforgettable.
          </h2>

          {/* thin divider rule */}
          <div
            style={{
              width: 40,
              height: 1,
              background: "rgba(255,252,242,0.18)",
              margin: "0 auto clamp(24px, 3vw, 40px)",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            <SpecularButton
              to="/inquire"
              size="lg"
              radius={0}
              tint="#FFFCF2"
              tintOpacity={0.92}
              blur={0}
              textColor="#252422"
              lineColor="#EB5E28"
              baseColor="#403D39"
              intensity={1.2}
              shineSize={12}
              shineFade={38}
              thickness={1.2}
              speed={0.3}
              followMouse
              proximity={280}
              autoAnimate={false}
            >
              Book a Session
            </SpecularButton>

            <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2, ease: "easeOut" }}>
              <Link
                to="/work"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  fontWeight: 400,
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  color: "rgba(255,252,242,0.65)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "color 0.22s",
                  background: "rgba(255,252,242,0.08)",
                  padding: "10px 24px",
                  border: "0.5px solid rgba(255,252,242,0.2)",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,252,242,1)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,252,242,0.65)"}
              >
                View Work
                <span style={{ fontSize: 13, letterSpacing: 0 }}>→</span>
              </Link>
            </motion.div>
          </div>
        </ScrollReveal>
        </div>{/* /content z-index wrapper */}
      </section>
    </>
  );
}
