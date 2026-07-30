import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplay(str) {
  if (!str) return "";
  const d = parseDate(str);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function buildGrid(year, month) {
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function CalendarPicker({
  value = "",
  onChange,
  placeholder = "Select a date",
  error = false,
  className = "",
  style = {},
  minDate,
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = minDate ? new Date(minDate) : today;

  const parsed = parseDate(value);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed ? parsed.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed ? parsed.getMonth() : today.getMonth());
  const [slideDir, setSlideDir] = useState(1);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      const inTrigger = ref.current?.contains(e.target);
      const inDropdown = dropdownRef.current?.contains(e.target);
      if (!inTrigger && !inDropdown) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openCalendar = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }
    setOpen((o) => !o);
  };

  const prevMonth = () => {
    setSlideDir(-1);
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    setSlideDir(1);
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const selectDay = (day) => {
    if (!day) return;
    const picked = new Date(viewYear, viewMonth, day);
    picked.setHours(0, 0, 0, 0);
    if (picked < min) return;
    onChange(toDateStr(picked));
    setOpen(false);
  };

  const isDisabled = (day) => {
    if (!day) return false;
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    return d < min;
  };

  const isSelected = (day) => {
    if (!day || !value) return false;
    return toDateStr(new Date(viewYear, viewMonth, day)) === value;
  };

  const isToday = (day) => {
    if (!day) return false;
    return toDateStr(new Date(viewYear, viewMonth, day)) === toDateStr(today);
  };

  const cells = buildGrid(viewYear, viewMonth);
  const calKey = `${viewYear}-${viewMonth}`;

  return (
    <div ref={ref} style={{ position: "relative", ...style }} className={className}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openCalendar}
        style={{
          width: "100%",
          padding: "16px 20px",
          background: "var(--off-white)",
          border: error ? "2px solid var(--red)" : "1px solid rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: value ? "var(--black)" : "rgba(14,12,11,0.35)",
          textAlign: "left",
          transition: "border-color 0.18s",
        }}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.outline = "2px solid var(--red)";
          e.currentTarget.style.outlineOffset = "0px";
        }}
        onBlur={(e) => (e.currentTarget.style.outline = "none")}
      >
        <span>{value ? formatDisplay(value) : placeholder}</span>
        <Calendar size={15} style={{ opacity: 0.4, flexShrink: 0 }} />
      </button>

      {/* Dropdown — portaled to body to escape overflow:hidden ancestors */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                position: "fixed",
                top: dropdownPos.top,
                left: dropdownPos.left,
                zIndex: 9999,
                width: dropdownPos.width,
              background: "var(--off-white)",
              border: "0.5px solid rgba(0,0,0,0.12)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              minWidth: "280px",
              padding: "16px",
              userSelect: "none",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <button
                type="button"
                onClick={prevMonth}
                style={navBtnStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <ChevronLeft size={14} />
              </button>

              <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--black)", fontWeight: 500 }}>
                {MONTHS[viewMonth]} {viewYear}
              </span>

              <button
                type="button"
                onClick={nextMonth}
                style={navBtnStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Day labels */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "6px" }}>
              {DAYS.map((d) => (
                <div key={d} style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: "9px", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(0,0,0,0.3)", padding: "4px 0" }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <AnimatePresence mode="wait" custom={slideDir}>
              <motion.div
                key={calKey}
                custom={slideDir}
                variants={{
                  enter: (d) => ({ x: d > 0 ? 20 : -20, opacity: 0 }),
                  center: { x: 0, opacity: 1, transition: { duration: 0.2 } },
                  exit: (d) => ({ x: d > 0 ? -20 : 20, opacity: 0, transition: { duration: 0.12 } }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}
              >
                {cells.map((day, i) => {
                  const disabled = isDisabled(day);
                  const selected = isSelected(day);
                  const todayMark = isToday(day);

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectDay(day)}
                      disabled={!day || disabled}
                      style={{
                        height: "34px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-body)",
                        fontSize: "11px",
                        fontWeight: selected ? 600 : 400,
                        border: todayMark && !selected ? "1px solid rgba(139,31,48,0.35)" : "none",
                        borderRadius: "0",
                        background: selected ? "var(--red)" : "transparent",
                        color: selected
                          ? "var(--off-white)"
                          : disabled || !day
                          ? "rgba(0,0,0,0.18)"
                          : "var(--black)",
                        cursor: !day || disabled ? "default" : "pointer",
                        transition: "background 0.14s, color 0.14s",
                      }}
                      onMouseEnter={(e) => {
                        if (!disabled && day && !selected)
                          e.currentTarget.style.background = "rgba(139,31,48,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        if (!selected) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {day || ""}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

const navBtnStyle = {
  width: "28px",
  height: "28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "var(--black)",
  borderRadius: "0",
  transition: "background 0.14s",
};
