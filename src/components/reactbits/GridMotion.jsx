import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * GridMotion — GSAP-powered tilted 4×7 image grid.
 * Mouse X position shifts rows left/right with inertia.
 *
 * Usage:
 *   <GridMotion items={["https://...", ...]} gradientColor="black" />
 *
 * Items: URL strings, plain text, or JSX elements.
 * Renders 28 slots (4 rows × 7 cols). Items cycle if fewer than 28.
 */
export default function GridMotion({ items = [], gradientColor = "black" }) {
  const gridRef = useRef(null);
  const rowRefs = useRef([]);
  const mouseXRef = useRef(
    typeof window !== "undefined" ? window.innerWidth / 2 : 0
  );

  const ROWS = 4;
  const COLS = 7;
  // Column-major distribution: slot (row, col) → items[(row + col*ROWS) % n]
  // Spreads images diagonally so no column gets a monotone block.

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    const handleMouseMove = (e) => {
      mouseXRef.current = e.clientX;
    };

    const updateMotion = () => {
      const maxMoveAmount = 300;
      const baseDuration = 0.8;
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

      rowRefs.current.forEach((row, index) => {
        if (!row) return;
        const direction = index % 2 === 0 ? 1 : -1;
        const moveAmount =
          ((mouseXRef.current / window.innerWidth) * maxMoveAmount -
            maxMoveAmount / 2) *
          direction;

        gsap.to(row, {
          x: moveAmount,
          duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
          ease: "power3.out",
          overwrite: "auto",
        });
      });
    };

    const removeAnimationLoop = gsap.ticker.add(updateMotion);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      removeAnimationLoop();
    };
  }, []);

  return (
    <div
      ref={gridRef}
      style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}
    >
      <section
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
        }}
      >
        {/* Tilted 4×7 grid
            Tiles use padding-top aspect-ratio trick so they never need
            height from a parent — completely avoids the height-chain bug. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            position: "absolute",
            width: "150vw",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%) rotate(-15deg)",
            transformOrigin: "center",
            zIndex: 2,
          }}
        >
          {[...Array(ROWS)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              ref={(el) => { rowRefs.current[rowIndex] = el; }}
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gap: "0.75rem",
                willChange: "transform",
              }}
            >
              {[...Array(COLS)].map((_, colIndex) => {
                // Column-major distribution
                const idx = items.length > 0
                  ? (rowIndex + colIndex * ROWS) % items.length
                  : -1;
                const url = idx >= 0 ? items[idx] : null;
                const valid = typeof url === "string" && url.length > 0;
                return (
                  <div
                    key={colIndex}
                    style={{
                      // padding-top % creates intrinsic height from width
                      // 3:2 ratio = 66.66%
                      position: "relative",
                      paddingTop: "66.66%",
                      borderRadius: 10,
                      overflow: "hidden",
                      background: valid ? "#111" : "transparent",
                    }}
                  >
                    {valid && (
                      <img
                        src={url}
                        alt=""
                        draggable={false}
                        loading="lazy"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
