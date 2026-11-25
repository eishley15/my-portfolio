import { useState, useEffect } from 'react';

// Tracks which section is under the sticky header. Observers are rebuilt only
// when the set of ids actually changes (callers pass a fresh array each render).
export function useScrollSpy(ids, offset = 80) {
  const [activeId, setActiveId] = useState(ids[0] || null);
  const key = ids.join('|');

  useEffect(() => {
    const list = key ? key.split('|') : [];
    const observers = list.map((id) => {
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
  }, [key, offset]);

  return activeId;
}
