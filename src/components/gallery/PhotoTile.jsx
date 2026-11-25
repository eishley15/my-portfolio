import { memo, useCallback, useState } from "react";
import { Heart, Check, Download, Loader2 } from "lucide-react";
import { downloadGalleryFile } from "../../lib/galleryDownload";
import { useGallerySession } from "../../lib/gallerySession";

// Height/width used to reserve space when a photo has no stored dimensions yet
const FALLBACK_RATIO = 4 / 5;

function PhotoTile({
  file, index, isFavorited, isSelected, selectMode, downloadsEnabled, favoritesEnabled = true,
  onFavoriteToggle, onSelect, onOpen, accessCode, onError, placeholder,
}) {
  const [loaded,       setLoaded]       = useState(false);
  const [errored,      setErrored]      = useState(false);
  const [naturalRatio, setNaturalRatio] = useState(null);
  const [downloading,  setDownloading]  = useState(false);
  const { runDownload } = useGallerySession();

  // Stored dimensions reserve the exact box before the image arrives → no layout jumps
  const knownRatio = file.width && file.height ? file.width / file.height : null;
  const ratio = knownRatio ?? naturalRatio ?? FALLBACK_RATIO;

  const markLoaded = useCallback((img) => {
    setLoaded(true);
    if (!knownRatio && img.naturalWidth && img.naturalHeight) {
      setNaturalRatio(img.naturalWidth / img.naturalHeight);
    }
  }, [knownRatio]);

  // Cached images can finish before React attaches onLoad
  const imgRef = useCallback((img) => {
    if (img?.complete && img.naturalWidth > 0) markLoaded(img);
  }, [markLoaded]);

  function activate() {
    if (selectMode) onSelect(file.id);
    else onOpen(file);
  }

  async function handleDownload(e) {
    e.stopPropagation();
    if (downloading || !file.filename) return;
    setDownloading(true);
    try {
      await runDownload(() => downloadGalleryFile({ accessCode, filename: file.filename }));
    } catch {
      onError?.("Could not download photo. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  const label = `photo ${index + 1}`;

  return (
    <div
      className="g-tile"
      data-file-id={file.id}
      data-selected={isSelected ? "true" : undefined}
      data-select-mode={selectMode ? "true" : undefined}
      role="button"
      tabIndex={0}
      aria-label={selectMode ? `${isSelected ? "Deselect" : "Select"} ${label}` : `View ${label}`}
      aria-pressed={selectMode ? Boolean(isSelected) : undefined}
      style={{ aspectRatio: ratio, background: placeholder }}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
      }}
    >
      {errored ? (
        <span className="g-tile-error">Photo unavailable</span>
      ) : (
        <img
          ref={imgRef}
          src={file.url}
          alt={file.filename || `Photo ${index + 1}`}
          width={file.width || undefined}
          height={file.height || undefined}
          loading="lazy"
          decoding="async"
          draggable={false}
          data-loaded={loaded ? "true" : "false"}
          onLoad={(e) => markLoaded(e.currentTarget)}
          onError={() => setErrored(true)}
        />
      )}

      {!selectMode && (
        <>
          {favoritesEnabled && (
          <button
            type="button"
            className="g-tile-btn g-tile-heart"
            data-on={isFavorited ? "true" : undefined}
            onClick={(e) => { e.stopPropagation(); onFavoriteToggle(file.id); }}
            aria-label={isFavorited ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
            aria-pressed={Boolean(isFavorited)}
          >
            <Heart size={16} fill={isFavorited ? "white" : "none"} stroke={isFavorited ? "white" : "#222"} strokeWidth={1.5} />
          </button>
          )}

          {downloadsEnabled && (
            <div className="g-tile-tools">
              <button type="button" className="g-tile-btn" onClick={handleDownload} disabled={downloading} aria-label={`Download ${label}`}>
                {downloading
                  ? <Loader2 size={15} stroke="#222" strokeWidth={1.5} style={{ animation: "spin 1s linear infinite" }} />
                  : <Download size={15} stroke="#222" strokeWidth={1.5} />}
              </button>
              <button
                type="button"
                className="g-tile-btn"
                data-on={isSelected ? "true" : undefined}
                onClick={(e) => { e.stopPropagation(); onSelect(file.id); }}
                aria-label={isSelected ? `Deselect ${label}` : `Select ${label}`}
                aria-pressed={Boolean(isSelected)}
              >
                <Check size={16} stroke={isSelected ? "white" : "#222"} strokeWidth={2} />
              </button>
            </div>
          )}
        </>
      )}

      {(selectMode || isSelected) && (
        <span className="g-tile-check" aria-hidden="true">
          {isSelected && <Check size={14} stroke="white" strokeWidth={2.5} />}
        </span>
      )}
    </div>
  );
}

export default memo(PhotoTile);
