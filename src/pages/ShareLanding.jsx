import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link2Off } from "lucide-react";
import { loginWithShareToken } from "../lib/galleryAuth";

// /g/:token — exchanges a share-link token for a gallery session, then sends
// the visitor to /gallery. The token is removed from the address bar and
// history straight away so it isn't left behind in screenshots or back/forward.
export default function ShareLanding() {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const [failed, setFailed] = useState(!token);
  const started    = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    window.history.replaceState(window.history.state, "", "/g");

    loginWithShareToken(token)
      .then(() => navigate("/gallery", { replace: true }))
      .catch(() => setFailed(true));
  }, [token, navigate]);

  return (
    <div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 24 }}>
      <Helmet>
        <title>Client Gallery — Kyle Payawal</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Helmet>

      {!failed ? (
        <p role="status" style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--ink)", opacity: 0.5 }}>
          Opening your gallery…
        </p>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ maxWidth: 420, textAlign: "center" }}>
          <Link2Off size={32} strokeWidth={1.2} aria-hidden="true" style={{ color: "var(--ink)", opacity: 0.6, margin: "0 auto 20px", display: "block" }} />
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(32px,5vw,44px)", letterSpacing: "-0.03em", lineHeight: 1, color: "var(--ink)", margin: "0 0 16px" }}>
            This link is no longer active.
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.7, color: "var(--ink)", opacity: 0.7, margin: "0 0 32px" }}>
            It may have expired or been turned off. Ask the person who shared it for a new link, or sign in with your access code.
          </p>
          <Link to="/gallery"
            style={{ display: "inline-block", padding: "14px 28px", background: "var(--ink)", color: "var(--off-white)", fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", textDecoration: "none" }}>
            Use an access code
          </Link>
        </motion.div>
      )}
    </div>
  );
}
