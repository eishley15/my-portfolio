import { useScrollSpy } from "../../hooks/useScrollSpy";

export default function SectionTabs({ scenes, bgColor = "#faf9f7", textColor = "#3d2b2b" }) {
  const ids      = ["highlights", ...scenes.map((s) => s.slug)];
  const activeId = useScrollSpy(ids, 80);

  if (scenes.length === 0) return null;

  const tabs = [
    { id: "highlights", label: "Highlights" },
    ...scenes.map((s) => ({ id: s.slug, label: s.name })),
  ];

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  }

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 50, background: `${bgColor}eb`, backdropFilter: "blur(18px)", borderBottom: `0.5px solid ${textColor}18` }}>
      <div style={{ display: "flex", overflowX: "auto", justifyContent: "center", scrollbarWidth: "none", padding: "0 24px" }}>
        {tabs.map(({ id, label }) => {
          const active = activeId === id;
          return (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{
                fontFamily:  "var(--font-body)", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase",
                color:       textColor, opacity: active ? 1 : 0.4, background: "none", border: "none",
                borderBottom: active ? `1px solid ${textColor}` : "1px solid transparent",
                padding:     "18px 20px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                transition:  "all 0.2s ease",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
