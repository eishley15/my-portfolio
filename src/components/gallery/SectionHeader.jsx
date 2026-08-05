export default function SectionHeader({ scene, variant = "dot", textColor = "#3d2b2b" }) {
  if (variant === "banner" && scene.banner_image_url) {
    return (
      <div style={{ position: "relative", width: "100%", height: "clamp(200px,30vw,420px)", overflow: "hidden" }}>
        <img src={scene.banner_image_url} alt={scene.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)" }} />
        <div style={{ position: "absolute", bottom: 28, left: 36 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,5vw,64px)", fontWeight: 900, textTransform: "uppercase", color: "#fff", margin: 0, lineHeight: 1 }}>
            {scene.name}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "underline") {
    return (
      <div style={{ textAlign: "center", padding: "56px 24px 32px" }}>
        <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "clamp(18px,2.2vw,24px)", color: textColor, opacity: 0.65, margin: "0 0 12px" }}>
          {scene.name.toLowerCase()}
        </p>
        <div style={{ width: 280, height: 0.5, background: textColor, opacity: 0.2, margin: "0 auto" }} />
      </div>
    );
  }

  // dot (default + banner fallback)
  return (
    <div style={{ textAlign: "center", padding: "56px 24px 32px" }}>
      <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "clamp(20px,2.5vw,28px)", color: textColor, opacity: 0.6, margin: 0 }}>
        · {scene.name} ·
      </p>
    </div>
  );
}
