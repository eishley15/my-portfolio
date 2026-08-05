import { useEffect, useRef, useState } from "react";

/**
 * CountUp — animates a number from 0 to `end` when it enters the viewport.
 *
 * Usage:
 *   <CountUp end={200} suffix="+" duration={2} />
 */
export default function CountUp({
  end,
  duration = 2,
  suffix = "",
  prefix = "",
  className = "",
  style = {},
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;

        let startTime;
        const tick = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min(
            (timestamp - startTime) / (duration * 1000),
            1,
          );
          // Cubic ease-out
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(end * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ fontVariantNumeric: "tabular-nums", ...style }}
    >
      {prefix}
      {count}
      {suffix}
    </span>
  );
}
