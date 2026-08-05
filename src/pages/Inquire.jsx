import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Send, ChevronDown, AlignJustify, Layers } from "lucide-react";
import CalendarPicker from "../components/CalendarPicker";
import Confetti from "../components/Confetti";
import VenueSearch from "../components/VenueSearch";
import GridMotion from "../components/reactbits/GridMotion";
import { usePortfolio } from "../hooks/usePortfolio";
import { isVideo } from "../lib/isVideo";

// ─── Data ─────────────────────────────────────────────────────────────────────

const EVENT_TYPES = [
  "Wedding", "Debut", "Birthday", "Christening",
  "Portrait", "Product", "Lifestyle", "Pageant",
  "Commercial", "SaaS Films", "Other",
];

const BUDGET_RANGES = [
  "Under ₱5,000", "₱5,000 – ₱15,000", "₱15,000 – ₱30,000",
  "₱30,000 – ₱50,000", "₱50,000+", "Let's Talk",
];

const STEP_LABELS = ["About You", "Session", "Location", "Vision"];

const BOOKING_STATUS = "Now booking 2026 — limited slots";

const PROCESS_STEPS = [
  {
    num: "01",
    title: "Fill the Form",
    body: "Share details about your event, vision, and timeline. The more you tell me, the better we can plan.",
  },
  {
    num: "02",
    title: "Planning Call",
    body: "We connect to align on concepts, locations, and deliverables. No surprise costs — full transparency upfront.",
  },
  {
    num: "03",
    title: "Shoot & Deliver",
    body: "On your day, I show up and do what I do best. Edited photos and videos delivered within the agreed timeline.",
  },
];

const emptyForm = {
  name: "", email: "", phone: "",
  sessionType: "", eventCategory: "", eventDate: "", preferredTime: "", duration: "",
  venueName: "", venueCoords: "", setting: "",
  budget: "", referralSource: "", vision: "", mustHaveShots: "",
};

// ─── Animation ────────────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  exit:   (dir) => ({ x: dir > 0 ? -48 : 48, opacity: 0, transition: { duration: 0.2 } }),
};

// ─── Shared style helpers ──────────────────────────────────────────────────────

const inputBase = {
  width:          "100%",
  padding:        "14px 16px",
  background:     "var(--bg)",
  color:          "var(--ink)",
  fontFamily:     "var(--font-body)",
  fontSize:       "14px",
  lineHeight:     1.5,
  outline:        "none",
  boxSizing:      "border-box",
  appearance:     "none",
  WebkitAppearance: "none",
  transition:     "border-color 0.2s",
};

const inputBorder = (hasError) => ({
  border: hasError ? "1px solid var(--ink)" : "0.5px solid var(--border)",
});

const labelStyle = {
  display:       "block",
  fontFamily:    "var(--font-body)",
  fontSize:       "12px",
  letterSpacing:  "1.5px",
  textTransform:  "uppercase",
  color:          "var(--ink-muted)",
  marginBottom:   10,
};

// ─── Toggle Button ─────────────────────────────────────────────────────────────

function ToggleBtn({ field, value, label, formData, setField, fieldErrors }) {
  const isActive = formData[field] === value;
  const hasError = !!fieldErrors[field];
  return (
    <button
      type="button"
      onClick={() => setField(field, isActive ? "" : value)}
      style={{
        padding:       "10px 16px",
        fontFamily:    "var(--font-body)",
        fontSize:       "12px",
        letterSpacing:  "1.5px",
        textTransform:  "uppercase",
        border:         isActive
          ? "0.5px solid var(--ink)"
          : hasError
          ? "0.5px solid rgba(14,12,11,0.35)"
          : "0.5px solid var(--border)",
        background:    isActive ? "var(--ink)" : "transparent",
        color:          isActive ? "var(--off-white)" : "var(--ink-muted)",
        cursor:         "pointer",
        transition:     "all 0.18s ease",
      }}
    >
      {label}
    </button>
  );
}

// ─── Form sections ─────────────────────────────────────────────────────────────

function SectionAboutYou({ formData, setField, fieldErrors }) {
  const handleChange = (e) => setField(e.target.name, e.target.value);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label htmlFor="inq-name" style={labelStyle}>Full Name *</label>
          <input
            id="inq-name" type="text" name="name"
            value={formData.name} onChange={handleChange}
            placeholder="Juan dela Cruz"
            style={{ ...inputBase, ...inputBorder(fieldErrors.name) }}
            onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
            onBlur={(e) => (e.target.style.borderColor = fieldErrors.name ? "var(--ink)" : "rgba(14,12,11,0.09)")}
          />
        </div>
        <div>
          <label htmlFor="inq-email" style={labelStyle}>Email *</label>
          <input
            id="inq-email" type="email" name="email"
            value={formData.email} onChange={handleChange}
            placeholder="juan@email.com"
            style={{ ...inputBase, ...inputBorder(fieldErrors.email) }}
            onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
            onBlur={(e) => (e.target.style.borderColor = fieldErrors.email ? "var(--ink)" : "rgba(14,12,11,0.09)")}
          />
        </div>
      </div>
      <div>
        <label htmlFor="inq-phone" style={labelStyle}>Phone *</label>
        <input
          id="inq-phone" type="tel" name="phone"
          value={formData.phone} onChange={handleChange}
          placeholder="+63 9XX XXX XXXX"
          style={{ ...inputBase, ...inputBorder(fieldErrors.phone) }}
          onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
          onBlur={(e) => (e.target.style.borderColor = fieldErrors.phone ? "var(--ink)" : "rgba(14,12,11,0.09)")}
        />
      </div>
    </div>
  );
}

function SectionYourSession({ formData, setField, fieldErrors }) {
  const handleChange = (e) => setField(e.target.name, e.target.value);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <label style={labelStyle}>Session Type *</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Photo", "Video", "Both"].map((v) => (
            <ToggleBtn key={v} field="sessionType" value={v} label={v} formData={formData} setField={setField} fieldErrors={fieldErrors} />
          ))}
        </div>
        {fieldErrors.sessionType && <FieldError>Please select a session type</FieldError>}
      </div>
      <div>
        <label htmlFor="inq-cat" style={labelStyle}>Event Category *</label>
        <div style={{ position: "relative" }}>
          <select
            id="inq-cat" name="eventCategory"
            value={formData.eventCategory} onChange={handleChange}
            style={{ ...inputBase, ...inputBorder(fieldErrors.eventCategory), paddingRight: 44, cursor: "pointer" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
            onBlur={(e) => (e.target.style.borderColor = fieldErrors.eventCategory ? "var(--ink)" : "rgba(14,12,11,0.09)")}
          >
            <option value="">Select category</option>
            {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown size={13} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--ink-muted)" }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={labelStyle}>Preferred Date *</label>
          <CalendarPicker
            value={formData.eventDate}
            onChange={(val) => setField("eventDate", val)}
            placeholder="Select a date"
            error={!!fieldErrors.eventDate}
          />
        </div>
        <div>
          <label style={labelStyle}>Preferred Time</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Morning", "Afternoon", "Evening", "Flexible"].map((v) => (
              <ToggleBtn key={v} field="preferredTime" value={v} label={v} formData={formData} setField={setField} fieldErrors={fieldErrors} />
            ))}
          </div>
        </div>
      </div>
      <div>
        <label style={labelStyle}>Coverage Duration</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["1–2 Hours", "Half Day", "Full Day", "Multi-Day", "Not Sure"].map((v) => (
            <ToggleBtn key={v} field="duration" value={v} label={v} formData={formData} setField={setField} fieldErrors={fieldErrors} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionLocation({ formData, setField, fieldErrors }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <label style={labelStyle}>
          Venue / Location{" "}
          <span style={{ opacity: 0.4, textTransform: "none", letterSpacing: "normal" }}>(optional)</span>
        </label>
        <VenueSearch
          value={formData.venueName}
          onChange={(val) => setField("venueName", val)}
          onLocationSelect={(loc) => setField("venueCoords", loc ? `${loc.lat},${loc.lng}` : "")}
          error={!!fieldErrors.venueName}
        />
      </div>
      <div>
        <label style={labelStyle}>Setting</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["Indoor", "Outdoor", "Both"].map((v) => (
            <ToggleBtn key={v} field="setting" value={v} label={v} formData={formData} setField={setField} fieldErrors={fieldErrors} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionVision({ formData, setField, fieldErrors }) {
  const handleChange = (e) => setField(e.target.name, e.target.value);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <label style={labelStyle}>Investment Range</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {BUDGET_RANGES.map((v) => (
            <ToggleBtn key={v} field="budget" value={v} label={v} formData={formData} setField={setField} fieldErrors={fieldErrors} />
          ))}
        </div>
      </div>
      <div>
        <label style={labelStyle}>How did you find me?</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["Instagram", "Facebook", "Referral", "Google", "Other"].map((v) => (
            <ToggleBtn key={v} field="referralSource" value={v} label={v} formData={formData} setField={setField} fieldErrors={fieldErrors} />
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="inq-vision" style={labelStyle}>
          Your Vision{" "}
          <span style={{ opacity: 0.4, textTransform: "none", letterSpacing: "normal" }}>(optional)</span>
        </label>
        <textarea
          id="inq-vision" name="vision"
          value={formData.vision} onChange={handleChange}
          rows={4}
          placeholder="Tell me the story — the feeling, the mood, what you want to remember..."
          style={{ ...inputBase, border: "0.5px solid var(--border)", resize: "none" }}
          onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(14,12,11,0.09)")}
        />
      </div>
      <div>
        <label htmlFor="inq-shots" style={labelStyle}>
          Must-Have Shots{" "}
          <span style={{ opacity: 0.4, textTransform: "none", letterSpacing: "normal" }}>(optional)</span>
        </label>
        <textarea
          id="inq-shots" name="mustHaveShots"
          value={formData.mustHaveShots} onChange={handleChange}
          rows={3}
          placeholder="Any specific moments, details, or shots you definitely want captured..."
          style={{ ...inputBase, border: "0.5px solid var(--border)", resize: "none" }}
          onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(14,12,11,0.09)")}
        />
      </div>
    </div>
  );
}

// ─── Micro-components ──────────────────────────────────────────────────────────

function FieldError({ children }) {
  return (
    <p style={{
      fontFamily: "var(--font-body)", fontSize: "12px", letterSpacing: "1px",
      textTransform: "uppercase", color: "var(--ink)", marginTop: 8, opacity: 0.6,
    }}>
      {children}
    </p>
  );
}

function StepError({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key="step-err"
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            marginTop: 24, padding: "14px 18px",
            borderLeft: "2px solid var(--ink)",
            background: "rgba(14,12,11,0.04)",
          }}
        >
          <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--ink)" }}>
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SubmitBtn({ onClick, loading }) {
  return (
    <button
      type="button" onClick={onClick} disabled={loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "15px 32px",
        background: loading ? "var(--ink-muted)" : "var(--ink)",
        color: "var(--off-white)",
        fontFamily: "var(--font-body)", fontSize: "13px",
        letterSpacing: "2px", textTransform: "uppercase",
        border: "none", cursor: loading ? "not-allowed" : "pointer",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--gray-dark)"; }}
      onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "var(--ink)"; }}
    >
      {loading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ width: 13, height: 13, border: "1.5px solid rgba(255,252,242,0.3)", borderTop: "1.5px solid var(--off-white)", borderRadius: "50%" }}
          />
          Sending…
        </>
      ) : (
        <>
          <Send size={13} strokeWidth={1.5} />
          Submit Inquiry
        </>
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const px = "clamp(24px, 6vw, 80px)";

export default function Inquire() {
  const { items: allItems } = usePortfolio(null);
  const gridMotionUrls = allItems
    .filter((it) => it.url && !isVideo(it))
    .map((it) => it.url);

  const [formMode, setFormMode]         = useState("multi");
  const [step, setStep]                 = useState(1);
  const [dir, setDir]                   = useState(1);
  const [submitted, setSubmitted]       = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({});
  const [stepError, setStepError]       = useState("");
  const [formData, setFormData]         = useState(emptyForm);

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: false }));
    if (stepError) setStepError("");
  };

  const switchMode = (mode) => {
    setFormMode(mode); setStep(1); setDir(1);
    setFieldErrors({}); setStepError(""); setError("");
  };

  const STEP_ERRORS = {
    1: "Please enter your name, a valid email, and phone number.",
    2: "Please select a session type, event category, and preferred date.",
    3: "", 4: "",
  };

  const validateStep = (s = step) => {
    const errors = {};
    if (s === 1) {
      if (!formData.name.trim()) errors.name = true;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = true;
      if (!formData.phone.trim()) errors.phone = true;
    }
    if (s === 2) {
      if (!formData.sessionType)   errors.sessionType   = true;
      if (!formData.eventCategory) errors.eventCategory = true;
      if (!formData.eventDate)     errors.eventDate     = true;
    }
    return errors;
  };

  const validateCurrentStep = () => {
    const errors = validateStep(step);
    setFieldErrors(errors);
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) setStepError(STEP_ERRORS[step]);
    return !hasErrors;
  };

  const validateOnePager = () => {
    const combined = { ...validateStep(1), ...validateStep(2) };
    setFieldErrors(combined);
    const hasErrors = Object.keys(combined).length > 0;
    if (hasErrors) setStepError("Please fill in all required fields before submitting.");
    return !hasErrors;
  };

  const goNext = () => { if (!validateCurrentStep()) return; setDir(1); setStep((s) => s + 1); setError(""); };
  const goPrev = () => { setDir(-1); setStep((s) => s - 1); setError(""); setStepError(""); setFieldErrors({}); };

  const submitForm = async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/send-inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (data.success) { setSubmittedEmail(formData.email); setSubmitted(true); setShowConfetti(true); }
      else setError("Failed to send. Please try again.");
    } catch { setError("An error occurred. Please try again."); }
    finally { setLoading(false); }
  };

  const handleMultiSubmit  = async () => { if (!validateCurrentStep()) return; await submitForm(); };
  const handleOnePagerSubmit = async () => { if (!validateOnePager())   return; await submitForm(); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: "var(--bg)", color: "var(--ink)", minHeight: "100svh" }}
    >
      <Helmet>
        <title>Inquire — Kyle Payawal</title>
        <meta name="description" content="Book Kyle Payawal for your wedding, debut, pageant, portrait session, or commercial campaign. Fill out the inquiry form and expect a reply within 24 hours." />
        <link rel="canonical" href="https://kylepayawal.studio/inquire" />
      </Helmet>
      <Confetti active={showConfetti} />

      {/* ── §1 HERO ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          position:   "relative",
          overflow:   "hidden",
          background: "var(--ink)",
          padding:    `clamp(120px, 16vh, 180px) ${px} clamp(64px, 8vh, 100px)`,
        }}
      >
        {/* GridMotion background — same pattern as CTA section */}
        {gridMotionUrls.length > 0 && (
          <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.2 }}>
            <GridMotion items={gridMotionUrls} gradientColor="rgba(14,12,11,0.55)" />
          </div>
        )}
        {/* Dark vignette so text stays readable */}
        <div
          style={{
            position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
            background: "radial-gradient(ellipse at center, rgba(14,12,11,0.35) 0%, rgba(14,12,11,0.82) 100%)",
          }}
        />
        {/* Content */}
        <div style={{ position: "relative", zIndex: 2 }}>
        <motion.p
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            fontFamily:    "var(--font-body)", fontSize: "12px",
            letterSpacing:  "2px", textTransform: "uppercase",
            color:          "rgba(255,252,242,0.35)", marginBottom: "clamp(20px, 3vh, 32px)",
          }}
        >
          {BOOKING_STATUS}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.6 }}
          style={{
            fontFamily:    "'Outfit', sans-serif", fontWeight: 500,
            fontSize:       "clamp(56px, 9vw, 120px)",
            letterSpacing: "-0.035em", lineHeight: 0.88,
            color:          "var(--off-white)", textTransform: "uppercase",
            margin:         0,
          }}
        >
          Book Your
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.6 }}
          style={{
            fontFamily:           "'Fraunces', serif", fontWeight: 700, fontStyle: "italic",
            fontSize:              "clamp(48px, 7.5vw, 100px)",
            letterSpacing:        "-0.025em", lineHeight: 1.0,
            color:                 "rgba(255,252,242,0.55)",
            fontVariationSettings: "'opsz' 120", margin: 0,
          }}
        >
          dream session.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          style={{
            fontFamily:  "var(--font-body)", fontSize: "13px",
            letterSpacing: "1.5px", textTransform: "uppercase",
            color:         "rgba(255,252,242,0.25)", marginTop: "clamp(28px, 4vh, 44px)",
          }}
        >
          Tarlac · Angeles City, Pampanga · Available for travel
        </motion.p>
        </div>{/* /content z-index wrapper */}
      </section>

      {/* ── §2 PROCESS ──────────────────────────────────────────────────────── */}
      <section
        style={{
          background:    "var(--bg-dim)",
          padding:       `clamp(56px, 7vw, 96px) ${px}`,
          borderBottom:  "0.5px solid rgba(255,252,242,0.2)",
        }}
      >
        <p style={{
          fontFamily:    "var(--font-body)", fontSize: "12px",
          letterSpacing:  "2px", textTransform: "uppercase",
          color:          "rgba(255,252,242,0.6)", marginBottom: "clamp(32px, 5vh, 56px)",
          textAlign:      "center",
        }}>
          The Process
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(24px, 4vw, 56px)" }}>
          {PROCESS_STEPS.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ borderTop: "0.5px solid rgba(255,252,242,0.2)", paddingTop: "clamp(20px, 3vh, 28px)" }}
            >
              <div style={{
                fontFamily:    "'Outfit', sans-serif", fontWeight: 500,
                fontSize:       "clamp(36px, 4vw, 52px)",
                letterSpacing: "-0.03em", lineHeight: 1,
                color:          "rgba(255,252,242,0.2)",
                marginBottom:   16,
              }}>
                {s.num}
              </div>
              <div style={{
                fontFamily:    "var(--font-body)", fontSize: "13px",
                letterSpacing:  "1.5px", textTransform: "uppercase",
                color:          "var(--off-white)", marginBottom: 12,
              }}>
                {s.title}
              </div>
              <p style={{
                fontFamily:  "var(--font-body)", fontSize: "13px",
                color:        "rgba(255,252,242,0.7)", lineHeight: 1.7, margin: 0,
              }}>
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── §3 FORM ─────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--surface)", padding: `clamp(56px, 7vw, 96px) ${px}` }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {!submitted ? (
            <>
              {/* Mode switcher */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: "flex", justifyContent: "center", marginBottom: "clamp(32px, 5vh, 48px)" }}
              >
                <div style={{ display: "inline-flex", border: "0.5px solid var(--border)", background: "var(--bg)", padding: 3, gap: 2 }}>
                  {[
                    { id: "multi",     Icon: Layers,       label: "Step by Step" },
                    { id: "one-pager", Icon: AlignJustify, label: "One Page"     },
                  ].map(({ id, Icon, label }) => (
                    <button
                      key={id} type="button" onClick={() => switchMode(id)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        padding: "10px 20px",
                        fontFamily: "var(--font-body)", fontSize: "12px",
                        letterSpacing: "1.5px", textTransform: "uppercase",
                        border: "none", cursor: "pointer", transition: "all 0.2s",
                        background: formMode === id ? "var(--ink)" : "transparent",
                        color:      formMode === id ? "var(--off-white)" : "var(--ink-muted)",
                      }}
                    >
                      <Icon size={11} strokeWidth={1.5} />
                      {label}
                    </button>
                  ))}
                </div>
              </motion.div>

              <AnimatePresence mode="wait">

                {/* ── MULTI-STEP ─────────────────────────────────────────── */}
                {formMode === "multi" && (
                  <motion.div
                    key="multi"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Step indicator */}
                    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "clamp(32px, 5vh, 48px)" }}>
                      {[1, 2, 3, 4].map((s, i) => (
                        <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <motion.div
                              animate={{
                                background: s < step ? "var(--ink)" : s === step ? "var(--ink)" : "transparent",
                                opacity:    s < step ? 1 : s === step ? 1 : 0.2,
                              }}
                              transition={{ duration: 0.3 }}
                              style={{
                                width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                                fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "0.5px",
                                border: "0.5px solid var(--ink)",
                                color:  s <= step ? "var(--off-white)" : "var(--ink)",
                                flexShrink: 0,
                              }}
                            >
                              {s < step ? "✓" : `0${s}`}
                            </motion.div>
                            <span style={{
                              fontFamily:    "var(--font-body)", fontSize: "11px",
                              letterSpacing:  "1px", textTransform: "uppercase",
                              color:          s === step ? "var(--ink)" : "var(--ink-muted)",
                              marginTop:      6, whiteSpace: "nowrap", transition: "color 0.3s",
                            }}>
                              {STEP_LABELS[i]}
                            </span>
                          </div>
                          {i < 3 && (
                            <motion.div
                              animate={{ opacity: s < step ? 1 : 0.12 }}
                              transition={{ duration: 0.4 }}
                              style={{ flex: 1, height: "0.5px", background: "var(--ink)", margin: "0 6px", marginBottom: 22 }}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Card */}
                    <div style={{ background: "var(--bg)", border: "0.5px solid var(--border)" }}>
                      {/* Progress bar */}
                      <div style={{ height: 2, background: "var(--border)" }}>
                        <motion.div
                          animate={{ width: `${(step / 4) * 100}%` }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                          style={{ height: "100%", background: "var(--ink)" }}
                        />
                      </div>

                      <div style={{ padding: "clamp(28px, 4vw, 48px)" }}>
                        <div style={{ overflow: "hidden" }}>
                          <AnimatePresence mode="wait" custom={dir}>
                            {step === 1 && (
                              <motion.div key="s1" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
                                <StepHeader num="01" total="04" title="About You" />
                                <SectionAboutYou formData={formData} setField={setField} fieldErrors={fieldErrors} />
                              </motion.div>
                            )}
                            {step === 2 && (
                              <motion.div key="s2" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
                                <StepHeader num="02" total="04" title="Your Session" />
                                <SectionYourSession formData={formData} setField={setField} fieldErrors={fieldErrors} />
                              </motion.div>
                            )}
                            {step === 3 && (
                              <motion.div key="s3" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
                                <StepHeader num="03" total="04" title="Location & Scale" note="Optional — share if you have details" />
                                <SectionLocation formData={formData} setField={setField} fieldErrors={fieldErrors} />
                              </motion.div>
                            )}
                            {step === 4 && (
                              <motion.div key="s4" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
                                <StepHeader num="04" total="04" title="Vision & Budget" note="Optional — all helpful, nothing required" />
                                <SectionVision formData={formData} setField={setField} fieldErrors={fieldErrors} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <StepError message={stepError} />

                        {/* Nav buttons */}
                        <div style={{ display: "flex", justifyContent: step > 1 ? "space-between" : "flex-end", marginTop: 32 }}>
                          {step > 1 && (
                            <motion.button
                              type="button" onClick={goPrev} whileHover={{ x: -3 }}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 8,
                                fontFamily: "var(--font-body)", fontSize: "13px",
                                letterSpacing: "1.5px", textTransform: "uppercase",
                                color: "var(--ink-muted)", background: "none", border: "none",
                                cursor: "pointer", transition: "color 0.2s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-muted)")}
                            >
                              <ArrowLeft size={13} strokeWidth={1.5} /> Back
                            </motion.button>
                          )}
                          {step < 4 ? (
                            <motion.button
                              type="button" onClick={goNext} whileHover={{ x: 3 }}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 10,
                                padding: "14px 28px", background: "var(--ink)", color: "var(--off-white)",
                                fontFamily: "var(--font-body)", fontSize: "13px",
                                letterSpacing: "2px", textTransform: "uppercase",
                                border: "none", cursor: "pointer", transition: "background 0.2s",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-dark)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--ink)")}
                            >
                              Continue <ArrowRight size={13} strokeWidth={1.5} />
                            </motion.button>
                          ) : (
                            <SubmitBtn onClick={handleMultiSubmit} loading={loading} />
                          )}
                        </div>

                        {error && <FormError message={error} />}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── ONE-PAGER ──────────────────────────────────────────── */}
                {formMode === "one-pager" && (
                  <motion.div
                    key="one-pager"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div style={{ background: "var(--bg)", border: "0.5px solid var(--border)" }}>
                      <div style={{ padding: "clamp(28px, 4vw, 48px)", display: "flex", flexDirection: "column", gap: 40 }}>
                        {[
                          { num: "01", title: "About You",     note: null,                                    Section: SectionAboutYou     },
                          { num: "02", title: "Your Session",  note: null,                                    Section: SectionYourSession  },
                          { num: "03", title: "Location",      note: "Optional — share if you have details",  Section: SectionLocation      },
                          { num: "04", title: "Vision & Budget", note: "Optional — all helpful, nothing required", Section: SectionVision  },
                        ].map(({ num, title, note, Section }, i) => (
                          <div key={num}>
                            {i > 0 && <div style={{ height: "0.5px", background: "var(--border)", marginBottom: 40 }} />}
                            <StepHeader num={num} total="04" title={title} note={note} />
                            <Section formData={formData} setField={setField} fieldErrors={fieldErrors} />
                          </div>
                        ))}

                        <StepError message={stepError} />

                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <SubmitBtn onClick={handleOnePagerSubmit} loading={loading} />
                        </div>

                        {error && <FormError message={error} />}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (

            /* ── SUCCESS ─────────────────────────────────────────────────── */
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              style={{ textAlign: "center" }}
            >
              <div style={{ background: "var(--ink)", padding: "clamp(48px, 8vw, 88px)" }}>
                <h2 style={{
                  fontFamily:    "'Outfit', sans-serif", fontWeight: 500,
                  fontSize:       "clamp(40px, 7vw, 72px)",
                  letterSpacing: "-0.03em", lineHeight: 0.9,
                  color:          "var(--off-white)", textTransform: "uppercase",
                  margin:                "0 0 24px",
                }}>
                  It's happening.
                </h2>
                <p style={{
                  fontFamily:           "'Fraunces', serif", fontStyle: "italic", fontWeight: 700,
                  fontSize:              "clamp(16px, 2vw, 21px)",
                  fontVariationSettings: "'opsz' 36",
                  color:                 "rgba(255,252,242,0.5)", lineHeight: 1.6, margin: 0,
                }}>
                  Inquiry received. Expect a reply to{" "}
                  <span style={{ color: "var(--off-white)" }}>{submittedEmail}</span> within 24 hours.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </motion.div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StepHeader({ num, total, title, note }) {
  return (
    <div style={{ marginBottom: "clamp(20px, 3vh, 32px)" }}>
      <p style={{
        fontFamily:    "var(--font-body)", fontSize: "12px",
        letterSpacing:  "1.5px", textTransform: "uppercase",
        color:          "var(--ink-muted)", margin: "0 0 8px",
      }}>
        Step {num} of {total}
      </p>
      <h3 style={{
        fontFamily:    "'Outfit', sans-serif", fontWeight: 500,
        fontSize:       "clamp(24px, 3.5vw, 36px)",
        letterSpacing: "-0.025em", lineHeight: 0.92,
        color:          "var(--ink)", textTransform: "uppercase",
        margin:                  note ? "0 0 6px" : 0,
      }}>
        {title}
      </h3>
      {note && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-faint)", margin: 0 }}>
          {note}
        </p>
      )}
    </div>
  );
}

function FormError({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{ marginTop: 20, padding: "14px 18px", border: "0.5px solid var(--border)", textAlign: "center" }}
    >
      <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ink-muted)" }}>
        {message}
      </span>
    </motion.div>
  );
}
