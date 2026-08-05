import { useState } from "react";
import { Heart, Check, Download, Loader2 } from "lucide-react";
import LazyImage from "../LazyImage";
import { authHeaders } from "../../lib/galleryAuth";

export default function PhotoTile({ file, index, isFavorited, onFavoriteToggle, isSelected, onSelect, onOpen, accessCode, onError }) {
  const [hovered,     setHovered]     = useState(false);
  const [downloading, setDownloading] = useState(false);
  const isTouch   = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;
  const showIcons = hovered || isTouch;

  async function handleDownload(e) {
    e.stopPropagation();
    if (downloading || !file.filename) return;
    setDownloading(true);
    try {
      const res = await fetch(
        `/api/download?accessCode=${encodeURIComponent(accessCode)}&galleryId=${encodeURIComponent(accessCode)}&fileName=${encodeURIComponent(file.filename)}`,
        { headers: authHeaders() },
      );
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      const a = document.createElement("a");
      a.href = url; a.download = file.filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch {
      onError?.("Could not download photo. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  const circleBtn = (active) => ({
    width: 36, height: 36, borderRadius: "50%",
    background: active ? "rgba(30,30,30,0.9)" : "rgba(255,255,255,0.85)",
    border: "none", display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", backdropFilter: "blur(4px)", transition: "all 0.15s ease",
  });

  return (
    <div
      style={{ breakInside: "avoid", marginBottom: "var(--g-gap, 4px)", position: "relative", cursor: "pointer" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(file, index)}
    >
      <LazyImage
        src={file.url}
        alt={file.filename || `Photo ${index + 1}`}
        loading={index < 6 ? "eager" : "lazy"}
        style={{ width: "100%", height: "auto", display: "block" }}
        onLoad={() => {}}
      />

      {/* Hover icon row */}
      <div
        style={{
          position: "absolute", bottom: 8, left: 8, right: 8,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          opacity: showIcons ? 1 : 0, transition: "opacity 0.2s ease",
          pointerEvents: showIcons ? "auto" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); onFavoriteToggle(file.id); }}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          style={{ ...circleBtn(false), background: isFavorited ? "rgba(200,50,50,0.9)" : "rgba(255,255,255,0.85)" }}
        >
          <Heart size={16} fill={isFavorited ? "white" : "none"} stroke={isFavorited ? "white" : "#222"} strokeWidth={1.5} />
        </button>

        {/* Right cluster: download + select */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            aria-label="Download photo"
            style={{ ...circleBtn(false), opacity: downloading ? 0.6 : 1 }}
          >
            {downloading
              ? <Loader2 size={15} stroke="#222" strokeWidth={1.5} style={{ animation: "spin 1s linear infinite" }} />
              : <Download size={15} stroke="#222" strokeWidth={1.5} />}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onSelect(file.id); }}
            aria-label={isSelected ? "Deselect" : "Select"}
            style={circleBtn(isSelected)}
          >
            <Check size={16} stroke={isSelected ? "white" : "#222"} strokeWidth={2} />
          </button>
        </div>
      </div>

      {isSelected && (
        <div style={{ position: "absolute", inset: 0, outline: "2px solid rgba(30,30,30,0.8)", outlineOffset: "-2px", pointerEvents: "none" }} />
      )}
    </div>
  );
}
