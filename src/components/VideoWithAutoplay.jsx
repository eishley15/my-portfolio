import { useState, useEffect, useRef } from "react";

export default function VideoWithAutoplay({ src, className, poster }) {
  const videoRef = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { rootMargin: "50px" },
    );
    const currentVideoRef = videoRef.current;
    if (currentVideoRef) observer.observe(currentVideoRef);
    return () => {
      if (currentVideoRef) observer.unobserve(currentVideoRef);
    };
  }, []);

  useEffect(() => {
    if (isIntersecting && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isIntersecting]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
    />
  );
}
