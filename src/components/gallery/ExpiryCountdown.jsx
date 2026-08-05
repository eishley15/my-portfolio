import { useCountdown } from "../../hooks/useCountdown";

export default function ExpiryCountdown({ expiresAt, textColor = "#3d2b2b" }) {
  const remaining = useCountdown(expiresAt);
  if (!remaining) return null;

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {[
        { label: "D", value: remaining.days    },
        { label: "H", value: remaining.hours   },
        { label: "M", value: remaining.minutes },
        { label: "S", value: remaining.seconds },
      ].map(({ label, value }) => (
        <div key={label} style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px,3vw,32px)", color: textColor, lineHeight: 1 }}>
            {String(value).padStart(2, "0")}
          </div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: 2, color: textColor, opacity: 0.4, textTransform: "uppercase" }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
