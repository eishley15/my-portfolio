// Height of everything pinned above a gallery section: GalleryNav + sticky tab header
export function stickyHeaderOffset() {
  const navH   = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gnav-h")) || 84;
  const header = document.querySelector(".g-sticky");
  return navH + (header?.offsetHeight || 0);
}
