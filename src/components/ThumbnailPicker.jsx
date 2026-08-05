import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { supabase } from "../lib/supabase";
import { isVideo } from "../lib/isVideo";

// ─── ThumbnailPicker ──────────────────────────────────────────────────────────
// Props:
//   onSelect({ id, url })  — called when the user confirms a selection
//   onClose()              — dismiss the picker
//   category?: string      — if set, filters the grid to that category only
//   currentUrl?: string    — marks the currently active thumbnail
export default function ThumbnailPicker({ onSelect, onClose, category = null, currentUrl = null }) {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null); // { id, url }

  useEffect(() => {
    async function fetchItems() {
      let query = supabase
        .from("portfolio")
        .select("id, url, category, sort_order")
        .order("sort_order", { ascending: true });

      if (category) query = query.eq("category", category);

      const { data, error } = await query;
      if (!error && data) setItems(data);
      setLoading(false);
    }
    fetchItems();
  }, [category]);

  const confirm = () => {
    if (!selected) return;
    onSelect(selected);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position:        "fixed",
        inset:            0,
        zIndex:           400,
        background:      "rgba(14,12,11,0.6)",
        backdropFilter:   "blur(8px)",
        display:          "flex",
        alignItems:      "center",
        justifyContent:   "center",
        padding:          "clamp(16px, 4vw, 40px)",
      }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0,  opacity: 1 }}
        exit={{ y: 16,    opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background:    "var(--bg)",
          border:         "0.5px solid var(--border)",
          width:          "100%",
          maxWidth:       780,
          maxHeight:      "85vh",
          display:        "flex",
          flexDirection:  "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display:         "flex",
            alignItems:     "center",
            justifyContent:  "space-between",
            padding:         "20px 24px",
            borderBottom:    "0.5px solid var(--border)",
            flexShrink:      0,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily:    "var(--font-display)",
                fontSize:      "clamp(18px, 2.5vw, 24px)",
                letterSpacing: "-0.02em",
                color:          "var(--ink)",
                margin:         0,
                lineHeight:    1,
              }}
            >
              {category ? `${category} — Pick Cover` : "Pick Thumbnail"}
            </h2>
            {selected && (
              <p
                style={{
                  fontFamily:    "var(--font-body)",
                  fontSize:      "10px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color:          "var(--ink-muted)",
                  margin:        "6px 0 0",
                }}
              >
                1 selected
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close picker"
            style={{
              background:     "none",
              border:          "0.5px solid var(--border)",
              cursor:         "pointer",
              color:          "var(--ink-muted)",
              width:           32,
              height:          32,
              display:         "flex",
              alignItems:     "center",
              justifyContent:  "center",
            }}
          >
            <X size={13} strokeWidth={1.5} />
          </button>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {loading ? (
            <div
              style={{
                display:             "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap:                  10,
              }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio:      "3 / 4",
                    background:       "var(--surface)",
                    animationName:    "thumb-pulse",
                    animationDuration: "1.4s",
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    animationDelay:   `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div
              style={{
                textAlign:  "center",
                padding:    "60px 20px",
                fontFamily: "var(--font-body)",
                fontSize:   "13px",
                color:       "var(--ink-muted)",
              }}
            >
              No portfolio items found{category ? ` in "${category}"` : ""}.
            </div>
          ) : (
            <div
              style={{
                display:             "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap:                  10,
              }}
            >
              {items.map((item) => {
                const isSelected = selected?.id === item.id;
                const isCurrent  = !selected && currentUrl === item.url;

                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      setSelected(isSelected ? null : { id: item.id, url: item.url })
                    }
                    style={{
                      position:   "relative",
                      aspectRatio: "3 / 4",
                      padding:     0,
                      border:     isSelected
                        ? "2px solid var(--ink)"
                        : isCurrent
                        ? "1.5px solid rgba(14,12,11,0.35)"
                        : "0.5px solid var(--border)",
                      cursor:     "pointer",
                      overflow:   "hidden",
                      background: "var(--surface)",
                      transition: "border-color 0.15s",
                    }}
                  >
                    {isVideo(item) ? (
                      <video
                        src={item.url}
                        muted
                        playsInline
                        style={{
                          position:  "absolute",
                          inset:      0,
                          width:      "100%",
                          height:     "100%",
                          objectFit:  "cover",
                          display:    "block",
                        }}
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt=""
                        loading="lazy"
                        style={{
                          position:  "absolute",
                          inset:      0,
                          width:      "100%",
                          height:     "100%",
                          objectFit:  "cover",
                          display:    "block",
                        }}
                      />
                    )}

                    {/* Category badge — shown only when picker is not scoped */}
                    {!category && (
                      <span
                        style={{
                          position:      "absolute",
                          top:            6,
                          left:           6,
                          fontFamily:    "var(--font-body)",
                          fontSize:      "9px",
                          letterSpacing: "1.5px",
                          textTransform: "uppercase",
                          color:          "rgba(255,252,242,0.8)",
                          background:    "rgba(14,12,11,0.55)",
                          padding:        "2px 5px",
                          pointerEvents: "none",
                        }}
                      >
                        {item.category}
                      </span>
                    )}

                    {/* Selected checkmark overlay */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.75 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0,   scale: 0.75 }}
                          transition={{ duration: 0.15 }}
                          style={{
                            position:        "absolute",
                            inset:            0,
                            background:      "rgba(14,12,11,0.35)",
                            display:          "flex",
                            alignItems:      "center",
                            justifyContent:   "center",
                          }}
                        >
                          <div
                            style={{
                              width:           28,
                              height:          28,
                              background:     "var(--ink)",
                              display:         "flex",
                              alignItems:     "center",
                              justifyContent:  "center",
                            }}
                          >
                            <Check size={14} color="var(--off-white)" strokeWidth={2} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Current indicator */}
                    {isCurrent && (
                      <div
                        style={{
                          position:      "absolute",
                          bottom:         6,
                          right:          6,
                          fontFamily:    "var(--font-body)",
                          fontSize:      "9px",
                          letterSpacing: "1.5px",
                          textTransform: "uppercase",
                          color:          "rgba(255,252,242,0.7)",
                          background:    "rgba(14,12,11,0.5)",
                          padding:        "2px 5px",
                        }}
                      >
                        Current
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display:         "flex",
            alignItems:     "center",
            justifyContent:  "space-between",
            padding:         "16px 24px",
            borderTop:       "0.5px solid var(--border)",
            flexShrink:      0,
          }}
        >
          <span
            style={{
              fontFamily:    "var(--font-body)",
              fontSize:      "10px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color:          "var(--ink-muted)",
            }}
          >
            {items.length} photo{items.length !== 1 ? "s" : ""}
          </span>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                padding:       "9px 18px",
                background:    "transparent",
                color:          "var(--ink-muted)",
                border:         "0.5px solid rgba(14,12,11,0.2)",
                fontFamily:    "var(--font-body)",
                fontSize:      "9px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                cursor:        "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={confirm}
              disabled={!selected}
              style={{
                padding:       "9px 22px",
                background:    selected ? "var(--ink)" : "rgba(14,12,11,0.15)",
                color:         selected ? "var(--off-white)" : "var(--ink-muted)",
                border:        "none",
                fontFamily:    "var(--font-body)",
                fontSize:      "9px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                cursor:        selected ? "pointer" : "not-allowed",
                transition:    "background 0.2s, color 0.2s",
              }}
            >
              Set Thumbnail
            </button>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes thumb-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </motion.div>
  );
}
