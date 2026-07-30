import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * SpecularButton — dark button with a specular light sheen that tracks the mouse.
 * Use for primary CTAs. Pass `to` for a Link, or `onClick` for a button.
 *
 * Usage:
 *   <SpecularButton to="/work">View Work</SpecularButton>
 *   <SpecularButton onClick={handleSubmit}>Submit</SpecularButton>
 */
export default function SpecularButton({
  to,
  href,
  onClick,
  type = "button",
  children,
  className = "",
  style = {},
  disabled = false,
}) {
  const ref = useRef(null);

  const updateSheen = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    ref.current.style.setProperty("--sx", `${x}%`);
    ref.current.style.setProperty("--sy", `${y}%`);
  };

  const resetSheen = () => {
    if (!ref.current) return;
    ref.current.style.setProperty("--sx", "50%");
    ref.current.style.setProperty("--sy", "50%");
  };

  const baseStyle = {
    "--sx": "50%",
    "--sy": "50%",
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "15px 38px",
    background: "var(--ink)",
    color: "var(--bg)",
    fontFamily: "var(--font-body)",
    fontSize: "11px",
    fontWeight: 400,
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    textDecoration: "none",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    overflow: "hidden",
    opacity: disabled ? 0.5 : 1,
    borderRadius: 0,
    ...style,
  };

  const sheenStyle = {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at var(--sx) var(--sy), rgba(255,255,255,0.13) 0%, transparent 55%)",
    pointerEvents: "none",
    transition: "opacity 0.2s",
  };

  const sharedProps = {
    ref,
    style: baseStyle,
    className,
    onMouseMove: updateSheen,
    onMouseLeave: resetSheen,
  };

  const inner = (
    <>
      <span style={sheenStyle} />
      <motion.span
        style={{ position: "relative" }}
        whileHover={{ x: 2 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
    </>
  );

  if (to) {
    return (
      <Link {...sharedProps} to={to}>
        {inner}
      </Link>
    );
  }

  if (href) {
    return (
      <a {...sharedProps} href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return (
    <button {...sharedProps} type={type} onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  );
}
