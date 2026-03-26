import { motion } from "framer-motion";
import { Instagram, Facebook } from "lucide-react";

export default function About() {
  const services = [
    "Wedding",
    "Debut",
    "Christening",
    "Birthday",
    "Portraits",
    "Lifestyle",
    "Product",
    "Pageant",
    "Commercial",
    "SaaS Films",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[var(--off-white)] text-[var(--black)] pt-24 pb-20 px-6"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[3/4] bg-[var(--gray-dark)] relative">
              {/* // replace with actual portrait image */}
              <div className="absolute inset-0 flex items-center justify-center text-[var(--gray-mid)] text-xs">
                // portrait image
              </div>
            </div>
            <div
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{
                border: "0.5px solid rgba(0,0,0,0.15)",
                transform: "translate(-8px, 8px)",
                zIndex: -1,
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="eyebrow mb-6">THE PHOTOGRAPHER / DIRECTOR</div>

            <h1 className="font-display text-[clamp(56px,8vw,96px)] leading-[0.88] mb-2">
              KYLE
            </h1>
            <h2 className="italic-accent text-[clamp(48px,7vw,80px)] mb-8">
              Payawal
            </h2>

            <p className="mb-8 leading-relaxed">
              Based in Tarlac and Angeles City, I shoot images and films that
              live somewhere between flash-lit editorial and sun-bleached
              handycam footage — because every event deserves both polish and
              soul. From debut celebrations to pageant advocacy films, product
              shoots to wedding days, I bring a consistent obsession with light,
              texture, and the in-between moments that make everything real.
            </p>

            <div className="mb-8">
              <div className="text-[10px] tracking-[2px] uppercase mb-4 text-[var(--gray-light)]">
                Services
              </div>
              <div className="flex flex-wrap gap-2">
                {services.map((service) => (
                  <span
                    key={service}
                    className="px-4 py-2 text-[11px] tracking-[1px]"
                    style={{ border: "0.5px solid rgba(0,0,0,0.2)" }}
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] tracking-[2px] uppercase mb-4 text-[var(--gray-light)]">
                Connect
              </div>
              <div className="flex gap-4">
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
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
