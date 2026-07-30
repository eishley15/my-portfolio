import { useState, useEffect, useRef } from "react";

export default function LazyImage({ src, alt, className, style, onLoad }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = imgRef.current;
          if (img && img.dataset.src) {
            img.src = img.dataset.src;
            img.onload = () => {
              setIsLoaded(true);
              if (onLoad) {
                const isLandscape = img.naturalWidth > img.naturalHeight;
                const isPortrait = img.naturalHeight > img.naturalWidth;
                onLoad({ isLandscape, isPortrait, isSquare: !isLandscape && !isPortrait });
              }
            };
            img.onerror = () => {
              setError(true);
              setIsLoaded(true);
            };
          }
        }
      },
      { rootMargin: "50px" },
    );
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src, onLoad]);

  return (
    <>
      <img
        ref={imgRef}
        data-src={src}
        alt={alt}
        className={`${className || ""} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        style={style}
      />
      {error && (
        <div className="absolute inset-0 bg-[var(--gray-dark)] flex items-center justify-center text-xs text-[var(--gray-light)]">
          Image unavailable
        </div>
      )}
    </>
  );
}
