import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * ScrollReveal — fades + slides children in when they enter the viewport.
 * Wrap any element or pass `text` for word-by-word stagger.
 *
 * Usage (element):
 *   <ScrollReveal delay={0.1}><h2>Title</h2></ScrollReveal>
 *
 * Usage (word stagger):
 *   <ScrollReveal text="Hello world" as="h2" className="..." style={{...}} />
 */
export default function ScrollReveal({
  children,
  text,
  as: Tag = "p",
  className = "",
  style = {},
  delay = 0,
  stagger = 0.04,
  threshold = 0.12,
  y = 22,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  // Word-by-word mode
  if (text) {
    const words = text.split(" ");
    return (
      <Tag ref={ref} className={className} style={style}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y, filter: "blur(3px)" }}
            animate={
              visible
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : {}
            }
            transition={{
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1],
              delay: delay + i * stagger,
            }}
            style={{ display: "inline-block", marginRight: "0.28em" }}
          >
            {word}
          </motion.span>
        ))}
      </Tag>
    );
  }

  // Element wrapper mode
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
