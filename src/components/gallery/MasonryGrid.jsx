import { useMemo } from "react";
import PhotoTile from "./PhotoTile";

const FALLBACK_HEIGHT = 5 / 4; // height ÷ width when dimensions are unknown

// Masonry laid out in JS instead of CSS `column-count`:
//   • each photo goes into the currently shortest column, using its stored
//     dimensions, so placement is decided once and tiles never hop between
//     columns while images stream in
//   • reading order runs left → right, matching the lightbox order
export default function MasonryGrid({
  files, columns = 2, gap = 4,
  favorites, selectedSet, selectMode = false, downloadsEnabled = true, favoritesEnabled = true,
  onFavoriteToggle, onSelect, onOpen, accessCode, onError, placeholder,
}) {
  const layout = useMemo(() => {
    const cols = Array.from({ length: Math.max(1, columns) }, () => ({ height: 0, items: [] }));
    files.forEach((file, index) => {
      const h = file.width && file.height ? file.height / file.width : FALLBACK_HEIGHT;
      let shortest = cols[0];
      for (const col of cols) if (col.height < shortest.height) shortest = col;
      shortest.items.push({ file, index });
      shortest.height += h;
    });
    return cols;
  }, [files, columns]);

  return (
    <div className="g-masonry" style={{ display: "flex", alignItems: "flex-start", gap }}>
      {layout.map((col, c) => (
        <div key={c} style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap }}>
          {col.items.map(({ file, index }) => (
            <PhotoTile
              key={file.id}
              file={file}
              index={index}
              isFavorited={favorites?.has(file.id)}
              isSelected={selectedSet?.has(file.id)}
              selectMode={selectMode}
              downloadsEnabled={downloadsEnabled}
              favoritesEnabled={favoritesEnabled}
              onFavoriteToggle={onFavoriteToggle}
              onSelect={onSelect}
              onOpen={onOpen}
              accessCode={accessCode}
              onError={onError}
              placeholder={placeholder}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
