import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function ExpiredNotice({ config }) {
  const bg   = config?.gallery_bg_color   || "#faf9f7";
  const text = config?.gallery_text_color || "#3d2b2b";

  return (
    <div style={{ minHeight: "100svh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", maxWidth: 420 }}
      >
        <p style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: text, opacity: 0.4, marginBottom: 24 }}>
          Gallery Expired
        </p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px,6vw,72px)", lineHeight: 0.9, color: text, marginBottom: 24 }}>
          This gallery<br />
          <span style={{ fontStyle: "italic", fontWeight: 300, opacity: 0.45 }}>has ended.</span>
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.7, color: text, opacity: 0.5, marginBottom: 40 }}>
          The access period for this gallery has passed. Please reach out if you need your photos.
        </p>
        <Link
          to="/contact"
          style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: text, border: `0.5px solid ${text}`, padding: "13px 28px", textDecoration: "none", opacity: 0.7, transition: "opacity 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.7; }}
        >
          Contact Kyle
        </Link>
      </motion.div>
    </div>
  );
}
