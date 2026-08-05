import SplitHero     from "./heroes/SplitHero";
import CollageHero   from "./heroes/CollageHero";
import CircleHero    from "./heroes/CircleHero";
import VideoHero     from "./heroes/VideoHero";
import OverlayHero   from "./heroes/OverlayHero";
import MarqueeHero   from "./heroes/MarqueeHero";
import EditorialHero from "./heroes/EditorialHero";
import DiptychHero   from "./heroes/DiptychHero";

export default function GalleryHero({ config, onScrollToGallery }) {
  if (!config) return null;
  const props = { config, onScrollToGallery };

  switch (config.cover_style) {
    case "collage":   return <CollageHero   {...props} />;
    case "circle":    return <CircleHero    {...props} />;
    case "video":     return <VideoHero     {...props} />;
    case "overlay":   return <OverlayHero   {...props} />;
    case "marquee":   return <MarqueeHero   {...props} />;
    case "editorial": return <EditorialHero {...props} />;
    case "diptych":   return <DiptychHero   {...props} />;
    default:          return <SplitHero     {...props} />;
  }
}
