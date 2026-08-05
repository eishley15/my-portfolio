import { useEffect, useRef } from 'react';

export function useSwipe(ref, { onLeft, onRight, threshold = 50 } = {}) {
  const startX = useRef(null);

  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    function onTouchStart(e) { startX.current = e.touches[0].clientX; }

    function onTouchEnd(e) {
      if (startX.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      startX.current = null;
      if (Math.abs(dx) < threshold) return;
      if (dx < 0) onLeft?.();
      else         onRight?.();
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend',   onTouchEnd);
    };
  }, [ref, onLeft, onRight, threshold]);
}
