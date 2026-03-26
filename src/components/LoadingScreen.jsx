import { motion } from "framer-motion";

export default function LoadingScreen({ isVisible }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{
        pointerEvents: isVisible ? "auto" : "none",
      }}
      className="fixed inset-0 bg-[var(--black)] z-[9999] flex flex-col items-center justify-center"
    >
      {/* Logo/Brand */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-16"
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "48px",
            letterSpacing: "2px",
            color: "var(--off-white)",
          }}
        >
          KYLE
        </h1>
      </motion.div>

      {/* Loading animation - Dots */}
      <div className="flex gap-3 mb-12">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.2,
              delay: i * 0.2,
              repeat: Infinity,
            }}
            className="w-2 h-2 bg-[var(--red)] rounded-full"
          />
        ))}
      </div>

      {/* Loading text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "12px",
          letterSpacing: "2px",
          color: "var(--text-muted)",
          textTransform: "uppercase",
        }}
      >
        Loading Portfolio...
      </motion.p>

      {/* Bottom accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60px",
          height: "1px",
          background: "var(--red)",
          transformOrigin: "center",
        }}
      />
    </motion.div>
  );
}
