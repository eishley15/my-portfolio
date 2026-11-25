import { useEffect } from "react";

// Reference-counted page scroll lock that also holds on iOS Safari.
//
// `body { overflow: hidden }` alone is not enough here: index.css gives <html>
// `overflow-y: scroll`, so the viewport scrolls via <html> and ignores the body
// rule — and iOS Safari ignores body overflow for touch scrolling anyway.
// Pinning <body> with `position: fixed` at the current offset freezes the page
// everywhere; the offset is restored when the last lock is released.

let lockCount = 0;
let savedScrollY = 0;
let savedStyles = null;

function lock() {
  lockCount += 1;
  if (lockCount > 1) return;

  const html = document.documentElement;
  const body = document.body;
  savedScrollY = window.scrollY;
  const scrollbarWidth = window.innerWidth - html.clientWidth;

  savedStyles = {
    htmlOverflow: html.style.overflow,
    position:     body.style.position,
    top:          body.style.top,
    left:         body.style.left,
    right:        body.style.right,
    width:        body.style.width,
    overflow:     body.style.overflow,
    paddingRight: body.style.paddingRight,
  };

  html.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top      = `-${savedScrollY}px`;
  body.style.left     = "0";
  body.style.right    = "0";
  body.style.width    = "100%";
  body.style.overflow = "hidden";
  // Keep desktop layouts from shifting when the scrollbar disappears
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0 || !savedStyles) return;

  const html = document.documentElement;
  const body = document.body;
  html.style.overflow     = savedStyles.htmlOverflow;
  body.style.position     = savedStyles.position;
  body.style.top          = savedStyles.top;
  body.style.left         = savedStyles.left;
  body.style.right        = savedStyles.right;
  body.style.width        = savedStyles.width;
  body.style.overflow     = savedStyles.overflow;
  body.style.paddingRight = savedStyles.paddingRight;
  savedStyles = null;

  // <html> has `scroll-behavior: smooth`; restore the offset instantly instead
  // of animating the whole page back down from the top.
  const prevBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, savedScrollY);
  html.style.scrollBehavior = prevBehavior;
}

export function useBodyScrollLock(active = true) {
  useEffect(() => {
    if (!active) return undefined;
    lock();
    return unlock;
  }, [active]);
}

// Scroll an element into view without the global smooth-scroll animation.
export function scrollIntoViewInstant(el, block = "center") {
  if (!el) return;
  const html = document.documentElement;
  const prevBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  el.scrollIntoView({ block, inline: "nearest" });
  html.style.scrollBehavior = prevBehavior;
}

export function isInViewport(el, margin = 0) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.bottom > margin && r.top < window.innerHeight - margin;
}
