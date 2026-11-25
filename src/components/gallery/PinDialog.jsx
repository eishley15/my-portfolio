import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";
import { verifySharePin } from "../../lib/galleryAuth";

// Asks for a share link's download PIN. Calls onResult(true) once verified,
// onResult(false) if the visitor cancels.
export default function PinDialog({ onResult, textColor = "#0E0C0B", bgColor = "#faf9f7" }) {
  const [pin,     setPin]     = useState("");
  const [error,   setError]   = useState("");
  const [busy,    setBusy]    = useState(false);
  const [locked,  setLocked]  = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onResult(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onResult]);

  async function submit(e) {
    e.preventDefault();
    if (busy || pin.length < 4) return;
    setBusy(true);
    setError("");
    const r = await verifySharePin(pin);
    setBusy(false);
    if (r.ok) { onResult(true); return; }
    setPin("");
    if (r.retryAfter) {
      setLocked(true);
      setError(`Too many wrong PINs. Try again in ${Math.ceil(r.retryAfter / 60)} min.`);
    } else if (typeof r.attemptsLeft === "number") {
      setError(`Incorrect PIN. ${r.attemptsLeft} attempt${r.attemptsLeft === 1 ? "" : "s"} left.`);
    } else {
      setError(r.error);
    }
    inputRef.current?.focus();
  }

  const label = { fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: textColor };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} onClick={() => onResult(false)}
        style={{ position: "absolute", inset: 0, background: "#0E0C0B" }} />
      <motion.form
        role="dialog" aria-modal="true" aria-labelledby="pin-title"
        onSubmit={submit}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
        style={{ position: "relative", width: "100%", maxWidth: 380, background: bgColor, padding: "32px 28px", boxShadow: "0 30px 80px rgba(0,0,0,0.25)" }}>
        <KeyRound size={22} strokeWidth={1.3} aria-hidden="true" style={{ color: textColor, opacity: 0.7, marginBottom: 14 }} />
        <h2 id="pin-title" style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em", color: textColor, margin: "0 0 8px" }}>
          Enter download PIN
        </h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.6, color: textColor, opacity: 0.7, margin: "0 0 22px" }}>
          Downloads on this link are protected. The PIN was sent to you separately from the link.
        </p>
        <label htmlFor="share-pin" style={{ ...label, display: "block", opacity: 0.7, marginBottom: 8 }}>PIN</label>
        <input
          id="share-pin" ref={inputRef} value={pin} disabled={locked}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric" autoComplete="one-time-code" placeholder="• • • •"
          aria-invalid={Boolean(error)} aria-describedby={error ? "pin-error" : undefined}
          style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 20, letterSpacing: 8, textAlign: "center", color: textColor, background: "transparent", border: `1px solid ${error ? textColor : `${textColor}33`}`, outline: "none" }}
        />
        {error && (
          <p id="pin-error" role="alert" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: textColor, margin: "10px 0 0" }}>{error}</p>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button type="button" onClick={() => onResult(false)}
            style={{ ...label, flex: 1, padding: "13px 0", background: "none", border: `0.5px solid ${textColor}55`, cursor: "pointer" }}>
            Cancel
          </button>
          <button type="submit" disabled={busy || locked || pin.length < 4}
            style={{ ...label, flex: 1, padding: "13px 0", background: textColor, color: bgColor, border: "none", cursor: busy || locked || pin.length < 4 ? "not-allowed" : "pointer", opacity: busy || locked || pin.length < 4 ? 0.5 : 1 }}>
            {busy ? "Checking…" : "Unlock"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
