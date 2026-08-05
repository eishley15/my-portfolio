import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { isVideo } from "../lib/isVideo";
import VideoWithAutoplay from "./VideoWithAutoplay";

// ─── StripCard ────────────────────────────────────────────────────────────────

function StripCard({ item, onClick, isDragging, cardWidth }) {
  return (
    <motion.div
      whileHover="hover"
      initial="rest"
      onClick={onClick}
      style={{
        position:    "relative",
        width:       cardWidth,
        aspectRatio: "3 / 4",
        overflow:    "hidden",
        flexShrink:   0,
        cursor:      isDragging ? "grabbing" : "pointer",
        background:  "var(--bg-dim)",
      }}
    >
      {isVideo(item) ? (
        <motion.div
          variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
        >
          <VideoWithAutoplay
            src={item.url}
            poster={item.thumbnail_url || undefined}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </motion.div>
      ) : (
        <motion.img
          variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          src={item.url}
          alt={item.title || item.category}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          draggable={false}
          loading="lazy"
        />
      )}

      {/* Video badge */}
      {isVideo(item) && (
        <div
          style={{
            position:      "absolute",
            top:            12,
            left:           12,
            fontFamily:    "var(--font-body)",
            fontSize:       "9px",
            letterSpacing:  "2px",
            textTransform:  "uppercase",
            color:          "var(--off-white)",
            background:    "rgba(14,12,11,0.62)",
            padding:        "4px 9px",
            zIndex:          3,
          }}
        >
          Video
        </div>
      )}

      {/* Always-on bottom gradient */}
      <div
        style={{
          position:      "absolute",
          inset:          0,
          background:    "linear-gradient(to top, rgba(14,12,11,0.82) 0%, rgba(14,12,11,0.08) 50%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Hover tint */}
      <motion.div
        variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        transition={{ duration: 0.25 }}
        style={{
          position:      "absolute",
          inset:          0,
          background:    "rgba(14,12,11,0.18)",
          pointerEvents: "none",
        }}
      />

      {/* Text block */}
      <div
        style={{
          position: "absolute",
          bottom:    0,
          left:      0,
          right:     0,
          padding:   "clamp(14px, 2vw, 22px)",
        }}
      >
        <p
          style={{
            fontFamily:    "var(--font-body)",
            fontSize:       "9px",
            letterSpacing:  "2.5px",
            textTransform:  "uppercase",
            color:          "rgba(255,252,242,0.55)",
            marginBottom:   6,
          }}
        >
          {item.category}
        </p>

        <div style={{ overflow: "hidden" }}>
          <motion.p
            variants={{
              rest:  { y: "105%", opacity: 0 },
              hover: { y: "0%",   opacity: 1 },
            }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily:    "var(--font-display)",
              fontStyle:     "italic",
              fontWeight:     300,
              fontSize:       "clamp(15px, 1.6vw, 20px)",
              color:          "var(--off-white)",
              letterSpacing:  "-0.01em",
              lineHeight:     1.2,
            }}
          >
            {item.title || item.category}
          </motion.p>
        </div>

        <div style={{ overflow: "hidden", marginTop: 6 }}>
          <motion.p
            variants={{
              rest:  { y: "105%", opacity: 0 },
              hover: { y: "0%",   opacity: 1 },
            }}
            transition={{ duration: 0.38, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily:    "var(--font-body)",
              fontSize:       "9px",
              letterSpacing:  "2px",
              textTransform:  "uppercase",
              color:          "rgba(255,252,242,0.42)",
            }}
          >
            View Gallery →
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── DraggableStrip ──────────────────────────────────────────────────────────

export default function DraggableStrip({
  items,
  onItemClick,
  cardWidth = "clamp(200px, 22vw, 310px)",
  paddingX  = "clamp(24px, 6vw, 80px)",
  gap       = "clamp(8px, 1vw, 14px)",
}) {
  const containerRef = useRef(null);
  const stripRef     = useRef(null);
  const navigate     = useNavigate();

  const [constraints, setConstraints] = useState({ left: 0, right: 0 });
  const [isDragging,  setIsDragging]  = useState(false);

  const measureConstraints = useCallback(() => {
    if (!stripRef.current || !containerRef.current) return;
    const left = Math.min(0, containerRef.current.offsetWidth - stripRef.current.scrollWidth);
    setConstraints({ left, right: 0 });
  }, []);

  useEffect(() => {
    measureConstraints();
    window.addEventListener("resize", measureConstraints, { passive: true });
    return () => window.removeEventListener("resize", measureConstraints);
  }, [items, measureConstraints]);

  const handleItemClick = useCallback((item) => {
    if (isDragging) return;
    if (onItemClick) {
      onItemClick(item);
    } else {
      navigate(`/work?category=${encodeURIComponent(item.category)}`);
    }
  }, [isDragging, onItemClick, navigate]);

  if (!items || items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", overflow: "hidden", cursor: isDragging ? "grabbing" : "grab" }}
    >
      {/* Draggable track */}
      <motion.div
        ref={stripRef}
        drag="x"
        dragConstraints={constraints}
        dragTransition={{ power: 0.18, timeConstant: 300 }}
        dragElastic={0.06}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 60)}
        style={{
          display:       "flex",
          gap,
          paddingLeft:   paddingX,
          paddingRight:  paddingX,
          paddingTop:    "clamp(16px, 2.5vw, 28px)",
          paddingBottom: "clamp(16px, 2.5vw, 28px)",
          width:         "max-content",
          userSelect:    "none",
          cursor:        isDragging ? "grabbing" : "grab",
        }}
      >
        {items.map((item) => (
          <StripCard
            key={item.id}
            item={item}
            onClick={() => handleItemClick(item)}
            isDragging={isDragging}
            cardWidth={cardWidth}
          />
        ))}
      </motion.div>

      {/* Left fade */}
      <div
        style={{
          position:      "absolute",
          top:            0,
          left:           0,
          bottom:         0,
          width:          paddingX,
          background:    "linear-gradient(to right, var(--bg) 30%, transparent 100%)",
          pointerEvents:  "none",
          zIndex:         5,
        }}
      />

      {/* Right fade — wider to hint at more content */}
      <div
        style={{
          position:      "absolute",
          top:            0,
          right:          0,
          bottom:         0,
          width:          "clamp(80px, 12vw, 160px)",
          background:    "linear-gradient(to left, var(--bg) 10%, transparent 100%)",
          pointerEvents:  "none",
          zIndex:         5,
        }}
      />
    </div>
  );
}
