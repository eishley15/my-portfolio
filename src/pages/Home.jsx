import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useFeaturedPortfolio, usePortfolio } from "../hooks/usePortfolio";
import LoadingScreen from "../components/LoadingScreen";

// Magnetic button component
function MagneticButton({ children, to, variant = "solid" }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const baseStyles = {
    display: "inline-block",
    fontFamily: "var(--font-body)",
    fontSize: "11px",
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    textDecoration: "none",
    padding: "16px 36px",
    transition: "background 0.2s",
  };

  const variantStyles =
    variant === "solid"
      ? {
          color: "var(--off-white)",
          background: "var(--black)",
        }
      : {
          color: "var(--black)",
          background: "transparent",
          border: "1px solid var(--black)",
        };

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY, display: "inline-block" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to={to}
        style={{ ...baseStyles, ...variantStyles }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--red)";
          if (variant === "outline") {
            e.currentTarget.style.color = "var(--off-white)";
            e.currentTarget.style.borderColor = "var(--red)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            variant === "solid" ? "var(--black)" : "transparent";
          if (variant === "outline") {
            e.currentTarget.style.color = "var(--black)";
            e.currentTarget.style.borderColor = "var(--black)";
          }
        }}
      >
        {children}
      </Link>
    </motion.div>
  );
}

// Animated counter component
function AnimatedCounter({ end, duration = 2, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// Video component that autoplays when in view
function VideoWithAutoplay({ src, className }) {
  const videoRef = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { rootMargin: "50px" },
    );

    const currentVideoRef = videoRef.current;
    if (currentVideoRef) {
      observer.observe(currentVideoRef);
    }

    return () => {
      if (currentVideoRef) {
        observer.unobserve(currentVideoRef);
      }
    };
  }, []);

  useEffect(() => {
    if (isIntersecting && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isIntersecting]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      muted
      loop
      playsInline
    />
  );
}

// Lazy load image component
function LazyImage({ src, alt, style }) {
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
      style={{
        ...style,
        opacity: loaded ? 1 : 0.5,
        transition: "opacity 0.3s",
      }}
      onLoad={() => setLoaded(true)}
    />
  );
}

// Marquee placeholder items — replace src with real images when available
const MARQUEE_ITEMS = [
  { id: 1, label: "Wedding" },
  { id: 2, label: "Debut" },
  { id: 3, label: "Pageant" },
  { id: 4, label: "Product" },
  { id: 5, label: "Portrait" },
  { id: 6, label: "Lifestyle" },
  { id: 7, label: "Commercial" },
  { id: 8, label: "Christening" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.12 },
  }),
};

export default function Home() {
  const revealRef = useRef([]);
  const heroVideoRef = useRef(null);
  const heroRef = useRef(null);
  const { items: selectedWork, loading } = useFeaturedPortfolio(4);
  const { items: marqueeItems, loading: marqueeLoading } =
    useFeaturedPortfolio(6);
  const [enableAutoplay, setEnableAutoplay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Parallax effect for hero
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);

  // Wait for data to load before hiding loading screen
  useEffect(() => {
    if (!loading && !marqueeLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [loading, marqueeLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.12 },
    );
    revealRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Enable video autoplay after initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setEnableAutoplay(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const addReveal = (el) => {
    if (el && !revealRef.current.includes(el)) revealRef.current.push(el);
  };

  return (
    <>
      <LoadingScreen isVisible={isLoading} />
      <main>
        {/* ============ HERO ============ */}
        <section
          ref={heroRef}
          style={{
            position: "relative",
            height: "100svh",
            minHeight: "600px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            textAlign: "center",
          }}
        >
          <motion.video
            ref={heroVideoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%230e0c0b' width='1920' height='1080'/%3E%3C/svg%3E"
            src="https://cdn.kylepayawal.studio/portfolio/commercial/CG%20AVP%2016%209.mp4"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
            initial={{ scale: 1 }}
            animate={{ y: heroY, opacity: heroOpacity }}
          />

          {/* Overlay — warmer than pure black */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(14,12,11,0.6) 0%, rgba(14,12,11,0.45) 50%, rgba(14,12,11,0.72) 100%)",
              zIndex: 1,
            }}
          />

          {/* Hero content */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              padding: "0 24px",
              maxWidth: "900px",
            }}
          >
            {/* Eyebrow */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "var(--red)",
                marginBottom: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <span
                style={{
                  width: "24px",
                  height: "0.5px",
                  background: "var(--red)",
                  display: "inline-block",
                }}
              />
              Photographer · Videographer
              <span
                style={{
                  width: "24px",
                  height: "0.5px",
                  background: "var(--red)",
                  display: "inline-block",
                }}
              />
            </motion.p>

            {/* Main title */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(52px, 9vw, 112px)",
                lineHeight: 0.6,
                letterSpacing: "-0.5px",
                color: "var(--off-white)",
                marginBottom: "0",
              }}
            >
              IT'S GONNA LOOK
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="font-serif"
              style={{
                fontStyle: "italic",
                fontSize: "clamp(44px, 7.5vw, 96px)",
                lineHeight: 1.0,
                color: "var(--off-white)",
                marginBottom: "0",
              }}
            >
              a little different.
            </motion.p>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(52px, 9vw, 112px)",
                lineHeight: 0.9,
                color: "var(--off-white)",
                marginBottom: "40px",
              }}
            >
              THAT'S THE POINT.
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 300,
                color: "var(--text-muted)",
                letterSpacing: "0.5px",
                marginBottom: "8px",
              }}
            >
              Available for weddings, debuts, pageants, products & brand
              campaigns
            </motion.p>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={5}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "var(--text-muted-dark)",
                marginBottom: "48px",
              }}
            >
              Tarlac · Angeles City, Pampanga
            </motion.p>

            {/* Single CTA — quiet, not a button */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={6}
            >
              <MagneticButton to="/work">
                View Work
              </MagneticButton>
            </motion.div>
          </div>

          {/* Stats — bottom right */}
          <div
            style={{
              position: "absolute",
              right: "40px",
              bottom: "48px",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              textAlign: "right",
            }}
          >
            {[
              [200, "+", "Projects"],
              [10, "", "Categories"],
              [5, "+", "Years"],
            ].map(([num, suffix, label]) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "28px",
                    lineHeight: 1,
                    color: "var(--off-white)",
                  }}
                >
                  <AnimatedCounter end={num} suffix={suffix} />
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "9px",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "var(--text-muted-dark)",
                    marginTop: "2px",
                  }}
                >
                  {label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Scroll indicator — left */}
          <div
            style={{
              position: "absolute",
              left: "40px",
              bottom: "40px",
              zIndex: 2,
              fontFamily: "var(--font-body)",
              fontSize: "9px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "var(--text-muted-dark)",
              writingMode: "vertical-lr",
            }}
          >
            Scroll
          </div>
        </section>

        {/* ============ MARQUEE STRIP ============ */}
        <section
          style={{
            overflow: "hidden",
            background: "var(--black-pure)",
            borderTop: "0.5px solid rgba(240,235,224,0.05)",
            borderBottom: "0.5px solid rgba(240,235,224,0.05)",
          }}
        >
          <div className="marquee-track">
            {marqueeItems.length > 0
              ? [...marqueeItems, ...marqueeItems, ...marqueeItems].map(
                  (item, i) => (
                    <div
                      key={i}
                      style={{
                        width: "320px",
                        height: "220px",
                        flexShrink: 0,
                        borderRight: "0.5px solid rgba(240,235,224,0.04)",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {(() => {
                        const isVideo = () => {
                          if (item.type === "video") return true;
                          if (!item.url) return false;
                          const videoExtensions = [
                            "mp4",
                            "webm",
                            "ogg",
                            "mov",
                            "avi",
                            "mkv",
                          ];
                          const url = item.url.toLowerCase();
                          return videoExtensions.some((ext) =>
                            url.includes(`.${ext}`),
                          );
                        };
                        return isVideo() ? (
                          <VideoWithAutoplay
                            src={item.url}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <LazyImage
                            src={item.url}
                            alt={item.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        );
                      })()}
                      <span
                        style={{
                          position: "absolute",
                          bottom: "14px",
                          left: "16px",
                          fontFamily: "var(--font-body)",
                          fontSize: "9px",
                          letterSpacing: "2px",
                          textTransform: "uppercase",
                          color: "rgba(240,235,224,0.5)",
                        }}
                      >
                        {item.category}
                      </span>
                    </div>
                  ),
                )
              : [...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      width: "320px",
                      height: "220px",
                      flexShrink: 0,
                      background: `hsl(${20 + i * 7}, 8%, ${8 + (i % 3) * 3}%)`,
                      display: "flex",
                      alignItems: "flex-end",
                      padding: "14px 16px",
                      borderRight: "0.5px solid rgba(240,235,224,0.04)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "9px",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: "rgba(240,235,224,0.2)",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
          </div>
        </section>

        {/* ============ INTRO STATEMENT ============ */}
        <section
          ref={addReveal}
          className="reveal section-light"
          style={{
            padding: "clamp(80px, 12vw, 160px) clamp(24px, 8vw, 120px)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "rgba(14,12,11,0.35)",
                marginBottom: "20px",
              }}
            >
              The approach
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(40px, 5vw, 72px)",
                lineHeight: 0.9,
                color: "var(--black)",
                marginBottom: "32px",
              }}
            >
              FLASH.
              <br />
              <span
                className="font-serif"
                style={{
                  fontStyle: "italic",
                  lineHeight: 0.6,
                }}
              >
                grain.
              </span>
              <br />
              TRUTH.
            </h2>
          </div>
          <div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "15px",
                fontWeight: 300,
                lineHeight: 1.2,
                color: "rgba(14,12,11,0.7)",
                marginBottom: "28px",
              }}
            >
              I shoot images and films that live somewhere between flash-lit
              editorial and sun-bleached handycam footage. Every event deserves
              both polish and soul.
            </p>
            <Link
              to="/about"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: "var(--black)",
                textDecoration: "none",
                borderBottom: "0.5px solid rgba(14,12,11,0.3)",
                paddingBottom: "3px",
                transition: "border-color 0.2s",
              }}
            >
              About Kyle →
            </Link>
          </div>
        </section>

        {/* ============ CATEGORY PREVIEW ============ */}
        <section
          ref={addReveal}
          className="reveal"
          style={{
            background: "var(--black)",
            padding: "clamp(60px, 10vw, 120px) clamp(24px, 6vw, 80px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "40px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(36px, 5vw, 64px)",
                color: "var(--off-white)",
                letterSpacing: "1px",
              }}
            >
              SELECTED WORK
            </h2>
            <Link
              to="/work"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                textDecoration: "none",
                borderBottom: "0.5px solid rgba(240,235,224,0.2)",
                paddingBottom: "2px",
              }}
            >
              View All →
            </Link>
          </div>

          {/* 2x2 asymmetric preview grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "auto auto",
              gap: "4px",
            }}
          >
            {(selectedWork.length > 0
              ? selectedWork
              : [
                  { id: 1, category: "Wedding", type: "photo", url: "" },
                  { id: 2, category: "Pageant", type: "photo", url: "" },
                  { id: 3, category: "Debut", type: "photo", url: "" },
                  { id: 4, category: "Portrait", type: "photo", url: "" },
                ]
            ).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ position: "relative", overflow: "hidden" }}
              >
                <Link
                  key={item.id}
                  to={`/work?category=${encodeURIComponent(item.category?.toLowerCase())}`}
                  style={{
                    display: "block",
                    aspectRatio: "4/3",
                    position: "relative",
                    overflow: "hidden",
                    textDecoration: "none",
                    background: `hsl(${20 + i * 12}, 7%, ${9 + i * 2}%)`,
                  }}
                >
                  {/* Curtain reveal effect */}
                  <motion.div
                    initial={{ x: "0%" }}
                    whileInView={{ x: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: "easeInOut" }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "var(--black)",
                      zIndex: 2,
                    }}
                  />
                {item.url &&
                  (() => {
                    const isVideo = () => {
                      if (item.type === "video") return true;
                      const videoExtensions = [
                        "mp4",
                        "webm",
                        "ogg",
                        "mov",
                        "avi",
                        "mkv",
                      ];
                      const url = item.url.toLowerCase();
                      return videoExtensions.some((ext) =>
                        url.includes(`.${ext}`),
                      );
                    };
                    return isVideo() ? (
                      <video
                        src={item.url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          position: "absolute",
                          inset: 0,
                        }}
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.category}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          position: "absolute",
                          inset: 0,
                        }}
                      />
                    );
                  })()}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(14,12,11,0.85) 0%, transparent 55%)",
                    opacity: 0,
                    transition: "opacity 0.35s ease",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "20px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "22px",
                      letterSpacing: "1px",
                      color: "var(--off-white)",
                    }}
                  >
                    {item.category?.toUpperCase()}
                  </span>
                </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ============ FOOTER CTA ============ */}
        <section
          ref={addReveal}
          className="reveal section-light"
          style={{
            padding: "clamp(80px, 12vw, 160px) clamp(24px, 8vw, 120px)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "rgba(14,12,11,0.35)",
              marginBottom: "20px",
            }}
          >
            Let's work together
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(48px, 7vw, 96px)",
              lineHeight: 0.8,
              color: "var(--black)",
              marginBottom: "36px",
            }}
          >
            MAKE SOMETHING
            <br />
            <span
              className="font-serif"
              style={{ fontStyle: "italic", lineHeight: 0.5 }}
            >
              unforgettable.
            </span>
          </h2>
          <MagneticButton to="/contact">
            Start a Project
          </MagneticButton>
        </section>
      </main>
    </>
  );
}
