import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio";

// Lazy load image component
function LazyImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { rootMargin: "50px" },
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      style={{
        opacity: loaded && !error ? 1 : 0.5,
        transition: "opacity 0.3s",
      }}
    />
  );
}

export default function Work() {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const { items, categories, loading } = usePortfolio(
    selectedCategory?.name?.toLowerCase() || null,
  );

  // Get featured items to use as category thumbnails
  const { items: featuredItems } = usePortfolio(null);

  // Map featured items by category (including videos for motion)
  const categoryMedia = {};
  featuredItems.forEach((item) => {
    if (!categoryMedia[item.category]) {
      categoryMedia[item.category] = item;
    }
  });

  // Auto-select category from query parameter
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam && categories.length > 0 && !selectedCategory) {
      const matchingCategory = categories.find(
        (cat) => cat.name.toLowerCase() === categoryParam.toLowerCase(),
      );
      if (matchingCategory) {
        setSelectedCategory(matchingCategory);
      }
    }
  }, [searchParams, categories, selectedCategory]);
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
  const currentItemIndex = selectedItem
    ? items.findIndex((item) => item.id === selectedItem.id)
    : -1;
  const hasNext = currentItemIndex < items.length - 1;
  const hasPrev = currentItemIndex > 0;

  const handleNext = () => {
    if (hasNext) {
      setSelectedItem(items[currentItemIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      setSelectedItem(items[currentItemIndex - 1]);
    }
  };

  // Preview Modal Component
  const PreviewModal = () => (
    <AnimatePresence>
      {selectedItem && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 bg-black/80 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex flex-col">
              {/* Close button */}
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="absolute top-0 right-0 p-4 text-white hover:text-[var(--red)] transition-colors z-50 cursor-pointer hover:bg-black/20 rounded-full"
                aria-label="Close preview"
              >
                <X size={32} />
              </button>

              {/* Main content */}
              <div className="flex-1 flex items-center justify-center overflow-hidden mb-4">
                {selectedItem.type === "video" ? (
                  <video
                    src={selectedItem.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Size info */}
              <div className="text-white text-center text-xs mb-4 text-gray-400">
                {selectedItem.width && selectedItem.height
                  ? `${selectedItem.width}x${selectedItem.height}`
                  : selectedItem.type === "video"
                    ? "Video"
                    : "Image"}
              </div>

              {/* Navigation and info */}
              <div className="flex items-center justify-between gap-4">
                {/* Left arrow */}
                <button
                  onClick={handlePrev}
                  disabled={!hasPrev}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-black hover:bg-[var(--red)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>

                {/* Counter */}
                <div className="text-white text-sm text-center min-w-16">
                  {currentItemIndex + 1} / {items.length}
                </div>

                {/* Right arrow */}
                <button
                  onClick={handleNext}
                  disabled={!hasNext}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-black hover:bg-[var(--red)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Title */}
              <div className="text-white text-center mt-4 text-sm">
                {selectedItem.title || `Item ${currentItemIndex + 1}`}
              </div>
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
                No photos yet.
              </div>
            ) : (
              <div className="masonry-grid">
                {items.map((item, i) => {
                  const patternIndex = i % 7;
                  let colSpan = "col-span-1 row-span-1";
                  if (patternIndex === 0) colSpan = "col-span-2 row-span-2";
                  else if (patternIndex === 2)
                    colSpan = "col-span-2 row-span-1";
                  else if (patternIndex === 5)
                    colSpan = "col-span-2 row-span-1";

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.03 }}
                      onClick={() => setSelectedItem(item)}
                      className={`${colSpan} relative overflow-hidden bg-[var(--gray-dark)] cursor-pointer group`}
                    >
                      {item.type === "video" ? (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <LazyImage
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      )}

                      {item.type === "video" && (
                        <div className="absolute top-4 left-4 flex items-center gap-2 text-[var(--red)] text-[10px] tracking-[2px] z-10">
                          <span className="w-2 h-2 bg-[var(--red)] rounded-full animate-pulse" />
                          VIDEO
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center z-20">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                          <div className="text-sm font-display">
                            Click to view
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
                categoryMedia[category.name].type === "video" ? (
                  <video
                    src={categoryMedia[category.name].url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover absolute inset-0 group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <img
                    src={categoryMedia[category.name].url}
                    alt={category.name}
                    className="w-full h-full object-cover absolute inset-0 group-hover:scale-110 transition-transform duration-300"
                  />
                )
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
              ) : null}

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 group-hover:from-black/20 group-hover:via-black/40 transition-colors duration-300" />

              {/* Text content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="font-display text-[var(--off-white)] text-4xl tracking-wider text-center">
                  {category.name.toUpperCase()}
                </div>
              </div>

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
      </div>
      <PreviewModal />
    </motion.div>
  );
}
