import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

/**
 * List-based work showcase with a cursor-following floating image preview.
 * items: [{ id, category, url, title }]
 */
export function ProjectShowcaseList({ items = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [smoothPos, setSmoothPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const containerRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      setSmoothPos((prev) => ({
        x: lerp(prev.x, mousePos.x, 0.12),
        y: lerp(prev.y, mousePos.y, 0.12),
      }));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mousePos]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{ position: "relative", width: "100%" }}
    >
      {/* Floating image preview — follows cursor */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `translate3d(${smoothPos.x + 24}px, ${smoothPos.y - 110}px, 0)`,
          width: "260px",
          height: "175px",
          borderRadius: "0",
          overflow: "hidden",
          opacity: visible ? 1 : 0,
          scale: visible ? "1" : "0.88",
          transition: "opacity 0.25s cubic-bezier(0.4,0,0.2,1), scale 0.25s cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: "none",
          zIndex: 10,
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        {items.map((item, i) => (
          <img
            key={item.id ?? i}
            src={item.url}
            alt={item.category}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: hoveredIndex === i ? 1 : 0,
              transform: hoveredIndex === i ? "scale(1)" : "scale(1.08)",
              filter: hoveredIndex === i ? "none" : "blur(8px)",
              transition: "opacity 0.4s ease, transform 0.4s ease, filter 0.4s ease",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(14,12,11,0.4) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Work list */}
      <div>
        {items.map((item, i) => (
          <Link
            key={item.id ?? i}
            to={`/work?category=${encodeURIComponent((item.category ?? "").toLowerCase())}`}
            style={{ display: "block", textDecoration: "none" }}
            onMouseEnter={() => { setHoveredIndex(i); setVisible(true); }}
            onMouseLeave={() => { setHoveredIndex(null); setVisible(false); }}
          >
            <div
              style={{
                position: "relative",
                padding: "20px 0",
                borderTop: "0.5px solid rgba(255,252,242,0.1)",
              }}
            >
              {/* Subtle bg shimmer on hover */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,252,242,0.02)",
                  opacity: hoveredIndex === i ? 1 : 0,
                  transition: "opacity 0.25s ease",
                }}
              />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", transform: hoveredIndex === i ? "translateX(8px)" : "translateX(0)", transition: "transform 0.25s ease" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(24px, 3.5vw, 48px)",
                      letterSpacing: "1px",
                      color: hoveredIndex === i ? "var(--off-white)" : "rgba(255,252,242,0.55)",
                      transition: "color 0.25s ease",
                      lineHeight: 1,
                      position: "relative",
                    }}
                  >
                    {(item.category ?? "").toUpperCase()}
                    {/* Animated underline */}
                    <span
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        left: 0,
                        height: "1px",
                        width: "100%",
                        background: "var(--red-action)",
                        transform: hoveredIndex === i ? "scaleX(1)" : "scaleX(0)",
                        transformOrigin: "left",
                        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                      }}
                    />
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "9px",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "rgba(255,252,242,0.3)",
                    }}
                  >
                    {item.type === "video" ? "Film" : "Photo"}
                  </span>
                  <ArrowUpRight
                    size={16}
                    style={{
                      color: "var(--red-action)",
                      opacity: hoveredIndex === i ? 1 : 0,
                      transform: hoveredIndex === i ? "translate(0,0)" : "translate(-6px,6px)",
                      transition: "opacity 0.25s ease, transform 0.25s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
        <div style={{ borderTop: "0.5px solid rgba(255,252,242,0.1)" }} />
      </div>
    </div>
  );
}

export default ProjectShowcaseList;
