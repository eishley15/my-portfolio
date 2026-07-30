import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useFeaturedPortfolio } from "../hooks/usePortfolio";
import LoadingScreen from "../components/LoadingScreen";
import TrueFocus from "../components/reactbits/TrueFocus";
import RotatingText from "../components/reactbits/RotatingText";
import CountUp from "../components/reactbits/CountUp";
import SpecularButton from "../components/reactbits/SpecularButton";
import LineSidebar from "../components/reactbits/LineSidebar";
import ScrollReveal from "../components/reactbits/ScrollReveal";

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICES = ["Weddings", "Debuts", "Pageants", "Portraits", "Campaigns"];

const STATS = [
  { end: 200, suffix: "+", label: "Projects Delivered" },
  { end: 5,   suffix: "+", label: "Years of Experience" },
  { end: 10,  suffix: "",  label: "Disciplines Covered" },
];

const TESTIMONIALS = [
  {
    quote:
      "Kyle captured every emotion from our wedding day. The photos are beyond anything we imagined — we'll cherish them forever.",
    name: "Maria & Jared Santos",
    event: "Wedding",
    year: "2024",
  },
  {
    quote:
      "Every shot was intentional and beautiful. Kyle has a gift for making you feel at ease and the results speak for themselves.",
    name: "Anne Claire Reyes",
    event: "Portrait Session",
    year: "2025",
  },
  {
    quote:
      "My debut photos were absolutely stunning. Kyle knows how to tell a story through images in a way that feels completely natural.",
    name: "Sofia Dela Cruz",
    event: "Debut",
    year: "2024",
  },
];

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

const HOME_SECTIONS = [
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
              color: "#F0EBE0",
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
              color: "rgba(240,235,224,0.6)",
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
            fontWeight: 400,
            color: "var(--ink)",
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
            fontWeight: 300,
            color: "var(--ink-muted)",
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
                fontWeight: 300,
                lineHeight: 1.75,
                color: "var(--ink-muted)",
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
  const [openFaq, setOpenFaq] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler, { passive: true });
    return () => window.removeEventListener("resize", handler);
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

      <LineSidebar sections={HOME_SECTIONS} />

      {/* ══ HERO ════════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        style={{
          height: "100svh",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gridTemplateRows: isMobile ? "40svh 1fr" : "1fr",
          overflow: "hidden",
        }}
      >
        {/* Mobile: photo on top */}
        {isMobile && (
          <div style={{ position: "relative", overflow: "hidden", background: "var(--bg-dim)" }}>
            {heroPhoto && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9 }}
                src={heroPhoto}
                alt="Portfolio"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            )}
          </div>
        )}

        {/* Text column */}
        <div
          style={{
            background: "var(--bg)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: isMobile
              ? "clamp(32px, 6vw, 48px) clamp(24px, 5vw, 40px)"
              : "clamp(40px, 6vw, 80px)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            style={{ marginBottom: "clamp(20px, 3vw, 32px)" }}
          >
            Photographer · Videographer
          </motion.p>

          <TrueFocus
            duration={1.0}
            pause={1.6}
            blurAmount={5}
            borderColor="var(--ink-faint)"
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: isMobile
                  ? "clamp(40px, 11vw, 56px)"
                  : "clamp(44px, 5.2vw, 84px)",
                textTransform: "uppercase",
                letterSpacing: "-0.03em",
                lineHeight: 0.92,
                fontVariationSettings: "'opsz' 144",
                display: "block",
                color: "var(--ink)",
              }}
            >
              It's gonna look
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontStyle: "italic",
                fontSize: isMobile
                  ? "clamp(34px, 9.5vw, 48px)"
                  : "clamp(38px, 4.5vw, 72px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                fontVariationSettings: "'opsz' 120",
                display: "block",
                color: "var(--ink)",
              }}
            >
              a little different.
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: isMobile
                  ? "clamp(40px, 11vw, 56px)"
                  : "clamp(44px, 5.2vw, 84px)",
                textTransform: "uppercase",
                letterSpacing: "-0.03em",
                lineHeight: 0.92,
                fontVariationSettings: "'opsz' 144",
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
              margin: "clamp(20px, 3.5vw, 36px) 0",
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
              fontWeight: 300,
              color: "var(--ink-muted)",
              lineHeight: 1.5,
            }}
          >
            Available for{" "}
            <RotatingText
              words={SERVICES}
              style={{
                fontWeight: 400,
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
            style={{ marginTop: "clamp(28px, 4.5vw, 52px)" }}
          >
            <SpecularButton to="/work">View Work</SpecularButton>
          </motion.div>

          {/* Desktop scroll indicator */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              style={{
                position: "absolute",
                bottom: 32,
                left: "clamp(40px, 6vw, 80px)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: "0.5px", height: 36, background: "var(--ink-faint)" }}
              />
              <span className="eyebrow">Scroll</span>
            </motion.div>
          )}
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
          padding: "clamp(64px, 8vw, 120px) clamp(24px, 6vw, 80px)",
          background: "var(--bg)",
        }}
      >
        <ScrollReveal>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "clamp(32px, 5vw, 60px)",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <p className="eyebrow" style={{ marginBottom: 12 }}>Selected Work</p>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "clamp(36px, 5vw, 72px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 0.95,
                  fontVariationSettings: "'opsz' 144",
                  color: "var(--ink)",
                }}
              >
                What I{" "}
                <span className="font-serif">Shoot.</span>
              </h2>
            </div>
            <Link
              to="/work"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: "var(--ink-muted)",
                textDecoration: "none",
                borderBottom: "0.5px solid var(--border)",
                paddingBottom: 2,
                alignSelf: "flex-end",
                transition: "color 0.2s",
              }}
            >
              All Work →
            </Link>
          </div>
        </ScrollReveal>

        {items.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(240px, 100%), 1fr))",
              gap: "clamp(8px, 1.2vw, 16px)",
            }}
          >
            {items.map((item, i) => (
              <motion.div
                key={item.id || item.category}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              >
                <CategoryCard item={item} />
              </motion.div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--ink-muted)",
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
                  fontWeight: 900,
                  fontSize: "clamp(56px, 7vw, 96px)",
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

      {/* ══ TESTIMONIALS ════════════════════════════════════════════════════════ */}
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
              fontWeight: 900,
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
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
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
                  fontWeight: 300,
                  fontSize: "clamp(16px, 1.8vw, 21px)",
                  lineHeight: 1.5,
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                  marginBottom: 24,
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <div
                style={{
                  borderTop: "0.5px solid var(--border)",
                  paddingTop: 16,
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: 13,
                    color: "var(--ink)",
                    marginBottom: 3,
                  }}
                >
                  {t.name}
                </p>
                <p className="eyebrow">
                  {t.event} · {t.year}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ FAQ ═════════════════════════════════════════════════════════════════ */}
      <section
        id="faq"
        style={{
          padding: "clamp(64px, 8vw, 120px) clamp(24px, 6vw, 80px)",
          background: "var(--bg-dim)",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <ScrollReveal>
            <p className="eyebrow" style={{ marginBottom: 12 }}>Got Questions</p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "clamp(32px, 4.5vw, 64px)",
                letterSpacing: "-0.03em",
                lineHeight: 0.95,
                marginBottom: "clamp(36px, 5.5vw, 64px)",
                fontVariationSettings: "'opsz' 144",
                color: "var(--ink)",
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
          padding: "clamp(80px, 10vw, 140px) clamp(24px, 6vw, 80px)",
          background: "var(--black)",
          textAlign: "center",
        }}
      >
        <ScrollReveal>
          <p
            className="eyebrow"
            style={{ color: "rgba(240,235,224,0.35)", marginBottom: 20 }}
          >
            Ready When You Are
          </p>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "clamp(48px, 8.5vw, 120px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.88,
              color: "var(--off-white)",
              textTransform: "uppercase",
              fontVariationSettings: "'opsz' 144",
              marginBottom: 4,
            }}
          >
            Make something
          </h2>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(42px, 7.5vw, 108px)",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "var(--off-white)",
              fontVariationSettings: "'opsz' 120",
              marginBottom: "clamp(40px, 5.5vw, 72px)",
            }}
          >
            unforgettable.
          </h2>

          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <SpecularButton to="/inquire">Book a Session</SpecularButton>

            <Link
              to="/work"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "14px 32px",
                border: "0.5px solid rgba(240,235,224,0.18)",
                color: "rgba(240,235,224,0.55)",
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "border-color 0.25s, color 0.25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(240,235,224,0.45)";
                e.currentTarget.style.color = "rgba(240,235,224,0.9)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(240,235,224,0.18)";
                e.currentTarget.style.color = "rgba(240,235,224,0.55)";
              }}
            >
              View Work
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
