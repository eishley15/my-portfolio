import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Mail, Instagram, Facebook, ArrowRight, X } from "lucide-react";
import Confetti from "../components/Confetti";

const inquiryTypes = [
  "Partnership",
  "Sponsorship",
  "Brand Collaboration",
  "Media Feature",
  "Speaking / Guest",
  "Other",
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    inquiryType: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = true;
    if (!formData.email.trim()) errors.email = true;
    if (!formData.inquiryType) errors.inquiryType = true;
    if (!formData.message.trim()) errors.message = true;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("access_key", import.meta.env.VITE_WEB3FORMS_ACCESS_KEY);
      form.append("name", formData.name);
      form.append("email", formData.email);
      form.append("company", formData.company || "—");
      form.append("inquiryType", formData.inquiryType);
      form.append("message", formData.message);
      form.append("subject", `[${formData.inquiryType}] from ${formData.name} — kylepayawal.studio`);
      form.append("from_name", "Kyle Payawal Portfolio — Contact");

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: form,
      });
      const data = await response.json();

      if (data.success) {
        setSubmittedEmail(formData.email);
        setSubmitted(true);
        setShowConfetti(true);
        setFormData({ name: "", email: "", company: "", inquiryType: "", message: "" });
      } else {
        setError("Failed to send. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen"
    >
      <Helmet>
        <title>Contact Kyle Payawal | Partnerships &amp; Collaborations</title>
        <meta name="description" content="Reach out to Kyle Payawal for brand partnerships, sponsorships, media features, or collaborations." />
        <meta property="og:title" content="Contact Kyle Payawal | Partnerships & Collaborations" />
        <meta property="og:url" content="https://kylepayawal.studio/contact" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://kylepayawal.studio/contact" />
      </Helmet>

      <Confetti active={showConfetti} />

      {/* Hero */}
      <div className="relative bg-[var(--black)] text-[var(--off-white)] pt-40 pb-24 px-6 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url(https://cdn.kylepayawal.studio/portfolio/commercial/DSC06393.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        />
        <div className="absolute inset-0 bg-black/75 z-[1]" />

        <div className="max-w-3xl mx-auto text-center relative z-[2]">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="eyebrow section-dark mb-6"
            style={{ color: "rgba(255,252,242,0.4)", letterSpacing: "3px", fontSize: "10px" }}
          >
            GET IN TOUCH
          </motion.div>
          <h1>
            <motion.span
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="font-display text-[clamp(52px,9vw,110px)] leading-[0.88] tracking-[-0.02em] block"
            >
              LET'S WORK
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="font-serif italic text-[clamp(44px,7vw,90px)] leading-[1.1] block"
            >
              together
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-6 text-[var(--gray-light)] text-sm max-w-md mx-auto leading-relaxed"
          >
            Partnerships, sponsorships, brand collabs, media features — if you think we're a fit, let's talk.
          </motion.p>
        </div>
      </div>

      {/* Form + Sidebar */}
      <div className="bg-[var(--off-white)] text-[var(--black)] py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_320px] gap-16 items-start">

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="c-name" className="block text-[11px] tracking-[1.5px] uppercase mb-3 font-medium">
                  Full Name *
                </label>
                <motion.div animate={{ scale: fieldErrors.name ? [1, 1.02, 1] : 1 }} transition={{ duration: 0.3 }}>
                  <input
                    id="c-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    className="w-full px-5 py-4 bg-[var(--off-white)] text-[var(--black)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--red)] transition-all"
                    style={{ border: fieldErrors.name ? "2px solid var(--red)" : "1px solid rgba(0,0,0,0.1)" }}
                  />
                </motion.div>
              </div>

              <div>
                <label htmlFor="c-email" className="block text-[11px] tracking-[1.5px] uppercase mb-3 font-medium">
                  Email Address *
                </label>
                <motion.div animate={{ scale: fieldErrors.email ? [1, 1.02, 1] : 1 }} transition={{ duration: 0.3 }}>
                  <input
                    id="c-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@company.com"
                    className="w-full px-5 py-4 bg-[var(--off-white)] text-[var(--black)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--red)] transition-all"
                    style={{ border: fieldErrors.email ? "2px solid var(--red)" : "1px solid rgba(0,0,0,0.1)" }}
                  />
                </motion.div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="c-company" className="block text-[11px] tracking-[1.5px] uppercase mb-3 font-medium">
                  Company / Brand
                </label>
                <input
                  id="c-company"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Acme Corp (optional)"
                  className="w-full px-5 py-4 bg-[var(--off-white)] text-[var(--black)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--red)] transition-all"
                  style={{ border: "1px solid rgba(0,0,0,0.1)" }}
                />
              </div>

              <div>
                <label htmlFor="c-type" className="block text-[11px] tracking-[1.5px] uppercase mb-3 font-medium">
                  Inquiry Type *
                </label>
                <motion.div animate={{ scale: fieldErrors.inquiryType ? [1, 1.02, 1] : 1 }} transition={{ duration: 0.3 }} style={{ position: "relative" }}>
                  <select
                    id="c-type"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-[var(--off-white)] text-[var(--black)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--red)] transition-all"
                    style={{
                      appearance: "none",
                      paddingRight: "44px",
                      border: fieldErrors.inquiryType ? "2px solid var(--red)" : "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    <option value="">Select type</option>
                    {inquiryTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(14,12,11,0.4)" }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </motion.div>
              </div>
            </div>

            <div>
              <label htmlFor="c-message" className="block text-[11px] tracking-[1.5px] uppercase mb-3 font-medium">
                Message *
              </label>
              <motion.div animate={{ scale: fieldErrors.message ? [1, 1.02, 1] : 1 }} transition={{ duration: 0.3 }}>
                <textarea
                  id="c-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Tell me what you have in mind — goals, timeline, budget range, anything relevant..."
                  className="w-full px-5 py-4 bg-[var(--off-white)] text-[var(--black)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--red)] resize-none transition-all"
                  style={{ border: fieldErrors.message ? "2px solid var(--red)" : "1px solid rgba(0,0,0,0.1)" }}
                />
              </motion.div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full px-8 py-5 bg-[var(--black)] text-[var(--off-white)] text-[11px] uppercase tracking-[2px] font-medium hover:bg-[var(--red)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-[var(--off-white)] border-t-transparent rounded-full"
                  />
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <ArrowRight size={15} />
                </>
              )}
            </motion.button>

            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ background: "var(--black)", padding: "40px 48px", position: "relative" }}
              >
                <button
                  onClick={() => { setSubmitted(false); setShowConfetti(false); }}
                  style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", color: "rgba(255,252,242,0.4)", cursor: "pointer" }}
                  aria-label="Dismiss"
                >
                  <X size={16} />
                </button>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,48px)", color: "var(--off-white)", letterSpacing: "2px", lineHeight: 0.9, marginBottom: "12px" }}>
                  MESSAGE SENT.
                </div>
                <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  Got it. I'll reply to {submittedEmail} within 48 hours.
                </p>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ background: "rgba(139,31,48,0.08)", border: "0.5px solid rgba(139,31,48,0.3)", padding: "16px 24px", textAlign: "center" }}
              >
                <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--red)" }}>{error}</span>
              </motion.div>
            )}
          </motion.form>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="space-y-10"
          >
            <div>
              <div className="text-[11px] tracking-[2px] uppercase mb-4" style={{ color: "rgba(14,12,11,0.4)" }}>
                Direct
              </div>
              <a
                href="mailto:payawalkyle@gmail.com"
                className="flex items-center gap-3 text-[var(--black)] hover:text-[var(--red)] transition-colors group"
              >
                <Mail size={18} className="shrink-0" />
                <span className="text-sm">payawalkyle@gmail.com</span>
              </a>
            </div>

            <div>
              <div className="text-[11px] tracking-[2px] uppercase mb-4" style={{ color: "rgba(14,12,11,0.4)" }}>
                Social
              </div>
              <div className="space-y-3">
                <a
                  href="https://www.instagram.com/payawalkyle/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[var(--black)] hover:text-[var(--red)] transition-colors"
                >
                  <Instagram size={18} className="shrink-0" />
                  <span className="text-sm">@payawalkyle</span>
                </a>
                <a
                  href="https://www.facebook.com/kyle.payawal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[var(--black)] hover:text-[var(--red)] transition-colors"
                >
                  <Facebook size={18} className="shrink-0" />
                  <span className="text-sm">Kyle Payawal</span>
                </a>
              </div>
            </div>

            <div
              style={{
                borderTop: "0.5px solid rgba(0,0,0,0.1)",
                paddingTop: "32px",
              }}
            >
              <div className="text-[11px] tracking-[2px] uppercase mb-3" style={{ color: "rgba(14,12,11,0.4)" }}>
                Looking to book a shoot?
              </div>
              <p className="text-sm text-[var(--gray-light)] mb-4 leading-relaxed">
                For weddings, portraits, debuts, and events, use the dedicated inquiry form.
              </p>
              <a
                href="/inquire"
                className="inline-flex items-center gap-2 text-[11px] tracking-[2px] uppercase text-[var(--black)] hover:text-[var(--red)] transition-colors font-medium"
              >
                Go to Inquire <ArrowRight size={13} />
              </a>
            </div>
          </motion.aside>
        </div>
      </div>
    </motion.div>
  );
}
