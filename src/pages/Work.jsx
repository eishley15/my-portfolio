import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { usePortfolio, useFeaturedPortfolio } from "../hooks/usePortfolio";

// Lazy load image component
function LazyImage({ src, alt, className }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = imgRef.current;
          if (img && img.dataset.src) {
            img.src = img.dataset.src;
            img.onload = () => setIsLoaded(true);
          }
        }
      },
      { rootMargin: "50px" },
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      data-src={src}
      alt={alt}
      className={`${className} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
    />
  );
}

function VideoWithAutoplay({ src, className, poster }) {
  const videoRef = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { rootMargin: "50px" },
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isIntersecting && videoRef.current) {
      videoRef.current.play();
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isIntersecting]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      className={className}
      muted
      loop
      playsInline
    />
  );
}

export default function Work() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch categories and items
  const { items, categories, loading } = usePortfolio(
    selectedCategory?.name?.toLowerCase() || null,
  );
  const { items: featuredItems } = useFeaturedPortfolio(10);

  // Map featured items by category for thumbnails
  const categoryMedia = {};
  featuredItems.forEach((item) => {
    if (!categoryMedia[item.category]) {
      categoryMedia[item.category] = item;
    }
  });

  // Handle ESC key to close preview modal and arrow keys for navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedItem) return;

      if (e.key === "Escape") {
        setSelectedItem(null);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, items]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedItem]);

  const currentItemIndex = selectedItem
    ? items.findIndex((item) => item.id === selectedItem.id)
    : -1;
  const hasNext = currentItemIndex < items.length - 1;
  const hasPrev = currentItemIndex > 0;

  const handleNext = () => {
    if (hasNext) setSelectedItem(items[currentItemIndex + 1]);
  };

  const handlePrev = () => {
    if (hasPrev) setSelectedItem(items[currentItemIndex - 1]);
  };

  // Preview Modal Component
  const PreviewModal = () => (
    <AnimatePresence>
      {selectedItem && (
        <>
          {/* Backdrop - clickable to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 bg-black/95 z-[200] cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            {/* Close button - top right corner */}
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 p-2 text-white/60 hover:text-white transition-colors z-[203]"
              aria-label="Close preview"
            >
              <X size={32} strokeWidth={1.5} />
            </button>

            {/* Previous button - left side */}
            {hasPrev && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white transition-colors z-[203] hover:bg-white/10 rounded-full"
                aria-label="Previous"
              >
                <ChevronLeft size={40} strokeWidth={1.5} />
              </button>
            )}

            {/* Next button - right side */}
            {hasNext && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-white/60 hover:text-white transition-colors z-[203] hover:bg-white/10 rounded-full"
                aria-label="Next"
              >
                <ChevronRight size={40} strokeWidth={1.5} />
              </button>
            )}

            {/* Media content - click stops propagation so clicking image doesn't close modal */}
            <div
              className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                // Detect if item is video by checking file extension
                const isVideo = () => {
                  if (selectedItem.type === "video") return true; // If explicitly set
                  if (!selectedItem.url) return false;
                  const videoExtensions = [
                    "mp4",
                    "webm",
                    "ogg",
                    "mov",
                    "avi",
                    "mkv",
                  ];
                  const url = selectedItem.url.toLowerCase();
                  return videoExtensions.some((ext) => url.includes(`.${ext}`));
                };

                return isVideo() ? (
                  <video
                    src={selectedItem.url}
                    controls
                    autoPlay
                    className="max-w-full max-h-[90vh] object-contain"
                  />
                ) : (
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    className="max-w-full max-h-[90vh] object-contain"
                  />
                );
              })()}
            </div>

            {/* Counter - bottom center */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm z-[203]">
              {currentItemIndex + 1} / {items.length}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (selectedCategory) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-[var(--off-white)] text-[var(--black)] pt-24 pb-20 px-6"
        >
          <div className="max-w-[1800px] mx-auto">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 font-display text-2xl mb-12 hover:text-[var(--red)] transition-colors"
            >
              <ArrowLeft size={24} />
              {selectedCategory.name.toUpperCase()}
            </motion.button>

            {loading ? (
              <div className="text-center py-20 text-[var(--gray-light)]">
                Loading...
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20 text-[var(--gray-light)]">
                No items in this category yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedItem(item)}
                    className="aspect-square relative overflow-hidden bg-[var(--gray-dark)] cursor-pointer group"
                  >
                    {(() => {
                      // Detect if item is video by checking file extension
                      const isVideo = () => {
                        if (item.type === "video") return true; // If explicitly set
                        if (!item.url) return false;
                        const videoExtensions = [
                          "mp4",
                          "webm",
                          "ogg",
                          "mov",
                          "avi",
                          "mkv",
                        ];
                        const url = item.url.toLowerCase();
                        return videoExtensions.some((ext) =>
                          url.includes(`.${ext}`),
                        );
                      };

                      return isVideo() ? (
                        <VideoWithAutoplay
                          src={item.url}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <LazyImage
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      );
                    })()}

                    {(() => {
                      const isVideo = () => {
                        if (item.type === "video") return true;
                        if (!item.url) return false;
                        const videoExtensions = [
                          "mp4",
                          "webm",
                          "ogg",
                          "mov",
                          "avi",
                          "mkv",
                        ];
                        const url = item.url.toLowerCase();
                        return videoExtensions.some((ext) =>
                          url.includes(`.${ext}`),
                        );
                      };

                      return (
                        isVideo() && (
                          <div className="absolute top-4 left-4 flex items-center gap-2 text-[var(--red)] text-[10px] tracking-[2px] z-10">
                            <span className="w-2 h-2 bg-[var(--red)] rounded-full animate-pulse" />
                            VIDEO
                          </div>
                        )
                      );
                    })()}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                        <div className="text-sm font-display">{item.title}</div>
                        <div className="text-[10px] tracking-[2px] uppercase mt-1">
                          {item.category}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
        <PreviewModal />
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[var(--off-white)] text-[var(--black)] pt-24 pb-20 px-6"
    >
      <div className="max-w-[1800px] mx-auto">
        <div className="flex justify-between items-end mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-[clamp(64px,10vw,120px)] leading-[0.88]"
          >
            WORK
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="hidden md:block text-[var(--gray-light)] text-sm"
          >
            Selected Projects
          </motion.p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[var(--gray-light)]">
            Loading categories...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[2px]">
            {categories.map((category, i) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedCategory(category)}
                className="aspect-[4/3] bg-[var(--gray-dark)] relative cursor-pointer overflow-hidden group"
              >
                {/* Thumbnail background */}
                {categoryMedia[category.name] ? (
                  (() => {
                    const item = categoryMedia[category.name];
                    // Detect if item is video by checking file extension
                    const isVideo = () => {
                      if (item.type === "video") return true;
                      if (!item.url) return false;
                      const videoExtensions = [
                        "mp4",
                        "webm",
                        "ogg",
                        "mov",
                        "avi",
                        "mkv",
                      ];
                      const url = item.url.toLowerCase();
                      return videoExtensions.some((ext) =>
                        url.includes(`.${ext}`),
                      );
                    };

                    return isVideo() ? (
                      <VideoWithAutoplay
                        src={item.url}
                        className="w-full h-full object-cover absolute inset-0 group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={category.name}
                        className="w-full h-full object-cover absolute inset-0 group-hover:scale-110 transition-transform duration-300"
                      />
                    );
                  })()
                ) : category.thumbnail ? (
                  <img
                    src={category.thumbnail}
                    alt={category.name}
                    className="w-full h-full object-cover absolute inset-0 group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="font-display text-[var(--off-white)] text-4xl tracking-wider">
                      {category.name.toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 group-hover:from-black/20 group-hover:via-black/40 transition-colors duration-300" />

                <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center z-10">
                  <div className="text-[10px] tracking-[2px] text-[var(--off-white)] uppercase">
                    {category.name}
                  </div>
                  <div className="text-[10px] text-[var(--gray-light)]">
                    {category.count} projects
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--red)] transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <PreviewModal />
    </motion.div>
  );
}
