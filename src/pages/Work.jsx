import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { usePortfolio } from "../hooks/usePortfolio";

// Lazy load image component
function LazyImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
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
      style={{ opacity: loaded ? 1 : 0.5, transition: "opacity 0.3s" }}
    />
  );
}

export default function Work() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { items, categories, loading } = usePortfolio(
    selectedCategory?.name?.toLowerCase() || null,
  );

  if (selectedCategory) {
    return (
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
                else if (patternIndex === 2) colSpan = "col-span-2 row-span-1";
                else if (patternIndex === 5) colSpan = "col-span-2 row-span-1";

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.03 }}
                    className={`${colSpan} relative overflow-hidden bg-[var(--gray-dark)]`}
                  >
                    {item.type === "video" ? (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <LazyImage
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {item.type === "video" && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 text-[var(--red)] text-[10px] tracking-[2px] z-10">
                        <span className="w-2 h-2 bg-[var(--red)] rounded-full animate-pulse" />
                        VIDEO
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
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
              {category.thumbnail && (
                <LazyImage
                  src={category.thumbnail}
                  alt={category.name}
                  className="w-full h-full object-cover absolute inset-0 group-hover:scale-110 transition-transform duration-300"
                />
              )}

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
    </motion.div>
  );
}
