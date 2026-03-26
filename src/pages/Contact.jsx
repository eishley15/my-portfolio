import { useState } from 'react'
import { motion } from 'framer-motion'
import { Instagram, Facebook } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    eventType: '',
    eventDate: '',
    location: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const eventTypes = [
    'Wedding', 'Debut', 'Birthday', 'Christening', 'Portrait',
    'Product', 'Lifestyle', 'Pageant', 'Commercial', 'SaaS', 'Other'
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen"
    >
      <div className="bg-[var(--black)] text-[var(--off-white)] pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-[clamp(56px,10vw,120px)] leading-[0.88] mb-4"
          >
            LET'S MAKE
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="italic-accent text-[clamp(48px,8vw,100px)] mb-4"
          >
            something
          </motion.h2>
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-display text-[clamp(56px,10vw,120px)] leading-[0.88] mb-8"
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
        <div className="max-w-2xl mx-auto">
          <motion.form
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] tracking-[2px] uppercase mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[var(--cream)] text-[var(--black)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--red)]"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[2px] uppercase mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[var(--cream)] text-[var(--black)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--red)]"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] tracking-[2px] uppercase mb-2">Event Type</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[var(--cream)] text-[var(--black)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--red)]"
                >
                  <option value="">Select event type</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] tracking-[2px] uppercase mb-2">Event Date</label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[var(--cream)] text-[var(--black)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--red)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] tracking-[2px] uppercase mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[var(--cream)] text-[var(--black)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--red)]"
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-[2px] uppercase mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 bg-[var(--cream)] text-[var(--black)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--red)] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-4 bg-[var(--black)] text-[var(--off-white)] text-[11px] uppercase tracking-[2px] hover:bg-[var(--red)] transition-all"
            >
              Send Inquiry
            </button>

            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-[var(--red)] text-sm"
              >
                Got it. I'll be in touch soon.
              </motion.div>
            )}
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-[var(--gray-light)] mb-4">Or reach me directly</p>
            <div className="flex justify-center gap-6">
              <a
                href="#"
                className="flex items-center gap-2 text-[var(--black)] hover:text-[var(--red)] transition-colors"
              >
                <Instagram size={20} />
                <span className="text-sm">Instagram</span>
              </a>
              <a
                href="#"
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
  )
}
