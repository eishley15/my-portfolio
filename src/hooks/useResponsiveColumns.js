import { useEffect, useState } from "react";

const PHONE  = "(max-width: 767px)";
const TABLET = "(max-width: 1024px)";

function columnsFor(max) {
  if (typeof window === "undefined") return max;
  if (window.matchMedia(PHONE).matches)  return Math.min(max, 2);
  if (window.matchMedia(TABLET).matches) return Math.min(max, 3);
  return max;
}

// Gallery column count: the configured count on desktop, ≤3 on tablets, ≤2 on phones.
export function useResponsiveColumns(max) {
  const [cols, setCols] = useState(() => columnsFor(max));

  useEffect(() => {
    const queries = [PHONE, TABLET].map((q) => window.matchMedia(q));
    const update = () => setCols(columnsFor(max));
    queries.forEach((mq) => mq.addEventListener("change", update));
    update();
    return () => queries.forEach((mq) => mq.removeEventListener("change", update));
  }, [max]);

  return cols;
}
