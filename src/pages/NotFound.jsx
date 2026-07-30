import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";

function MagneticButton({ children, to }) {
  const ref = useRef(null);
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 15, stiffness: 150 });
  const springY = useSpring(y, { damping: 15, stiffness: 150 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.3);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.3);
  };

  return (
    <motion.button
      ref={ref}
      style={{
        x: springX,
        y: springY,
        fontFamily: "var(--font-body)",
        fontSize: "11px",
        letterSpacing: "2.5px",
        textTransform: "uppercase",
        color: "var(--off-white)",
        background: "var(--red-action)",
        border: "none",
        padding: "16px 36px",
        cursor: "pointer",
        transition: "background 0.2s",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--red-hover)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--red)"; x.set(0); y.set(0); }}
      onClick={() => navigate(to)}
    >
      {children}
    </motion.button>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 },
  }),
};

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{
        minHeight: "100svh",
        background: "var(--black)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 24px",
      }}
    >
      <Helmet>
        <title>404 — Page Not Found | Kyle Payawal</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "10px",
          letterSpacing: "4px",
          textTransform: "uppercase",
          color: "var(--red)",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span style={{ width: "24px", height: "0.5px", background: "var(--red-action)", display: "inline-block" }} />
        404
        <span style={{ width: "24px", height: "0.5px", background: "var(--red-action)", display: "inline-block" }} />
      </motion.p>

      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={1}
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(72px, 16vw, 180px)",
          lineHeight: 0.85,
          color: "var(--off-white)",
          marginBottom: "0",
        }}
      >
        LOST.
      </motion.h1>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={2}
        className="font-serif"
        style={{
          fontStyle: "italic",
          fontSize: "clamp(20px, 3vw, 28px)",
          color: "var(--text-muted)",
          marginBottom: "48px",
          lineHeight: 1.2,
        }}
      >
        This page doesn't exist.
      </motion.p>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={3}
      >
        <MagneticButton to="/">Back to Home</MagneticButton>
      </motion.div>
    </motion.div>
  );
}
