const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];

export function isVideo(item) {
  if (item.type === "video") return true;
  if (!item.url) return false;
  const url = item.url.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => url.includes(ext));
}
