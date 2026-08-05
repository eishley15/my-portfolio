import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * LineSidebar — fixed right-edge scroll progress line with section dots.
 * Each dot is clickable and scrolls to its section.
 *
 * Usage:
 *   <LineSidebar sections={[
 *     { id: "hero", label: "Intro" },
 *     { id: "work",  label: "Work"  },
 *   ]} />
 *
 * Each section element must have a matching id in the DOM.
 * Set `dark` to invert colors (for dark-background pages).
 */
export default function LineSidebar({ sections = [], dark = false }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const ticking = useRef(false);

  const ink = dark ? "rgba(255,252,242,0.8)" : "var(--ink)";
  const inkFaint = dark ? "rgba(255,252,242,0.18)" : "var(--ink-faint)";

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const total = document.body.scrollHeight - window.innerHeight;
        setProgress(total > 0 ? scrolled / total : 0);
        setVisible(scrolled > 80);

        // Find active section
        let found = 0;
        sections.forEach((sec, i) => {
          const el = document.getElementById(sec.id);
          if (!el) return;
          const top = el.getBoundingClientRect().top;
          if (top <= window.innerHeight * 0.55) found = i;
        });
        setActiveIdx(found);
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!sections.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        position: "fixed",
        right: "clamp(12px, 2.5vw, 28px)",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {sections.map((sec, i) => (
        <div key={sec.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Connector line above dot (except first) */}
          {i > 0 && (
            <div style={{ width: 1, height: 28, background: inkFaint, position: "relative" }}>
              {i <= activeIdx && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{ width: "100%", background: ink, position: "absolute", top: 0 }}
                />
              )}
            </div>
          )}

          {/* Dot */}
          <button
            onClick={() => scrollTo(sec.id)}
            aria-label={`Scroll to ${sec.label}`}
            title={sec.label}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: i === activeIdx ? ink : inkFaint,
              border: "none",
              cursor: "pointer",
              padding: 0,
              flexShrink: 0,
              transition: "background 0.3s, transform 0.3s",
              transform: i === activeIdx ? "scale(1.7)" : "scale(1)",
            }}
          />
        </div>
      ))}
    </motion.div>
  );
}
