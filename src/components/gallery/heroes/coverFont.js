/**
 * Resolves a gallery's cover_font setting to actual CSS font-family values.
 *
 * cover_font options (stored in DB via Studio "Cover" tab):
 *   "sans"      → Outfit — modern geometric sans (default)
 *   "serif"     → Fraunces — optical-size serif, italic weight feels script-like
 *   "condensed" → Outfit weight 900 + tight tracking (no extra font needed)
 *   "kiya"      → Kiya Handwrite — casual handwritten script
 *   "montagu"   → Montagu Slab — editorial display serif
 *
 * Returns { fontFamily, fontStyle, fontWeight, letterSpacing }
 * so each hero can spread these onto the h1 style.
 */
export function resolveCoverFont(coverFont) {
  switch (coverFont) {
    case "serif":
      return {
        fontFamily:    "'Fraunces', serif",
        fontStyle:     "italic",
        fontWeight:    300,
        letterSpacing: "-0.01em",
      };
    case "condensed":
      return {
        fontFamily:    "'Outfit', sans-serif",
        fontStyle:     "normal",
        fontWeight:    900,
        letterSpacing: "-0.05em",
      };
    case "kiya":
      return {
        fontFamily:    "'KiyaHandwrite', cursive",
        fontStyle:     "normal",
        fontWeight:    400,
        letterSpacing: "0.01em",
      };
    case "montagu":
      return {
        fontFamily:    "'MontaguSlab', serif",
        fontStyle:     "normal",
        fontWeight:    700,
        letterSpacing: "-0.02em",
      };
    case "sans":
    default:
      return {
        fontFamily:    "'Outfit', sans-serif",
        fontStyle:     "normal",
        fontWeight:    700,
        letterSpacing: "-0.03em",
      };
  }
}
