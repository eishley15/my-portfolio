import { motion } from "framer-motion";
import { Instagram, Facebook } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Lazy load image component
function LazyImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { rootMargin: "50px" },
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      onLoad={() => setLoaded(true)}
      style={{ opacity: loaded ? 1 : 0.5, transition: "opacity 0.3s" }}
    />
  );
}

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
            <div className="aspect-[3/4] bg-[var(--gray-dark)] relative overflow-hidden w-full max-h-[580px]">
              <LazyImage
                src="/kylepayawalprofile.webp"
                alt="Kyle Payawal"
                className="w-full h-full object-cover"
              />
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
            <div className="eyebrow mb-6">
              THE PHOTOGRAPHER | VIDEOGRAPHER | EDITOR
            </div>

            <h1 className="font-display text-[clamp(56px,8vw,96px)] leading-[0.88] mb-2">
              KYLE
            </h1>
            <h2 className="italic-accent text-[clamp(48px,7vw,80px)] leading-[0.6] mb-8">
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
                  href="https://www.instagram.com/payawalkyle/"
                  className="flex items-center gap-2 text-[var(--black)] hover:text-[var(--red)] transition-colors"
                >
                  <Instagram size={20} />
                  <span className="text-sm">Instagram</span>
                </a>
                <a
                  href="https://www.facebook.com/kyle.payawal"
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
