import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { motion, animate, useMotionValue } from "framer-motion";
import "./lightbox.css";

// Touch-first media stage shared by the client gallery and picks lightboxes.
//   • swipe left/right — the photo follows the finger, neighbours slide in
//   • pinch or double-tap to zoom, drag to pan while zoomed
//   • swipe up/down to dismiss (when `onClose` is given)
//   • single tap calls `onTap` (e.g. toggle the chrome); mouse click on the
//     backdrop closes, like the previous lightbox did
// Only the current photo and its two neighbours are mounted; ±2 are preloaded.

const GAP              = 24;    // px between slides while swiping
const MAX_SCALE        = 4;
const DOUBLE_TAP_SCALE = 2.5;
const TAP_SLOP         = 10;    // px of movement before a touch becomes a drag
const DOUBLE_TAP_MS    = 280;
const SWIPE_FRACTION   = 0.18;  // of stage width needed to change photo
const FLICK_VELOCITY   = 0.45;  // px/ms — a quick flick also changes photo
const DISMISS_DISTANCE = 110;   // px of vertical drag needed to close

const SPRING = { type: "spring", stiffness: 420, damping: 42, mass: 0.9 };
const SLIDE  = { type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] };
const RESET_STYLE = { x: 0, y: 0, scale: 1 };

const clamp  = (v, min, max) => Math.min(max, Math.max(min, v));
const rubber = (v, max) => (v > max ? max + (v - max) * 0.3 : v < -max ? -max + (v + max) * 0.3 : v);
const alwaysImage = () => true;

function velocity(history, now) {
  const last = history[history.length - 1];
  if (!last || history.length < 2 || now - last.t > 100) return { x: 0, y: 0 };
  let first = history[0];
  for (let i = history.length - 2; i >= 0; i -= 1) {
    first = history[i];
    if (last.t - first.t > 80) break;
  }
  const dt = Math.max(1, last.t - first.t);
  return { x: (last.x - first.x) / dt, y: (last.y - first.y) / dt };
}

function StageImage({ src, alt, active, mediaRef, motionStyle }) {
  const [loaded, setLoaded] = useState(false);
  const setRef = useCallback((el) => {
    if (mediaRef) mediaRef.current = el;
    if (el?.complete && el.naturalWidth > 0) setLoaded(true);
  }, [mediaRef]);

  return (
    <motion.img
      ref={setRef}
      src={src}
      alt={alt}
      draggable={false}
      decoding="async"
      data-lb-media=""
      data-loaded={loaded ? "true" : "false"}
      onLoad={() => setLoaded(true)}
      className="lb-media"
      style={active ? motionStyle : RESET_STYLE}
    />
  );
}

const LightboxStage = forwardRef(function LightboxStage(
  {
    items, index, onIndexChange,
    getSrc, getAlt, getKey,
    isImage = alwaysImage,   // false → not zoomable, not preloaded (e.g. video)
    renderMedia,             // optional (item, { active }) => element | null
    onClose, onTap,
    backdropOpacity,         // optional MotionValue the stage fades while dismissing
    className = "",
  },
  ref,
) {
  const stageRef = useRef(null);
  const mediaRef = useRef(null);
  const x      = useMotionValue(0);   // track offset (swipe)
  const y      = useMotionValue(0);   // dismiss offset
  const scale  = useMotionValue(1);
  const panX   = useMotionValue(0);
  const panY   = useMotionValue(0);
  const rt = useRef({
    pointers: new Map(), mode: "idle", start: null, base: null, history: [],
    pinch: null, noTap: false, downTarget: null,
    anims: [], committing: null, tapTimer: 0, lastTap: null, latest: null,
  });

  const current   = items[index];
  const zoomable  = Boolean(current && isImage(current));

  // Handlers read the latest props from here (they're attached once per render)
  useLayoutEffect(() => {
    rt.current.latest = { index, count: items.length, zoomable, onIndexChange, onClose, onTap };
  });

  // New photo → reset every transform before paint so the swap is seamless
  useLayoutEffect(() => {
    const r = rt.current;
    r.committing = null;
    r.anims.forEach((a) => a.stop());
    r.anims = [];
    clearTimeout(r.tapTimer);
    r.lastTap = null;
    x.set(0); y.set(0); scale.set(1); panX.set(0); panY.set(0);
    backdropOpacity?.set(1);
  }, [index, x, y, scale, panX, panY, backdropOpacity]);

  // Warm the cache two photos ahead/behind (±1 are already mounted)
  useEffect(() => {
    [index + 2, index - 2].forEach((i) => {
      const it = items[i];
      if (!it || !isImage(it)) return;
      const img = new Image();
      img.decoding = "async";
      img.src = getSrc(it);
    });
  }, [index, items, getSrc, isImage]);

  useEffect(() => {
    const r = rt.current;
    return () => {
      clearTimeout(r.tapTimer);
      r.anims.forEach((a) => a.stop());
    };
  }, []);

  // ── Animation helpers ──────────────────────────────────────────────────────
  function stopAnims() {
    const r = rt.current;
    r.anims.forEach((a) => a.stop());
    r.anims = [];
  }
  // Springs start from rest unless a velocity is given — framer would otherwise
  // inherit the value's tracked velocity, which after a fast pinch is large
  // enough to overshoot far past the zoom limit.
  function run(mv, to, opts = SPRING) {
    const a = animate(mv, to, opts.type === "spring" ? { velocity: 0, ...opts } : opts);
    rt.current.anims.push(a);
    return a;
  }
  const stageWidth = () => stageRef.current?.clientWidth || window.innerWidth;

  // Untransformed centre of the current photo, in viewport coordinates
  function mediaCenter() {
    const el = mediaRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: r.left + r.width  / 2 - panX.get() - x.get(),
      y: r.top  + r.height / 2 - panY.get() - y.get(),
    };
  }
  function panBounds(s) {
    const el = mediaRef.current;
    const st = stageRef.current;
    if (!el || !st) return { x: 0, y: 0 };
    return {
      x: Math.max(0, (el.offsetWidth  * s - st.clientWidth)  / 2),
      y: Math.max(0, (el.offsetHeight * s - st.clientHeight) / 2),
    };
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  function commit(dir) {
    const r = rt.current;
    const L = r.latest;
    const target = L.index + dir;
    if (target < 0 || target >= L.count) { run(x, 0); return; }
    stopAnims();
    const to = -dir * (stageWidth() + GAP);
    r.committing = { to, target };
    run(x, to, {
      ...SLIDE,
      onComplete: () => {
        if (rt.current.committing?.target !== target) return;
        rt.current.committing = null;
        rt.current.latest.onIndexChange(target);
      },
    });
  }

  // A new gesture or key press mid-slide jumps straight to the end state
  function flushCommit() {
    const r = rt.current;
    const c = r.committing;
    if (!c) return;
    r.committing = null;
    stopAnims();
    x.set(c.to);
    flushSync(() => r.latest.onIndexChange(c.target));
  }

  useImperativeHandle(ref, () => ({
    next: () => { flushCommit(); commit(1); },
    prev: () => { flushCommit(); commit(-1); },
  }));

  // ── Zoom ───────────────────────────────────────────────────────────────────
  function settleZoom(v = { x: 0, y: 0 }) {
    const s = clamp(scale.get(), 1, MAX_SCALE);
    if (s <= 1.01) {
      run(scale, 1); run(panX, 0); run(panY, 0);
      return;
    }
    const b = panBounds(s);
    run(scale, s);
    run(panX, clamp(panX.get() + v.x * 160, -b.x, b.x), { ...SPRING, velocity: v.x * 1000 });
    run(panY, clamp(panY.get() + v.y * 160, -b.y, b.y), { ...SPRING, velocity: v.y * 1000 });
  }

  function toggleZoom(pt) {
    if (scale.get() > 1.01) {
      run(scale, 1); run(panX, 0); run(panY, 0);
      return;
    }
    const c = mediaCenter();
    if (!c) return;
    const b = panBounds(DOUBLE_TAP_SCALE);
    run(scale, DOUBLE_TAP_SCALE);
    run(panX, clamp(-(pt.x - c.x) * (DOUBLE_TAP_SCALE - 1), -b.x, b.x));
    run(panY, clamp(-(pt.y - c.y) * (DOUBLE_TAP_SCALE - 1), -b.y, b.y));
  }

  // ── Gestures ───────────────────────────────────────────────────────────────
  function beginSingle(px, py, t, target) {
    const r = rt.current;
    r.mode = "pending";
    r.noTap = false;
    r.downTarget = target;
    r.start = { x: px, y: py };
    r.base = { x: x.get(), y: y.get(), panX: panX.get(), panY: panY.get() };
    r.history = [{ x: px, y: py, t }];
  }

  function beginPinch() {
    const r = rt.current;
    clearTimeout(r.tapTimer);
    r.lastTap = null;
    r.noTap = true;
    if (!r.latest.zoomable || !mediaRef.current) { r.mode = "blocked"; return; }
    if (x.get() !== 0) run(x, 0);   // abandon a half-finished swipe
    if (y.get() !== 0) { run(y, 0); if (backdropOpacity) run(backdropOpacity, 1); }
    const [a, b] = [...r.pointers.values()];
    r.mode = "pinch";
    r.pinch = {
      dist:   Math.hypot(a.x - b.x, a.y - b.y) || 1,
      mid:    { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      scale:  scale.get(),
      panX:   panX.get(),
      panY:   panY.get(),
      center: mediaCenter(),
    };
  }

  function updatePinch() {
    const r = rt.current;
    const P = r.pinch;
    if (!P?.center || r.pointers.size < 2) return;
    const [a, b] = [...r.pointers.values()];
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    let s = P.scale * (Math.hypot(a.x - b.x, a.y - b.y) / P.dist);
    if (s < 1)              s = 1 - (1 - s) * 0.45;
    else if (s > MAX_SCALE) s = MAX_SCALE + (s - MAX_SCALE) * 0.2;
    // Keep the point between the fingers anchored: pan = m − (m₀ − pan₀)·(s/s₀)
    const k = s / P.scale;
    panX.set(mid.x - P.center.x - (P.mid.x - P.center.x - P.panX) * k);
    panY.set(mid.y - P.center.y - (P.mid.y - P.center.y - P.panY) * k);
    scale.set(s);
  }

  function handleTap(pt, pointerType) {
    const r = rt.current;
    const prev = r.lastTap;
    if (prev && pt.t - prev.t < DOUBLE_TAP_MS && Math.hypot(pt.x - prev.x, pt.y - prev.y) < 40) {
      clearTimeout(r.tapTimer);
      r.lastTap = null;
      if (r.latest.zoomable) toggleZoom(pt);
      return;
    }
    r.lastTap = pt;
    clearTimeout(r.tapTimer);
    if (pointerType === "mouse") {
      const onMedia = Boolean(r.downTarget?.closest?.("[data-lb-media]"));
      if (!onMedia) r.latest.onClose?.();
      return;
    }
    r.tapTimer = setTimeout(() => {
      rt.current.lastTap = null;
      rt.current.latest.onTap?.();
    }, DOUBLE_TAP_MS);
  }

  function onPointerDown(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest?.("[data-lb-ignore]")) return;
    const r = rt.current;
    flushCommit();
    stopAnims();
    try {
      stageRef.current?.setPointerCapture(e.pointerId);
    } catch {
      // Pointer was released before capture could be taken — moves still bubble here
    }
    r.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (r.pointers.size === 1) beginSingle(e.clientX, e.clientY, e.timeStamp, e.target);
    else if (r.pointers.size === 2) beginPinch();
  }

  function onPointerMove(e) {
    const r = rt.current;
    if (!r.pointers.has(e.pointerId)) return;
    r.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (r.mode === "pinch") { updatePinch(); return; }
    if (r.mode === "idle" || r.mode === "blocked" || r.pointers.size > 1) return;

    const dx = e.clientX - r.start.x;
    const dy = e.clientY - r.start.y;
    r.history.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
    if (r.history.length > 8) r.history.shift();

    if (r.mode === "pending") {
      if (Math.hypot(dx, dy) < TAP_SLOP) return;
      clearTimeout(r.tapTimer);
      if (scale.get() > 1.01)              r.mode = "pan";
      else if (Math.abs(dx) > Math.abs(dy)) r.mode = "swipe";
      else                                  r.mode = r.latest.onClose ? "dismiss" : "blocked";
    }

    if (r.mode === "swipe") {
      const L = r.latest;
      const atEdge = (dx > 0 && L.index === 0) || (dx < 0 && L.index === L.count - 1);
      x.set(r.base.x + (atEdge ? dx * 0.3 : dx));
    } else if (r.mode === "pan") {
      const b = panBounds(scale.get());
      panX.set(rubber(r.base.panX + dx, b.x));
      panY.set(rubber(r.base.panY + dy, b.y));
    } else if (r.mode === "dismiss") {
      const off = r.base.y + dy;
      y.set(off);
      backdropOpacity?.set(1 - Math.min(Math.abs(off) / 360, 0.8));
    }
  }

  function onPointerEnd(e) {
    const r = rt.current;
    if (!r.pointers.has(e.pointerId)) return;
    r.pointers.delete(e.pointerId);
    const cancelled = e.type !== "pointerup";

    if (r.mode === "pinch") {
      if (r.pointers.size === 1) {
        // Lifting one finger: keep panning with the other
        const [p] = [...r.pointers.values()];
        beginSingle(p.x, p.y, e.timeStamp, r.downTarget);
        r.noTap = true;
        r.mode = scale.get() > 1.01 ? "pan" : "blocked";
      } else if (r.pointers.size === 0) {
        r.mode = "idle";
        settleZoom();
      }
      return;
    }
    if (r.pointers.size > 0) return;

    const mode = r.mode;
    r.mode = "idle";
    const end = r.history[r.history.length - 1] || { ...r.start, t: e.timeStamp };
    const dx = end.x - r.start.x;
    const v = velocity(r.history, e.timeStamp);

    if (mode === "swipe") {
      const L = r.latest;
      const w = stageWidth();
      const goNext = !cancelled && (dx < -w * SWIPE_FRACTION || (dx < -24 && v.x < -FLICK_VELOCITY));
      const goPrev = !cancelled && (dx >  w * SWIPE_FRACTION || (dx >  24 && v.x >  FLICK_VELOCITY));
      if (goNext && L.index < L.count - 1) commit(1);
      else if (goPrev && L.index > 0)      commit(-1);
      else run(x, 0);
    } else if (mode === "dismiss") {
      const off = y.get();
      const flick = Math.abs(off) > 24 && Math.abs(v.y) > FLICK_VELOCITY && Math.sign(v.y) === Math.sign(off);
      if (!cancelled && (Math.abs(off) > DISMISS_DISTANCE || flick)) {
        run(y, Math.sign(off) * window.innerHeight * 0.5, SLIDE);
        if (backdropOpacity) run(backdropOpacity, 0, SLIDE);
        r.latest.onClose?.();
      } else {
        run(y, 0);
        if (backdropOpacity) run(backdropOpacity, 1);
      }
    } else if (mode === "pan" || mode === "blocked") {
      settleZoom(v);
    } else if (mode === "pending" && !cancelled && !r.noTap) {
      handleTap({ x: end.x, y: end.y, t: e.timeStamp }, e.pointerType);
    }
  }

  const motionStyle = { x: panX, y: panY, scale };

  return (
    <div
      ref={stageRef}
      className={`lb-stage ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onLostPointerCapture={onPointerEnd}
    >
      <motion.div className="lb-track" style={{ x, y }}>
        {[-1, 0, 1].map((offset) => {
          const i  = index + offset;
          const it = items[i];
          if (!it) return null;
          const active = offset === 0;
          const custom = renderMedia ? renderMedia(it, { active }) : null;
          return (
            <div
              key={getKey ? getKey(it) : i}
              className="lb-slide"
              aria-hidden={active ? undefined : true}
              style={active ? undefined : { transform: `translateX(calc(${offset * 100}% + ${offset * GAP}px))` }}
            >
              {custom ?? (
                <StageImage
                  src={getSrc(it)}
                  alt={getAlt ? getAlt(it, i) : ""}
                  active={active}
                  mediaRef={active ? mediaRef : null}
                  motionStyle={motionStyle}
                />
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
});

export default LightboxStage;
