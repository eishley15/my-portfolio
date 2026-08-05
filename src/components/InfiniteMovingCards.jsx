import { useState, useRef, useLayoutEffect, useEffect } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

const SPEED_PX_PER_SEC = {
  slow: 26,
  normal: 44,
  fast: 74,
};

/**
 * A seamlessly looping horizontal strip driven by Framer Motion.
 * Supports pause-on-hover, direction, speed, and edge fade masks.
 *
 * Props:
 *  items        – array of any objects
 *  renderItem   – (item, index) => ReactNode  (required)
 *  direction    – "left" | "right"  (default "left")
 *  speed        – "slow" | "normal" | "fast"  (default "normal")
 *  pauseOnHover – boolean  (default true)
 *  gap          – px number  (default 0)
 *  showMask     – whether to show edge gradient masks  (default true)
 *  className    – extra wrapper classes
 */
export function InfiniteMovingCards({
  items = [],
  renderItem,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  gap = 0,
  showMask = true,
  className = "",
}) {
  const reduceMotion = useReducedMotion() === true;
  const x = useMotionValue(0);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [singleWidth, setSingleWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [hovered, setHovered] = useState(false);

  const rendered = [...items, ...items];

  useLayoutEffect(() => {
    const vp = viewportRef.current;
    const tr = trackRef.current;
    if (!vp || !tr) return;

    const measure = () => {
      setSingleWidth(tr.scrollWidth / 2);
      setViewportWidth(vp.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(vp);
    ro.observe(tr);
    return () => ro.disconnect();
  }, [gap, items.length]);

  useEffect(() => {
    if (singleWidth <= 0) return;
    x.set(direction === "right" ? -singleWidth : 0);
  }, [direction, singleWidth, x]);

  useAnimationFrame((_, delta) => {
    if (reduceMotion || items.length <= 1) return;
    if (pauseOnHover && hovered) return;
    if (singleWidth <= 0) return;

    const vel = SPEED_PX_PER_SEC[speed] * (delta / 1000);
    const next = x.get() + (direction === "left" ? -vel : vel);

    let wrapped = next;
    if (direction === "left" && wrapped <= -singleWidth) wrapped += singleWidth;
    if (direction === "right" && wrapped >= 0) wrapped -= singleWidth;
    x.set(wrapped);
  });

  return (
    <div
      className={`relative w-full ${className}`}
      onMouseEnter={pauseOnHover ? () => setHovered(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setHovered(false) : undefined}
    >
      <div ref={viewportRef} style={{ overflow: "hidden" }}>
        <motion.div
          ref={trackRef}
          style={{ x: reduceMotion ? 0 : x, gap, display: "flex", width: "max-content" }}
        >
          {rendered.map((item, idx) => (
            <div key={idx} style={{ flexShrink: 0 }}>
              {renderItem(item, idx)}
            </div>
          ))}
        </motion.div>
      </div>

      {showMask && (
        <>
          <div
            style={{
              position: "absolute",
              inset: "0 auto 0 0",
              width: "80px",
              background: "linear-gradient(to right, var(--black-pure), transparent)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "0 0 0 auto",
              width: "80px",
              background: "linear-gradient(to left, var(--black-pure), transparent)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        </>
      )}
    </div>
  );
}

export default InfiniteMovingCards;
