import { useEffect, useRef, useState, Children } from "react";
import { motion } from "framer-motion";

/**
 * TrueFocus — cycles through children (lines/words), blurring inactive ones.
 * Each child is one "line" to focus on sequentially.
 *
 * Usage:
 *   <TrueFocus duration={0.8} pause={1.2}>
 *     <span>Line one</span>
 *     <span>Line two</span>
 *   </TrueFocus>
 */
export default function TrueFocus({
  children,
  duration = 0.9,
  pause = 1.3,
  blurAmount = 6,
  borderColor = "var(--ink)",
}) {
  const lines = Children.toArray(children);
  const [active, setActive] = useState(0);
  const lineRefs = useRef([]);
  const containerRef = useRef(null);
  const [focusRect, setFocusRect] = useState(null);

  useEffect(() => {
    const id = setInterval(
      () => setActive((p) => (p + 1) % lines.length),
      (duration + pause) * 1000,
    );
    return () => clearInterval(id);
  }, [lines.length, duration, pause]);

  useEffect(() => {
    const el = lineRefs.current[active];
    const container = containerRef.current;
    if (!el || !container) return;

    const er = el.getBoundingClientRect();
    const cr = container.getBoundingClientRect();
    setFocusRect({
      x: er.left - cr.left,
      y: er.top - cr.top,
      w: er.width,
      h: er.height,
    });
  }, [active]);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {lines.map((line, i) => (
        <div
          key={i}
          ref={(el) => { lineRefs.current[i] = el; }}
          style={{
            filter: i === active ? "blur(0px)" : `blur(${blurAmount}px)`,
            opacity: i === active ? 1 : 0.28,
            transition: `filter ${duration}s ease, opacity ${duration}s ease`,
            willChange: "filter, opacity",
          }}
        >
          {line}
        </div>
      ))}

      {focusRect && (
        <motion.div
          animate={{
            x: focusRect.x - 10,
            y: focusRect.y - 6,
            width: focusRect.w + 20,
            height: focusRect.h + 12,
          }}
          transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            border: `1px solid ${borderColor}`,
            opacity: 0.22,
            pointerEvents: "none",
            borderRadius: 2,
          }}
        />
      )}
    </div>
  );
}
