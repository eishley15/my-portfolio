import { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Instagram, Facebook, ArrowRight, Mail } from "lucide-react";
import Confetti from "../components/Confetti";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    eventType: "",
    eventDate: "",
    location: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const eventTypes = [
    "Wedding",
    "Debut",
    "Birthday",
    "Christening",
    "Portrait",
    "Product",
    "Lifestyle",
    "Pageant",
    "Commercial",
    "SaaS",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
      form.append("eventType", formData.eventType);
      form.append("eventDate", formData.eventDate);
      form.append("location", formData.location);
      form.append("message", formData.message);
      form.append("subject", "New Inquiry from kylepayawal.studio");
      form.append("from_name", "Kyle Payawal Portfolio");

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setShowConfetti(true);
        setFormData({
          name: "",
          email: "",
          eventType: "",
          eventDate: "",
          location: "",
          message: "",
        });
        setTimeout(() => {
          setSubmitted(false);
          setShowConfetti(false);
        }, 5000);
      } else {
        setError("Failed to send. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: false });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = true;
    if (!formData.email.trim()) errors.email = true;
    if (!formData.eventType) errors.eventType = true;
    if (!formData.eventDate) errors.eventDate = true;
    if (!formData.location.trim()) errors.location = true;
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      <Confetti active={showConfetti} />
      <div className="relative bg-[var(--black)] text-[var(--off-white)] pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "url(https://cdn.kylepayawal.studio/portfolio/commercial/DSC06393.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/70 z-[1]" />

        <div className="max-w-4xl mx-auto text-center relative z-[2]">
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-[clamp(56px,10vw,120px)] leading-[0.88] mb-4 tracking-[-0.02em]"
          >
            LET'S MAKE
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-[clamp(48px,8vw,100px)] mb-4 leading-[0.4]"
          >
            something
          </motion.h2>
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-[clamp(56px,10vw,120px)] leading-[1.3] mb-8 tracking-[-0.02em]"
          >
            UNFORGETTABLE
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-[var(--gray-light)] text-sm"
          >
            Based in Tarlac · Angeles City, Pampanga · Available for travel
          </motion.p>
        </div>
      </div>

      <div className="bg-[var(--off-white)] text-[var(--black)] py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="eyebrow mb-4">GET IN TOUCH</div>
            <h2 className="font-display text-[clamp(36px,6vw,56px)] leading-[0.9] mb-4">
              LET'S CREATE
            </h2>
            <p className="text-[var(--gray-light)] text-sm max-w-xl mx-auto">
              Fill out the form below and I'll get back to you within 24 hours.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="bg-white shadow-lg p-8 md:p-12"
            style={{
              border: "0.5px solid rgba(0,0,0,0.08)",
            }}
          >
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] tracking-[1.5px] uppercase mb-3 font-medium text-[var(--black)]">
                    Full Name *
                  </label>
                  <motion.div
                    animate={{
                      scale: fieldErrors.name ? [1, 1.02, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full px-5 py-4 bg-[var(--off-white)] text-[var(--black)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--red)] transition-all"
                      style={{
                        border: fieldErrors.name
                          ? "2px solid var(--red)"
                          : "1px solid rgba(0,0,0,0.1)",
                      }}
                    />
                  </motion.div>
                </div>

                <div>
                  <label className="block text-[11px] tracking-[1.5px] uppercase mb-3 font-medium text-[var(--black)]">
                    Email Address *
                  </label>
                  <motion.div
                    animate={{
                      scale: fieldErrors.email ? [1, 1.02, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                      className="w-full px-5 py-4 bg-[var(--off-white)] text-[var(--black)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--red)] transition-all"
                      style={{
                        border: fieldErrors.email
                          ? "2px solid var(--red)"
                          : "1px solid rgba(0,0,0,0.1)",
                      }}
                    />
                  </motion.div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] tracking-[1.5px] uppercase mb-3 font-medium text-[var(--black)]">
                    Event Type *
                  </label>
                  <motion.div
                    animate={{
                      scale: fieldErrors.eventType ? [1, 1.02, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 bg-[var(--off-white)] text-[var(--black)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--red)] transition-all"
                      style={{
                        border: fieldErrors.eventType
                          ? "2px solid var(--red)"
                          : "1px solid rgba(0,0,0,0.1)",
                      }}
                    >
                      <option value="">Select event type</option>
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                </div>

                <div>
                  <label className="block text-[11px] tracking-[1.5px] uppercase mb-3 font-medium text-[var(--black)]">
                    Event Date *
                  </label>
                  <motion.div
                    animate={{
                      scale: fieldErrors.eventDate ? [1, 1.02, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 bg-[var(--off-white)] text-[var(--black)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--red)] transition-all"
                      style={{
                        border: fieldErrors.eventDate
                          ? "2px solid var(--red)"
                          : "1px solid rgba(0,0,0,0.1)",
                      }}
                    />
                  </motion.div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] tracking-[1.5px] uppercase mb-3 font-medium text-[var(--black)]">
                  Location *
                </label>
                <motion.div
                  animate={{
                    scale: fieldErrors.location ? [1, 1.02, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="Tarlac City, Tarlac"
                    className="w-full px-5 py-4 bg-[var(--off-white)] text-[var(--black)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--red)] transition-all"
                    style={{
                      border: fieldErrors.location
                        ? "2px solid var(--red)"
                        : "1px solid rgba(0,0,0,0.1)",
                    }}
                  />
                </motion.div>
              </div>

              <div>
                <label className="block text-[11px] tracking-[1.5px] uppercase mb-3 font-medium text-[var(--black)]">
                  Additional Details
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Tell me more about your event, vision, and any specific requirements..."
                  className="w-full px-5 py-4 bg-[var(--off-white)] text-[var(--black)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--red)] resize-none transition-all"
                  style={{
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                />
              </div>

              <div className="pt-4">
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
                      <Mail size={16} />
                      Send Inquiry
                    </>
                  )}
                </motion.button>
              </div>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded flex items-center justify-center gap-3"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-xl"
                  >
                    ✓
                  </motion.span>
                  <span className="text-sm font-medium">
                    Message sent successfully! I'll be in touch soon.
                  </span>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded text-center"
                >
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-16 text-center"
          >
            <p className="text-sm text-[var(--gray-light)] mb-6">
              Or reach me directly
            </p>
            <div className="flex justify-center gap-8">
              <a
                href="https://www.instagram.com/payawalkyle/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[var(--black)] hover:text-[var(--red)] transition-colors"
              >
                <Instagram size={20} />
                <span className="text-sm">Instagram</span>
              </a>
              <a
                href="https://www.facebook.com/kyle.payawal"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[var(--black)] hover:text-[var(--red)] transition-colors"
              >
                <Facebook size={20} />
                <span className="text-sm">Facebook</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
