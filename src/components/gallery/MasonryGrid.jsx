import PhotoTile from "./PhotoTile";

export default function MasonryGrid({ files, columnsCount = 4, gap = 4, favorites, selectedItems, onFavoriteToggle, onSelect, onOpen, accessCode, onError }) {
  return (
    <div
      style={{
        columnCount: `var(--g-columns, ${Math.max(2, Math.min(5, columnsCount))})`,
        columnGap:   `var(--g-gap, ${gap}px)`,
      }}
    >
      {files.map((file, i) => (
        <PhotoTile
          key={file.id}
          file={file}
          index={i}
          isFavorited={favorites?.has(file.id)}
          onFavoriteToggle={onFavoriteToggle}
          isSelected={selectedItems?.includes(file.id)}
          onSelect={onSelect}
          onOpen={onOpen}
          accessCode={accessCode}
          onError={onError}
        />
      ))}
    </div>
  );
}
