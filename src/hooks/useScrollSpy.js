import { useState, useEffect } from 'react';

export function useScrollSpy(ids, offset = 80) {
  const [activeId, setActiveId] = useState(ids[0] || null);

  useEffect(() => {
    if (!ids.length) return;

    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: `-${offset}px 0px -60% 0px`, threshold: 0 }
      );
      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((o) => o?.disconnect());
  }, [ids, offset]);

  return activeId;
}
