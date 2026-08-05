import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { login } from "../../lib/galleryAuth";
import DriftWall from "./DriftWall";
import { usePortfolio } from "../../hooks/usePortfolio";
import { isVideo } from "../../lib/isVideo";

export default function AccessGate({ onSuccess }) {
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Pull photos from the Work page portfolio (filter out videos)
  const { items: portfolioItems } = usePortfolio(null);
  const driftItems = useMemo(() =>
    portfolioItems
      .filter(item => !isVideo(item))
      .map(item => ({ image: item.url, title: item.title || item.category })),
    [portfolioItems]
  );

  async function handleSubmit() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      await login(code.trim().toLowerCase());
      onSuccess();
    } catch (err) {
      setError(err.message || "Access code not found. Please check and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100svh" }}
      className="access-gate-grid"
    >
      {/* Left — dark editorial panel with DriftWall background */}
      <div style={{ position: "relative", background: "var(--ink)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(80px,10vh,120px) clamp(32px,5vw,64px) clamp(48px,6vh,72px)", overflow: "hidden" }}>
        {/* DriftWall background */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <DriftWall
            items={driftItems.length > 0 ? driftItems : undefined}
            columns={5}
            tileWidth={200}
            tileHeight={132}
            gap={18}
            tilt={16}
            turn={-14}
            perspective={1200}
            depth={120}
            speed={42}
            direction="up"
            variance={0.45}
            parallax={0.6}
            lift={64}
            fade={0.6}
            dim={0.55}
            overlayColor="var(--ink)"
            radius={14}
            roll={0}
            pauseOnHover={false}
            grayscale={false}
          />
        </div>
        {/* Dark scrim so text stays legible */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to top, rgba(14,12,11,0.82) 40%, rgba(14,12,11,0.3) 100%)" }} />
        {/* Content layer */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,252,242,0.75)", marginBottom: "clamp(20px,3vh,32px)", display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={10} strokeWidth={1.5} style={{ opacity: 0.5 }} /> Private Access
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.6 }}
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: "clamp(48px,6.5vw,88px)", letterSpacing: "-0.035em", lineHeight: 0.88, color: "var(--off-white)", textTransform: "uppercase", margin: 0 }}>
            Client
          </motion.h1>
          <motion.h2 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontStyle: "italic", fontSize: "clamp(40px,5.5vw,76px)", letterSpacing: "-0.025em", lineHeight: 1, color: "rgba(255,252,242,0.5)", margin: "0 0 clamp(24px,4vh,40px)" }}>
            Gallery.
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
            style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "clamp(14px,1.3vw,16px)", lineHeight: 1.7, color: "rgba(255,252,242,0.6)", maxWidth: "38ch", margin: "0 0 clamp(32px,5vh,48px)" }}>
            Your photos and videos, delivered privately. Enter your access code to view and download your files.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ display: "flex", gap: 24 }}>
            {["Secure", "Private", "HD Quality"].map((t) => (
              <span key={t} style={{ fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,252,242,0.65)" }}>{t}</span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ background: "var(--bg)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "clamp(48px,8vh,80px) clamp(32px,5vw,72px)" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.55 }} style={{ width: "100%", maxWidth: 400 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "var(--ink)", opacity: 0.75, marginBottom: "clamp(28px,4vh,40px)" }}>
            Enter your access code
          </p>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="gallery-code" style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink)", opacity: 0.7, marginBottom: 10 }}>
              Access Code
            </label>
            <input
              id="gallery-code" type="text" value={code} autoComplete="off"
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Enter your access code"
              style={{ width: "100%", padding: "14px 16px", background: "var(--surface)", border: error ? "1px solid var(--ink)" : "1px solid rgba(14,12,11,0.15)", color: "var(--ink)", fontFamily: "var(--font-body)", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", letterSpacing: "0.5px" }}
              onFocus={(e) => { e.target.style.borderColor = "var(--ink)"; }}
              onBlur={(e)  => { e.target.style.borderColor = error ? "var(--ink)" : "rgba(14,12,11,0.15)"; }}
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              style={{ fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink)", opacity: 0.7, marginBottom: 16 }}>
              {error}
            </motion.p>
          )}

          <button
            onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: "16px 24px", background: loading ? "var(--ink-muted)" : "var(--ink)", color: "var(--off-white)", fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: 2.5, textTransform: "uppercase", border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "background 0.2s", marginBottom: "clamp(28px,4vh,40px)" }}
          >
            {loading ? "Unlocking…" : "Access My Gallery"}
          </button>

          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, letterSpacing: 0.5, color: "var(--ink)", opacity: 0.65, lineHeight: 1.7 }}>
            Your access code was sent via email after your session.
          </p>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .access-gate-grid { grid-template-columns: 1fr !important; }
          .access-gate-grid > div:first-child { min-height: 45svh; padding: 48px 28px 40px !important; }
        }
      `}</style>
    </motion.div>
  );
}
