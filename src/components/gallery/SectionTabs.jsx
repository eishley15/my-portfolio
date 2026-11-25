import { useEffect, useRef } from "react";
import { useScrollSpy } from "../../hooks/useScrollSpy";
import { stickyHeaderOffset } from "../../lib/galleryLayout";

// Scene jump links — rendered inside the gallery's sticky header (not sticky itself)
export default function SectionTabs({ scenes, textColor = "#3d2b2b" }) {
  const stripRef = useRef(null);
  const ids      = ["highlights", ...scenes.map((s) => s.slug)];
  const activeId = useScrollSpy(ids, 150);

  // Keep the active scene visible in the horizontally scrolling strip
  useEffect(() => {
    const strip = stripRef.current;
    const btn   = strip?.querySelector(`[data-scene="${activeId}"]`);
    if (!strip || !btn || strip.scrollWidth <= strip.clientWidth) return;
    const left = btn.offsetLeft - (strip.clientWidth - btn.offsetWidth) / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [activeId]);

  if (scenes.length === 0) return null;

  const tabs = [
    { id: "highlights", label: "Highlights" },
    ...scenes.map((s) => ({ id: s.slug, label: s.name })),
  ];

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - stickyHeaderOffset() + 1;
    window.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <nav aria-label="Gallery sections" className="g-scenes" style={{ borderTop: `0.5px solid ${textColor}14` }}>
      <div ref={stripRef} className="g-tabs">
        <div className="g-tabs-inner">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              data-scene={id}
              className="g-tab"
              aria-current={activeId === id ? "true" : undefined}
              onClick={() => scrollTo(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
