import { useEffect, useRef } from "react";

const ROWS = 4;
const BASE_SPEED = 0.45; // px per frame

/**
 * GridMotion — 4 rows of images scrolling in alternating directions.
 * Mouse X position subtly modulates speed, creating a living feel.
 *
 * Usage:
 *   <GridMotion items={[{ url, title }, ...]} rowHeight={200} gap={8} />
 */
export default function GridMotion({
  items = [],
  rowHeight = 210,
  gap = 8,
  className = "",
  style = {},
}) {
  const rowRefs = useRef([]);
  const posRef = useRef([]);
  const mouseXRef = useRef(0.5);
  const rafRef = useRef(null);

  // Must guard before the padding loop — empty items causes an infinite loop
  const hasItems = items.length > 0;

  const padded = hasItems ? [...items] : [];
  if (hasItems) {
    while (padded.length < ROWS * 8) padded.push(...items);
  }

  const rows = Array.from({ length: ROWS }, (_, i) => {
    const perRow = Math.ceil(padded.length / ROWS);
    const slice = padded.slice(i * perRow, (i + 1) * perRow);
    // Double for seamless loop
    return [...slice, ...slice];
  });

  useEffect(() => {
    // Start positions: even rows at 0, odd rows at -half (so they start offset)
    posRef.current = rows.map((_, i) => (i % 2 === 0 ? 0 : -((rowRefs.current[i]?.scrollWidth ?? 0) / 2)));

    const onMouseMove = (e) => {
      mouseXRef.current = e.clientX / window.innerWidth;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const tick = () => {
      const speedMod = 0.6 + mouseXRef.current * 0.8;
      rows.forEach((_, i) => {
        const row = rowRefs.current[i];
        if (!row) return;
        const halfWidth = row.scrollWidth / 2;
        const dir = i % 2 === 0 ? -1 : 1;
        posRef.current[i] += BASE_SPEED * dir * speedMod;
        // Reset for seamless loop
        if (posRef.current[i] <= -halfWidth) posRef.current[i] += halfWidth;
        if (posRef.current[i] >= 0) posRef.current[i] -= halfWidth;
        row.style.transform = `translateX(${posRef.current[i]}px)`;
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouseMove);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  if (!hasItems) return null;

  return (
    <div
      className={className}
      style={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap,
        userSelect: "none",
        ...style,
      }}
    >
      {rows.map((row, rowI) => (
        <div key={rowI} style={{ overflow: "hidden", height: rowHeight, flexShrink: 0 }}>
          <div
            ref={(el) => { rowRefs.current[rowI] = el; }}
            style={{ display: "flex", gap, height: "100%", width: "max-content" }}
          >
            {row.map((item, i) => (
              <div
                key={i}
                style={{
                  width: Math.round(rowHeight * 1.45),
                  height: rowHeight,
                  flexShrink: 0,
                  overflow: "hidden",
                  borderRadius: 2,
                  background: "var(--bg-dim)",
                }}
              >
                {item?.url ? (
                  <img
                    src={item.url}
                    alt={item.title || ""}
                    draggable={false}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "var(--bg-dim)" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
