import { motion } from "framer-motion";

export function SkeletonCard({ aspectRatio = "1/1" }) {
  return (
    <motion.div
      className="bg-[var(--gray-dark)] relative overflow-hidden"
      style={{ aspectRatio }}
      animate={{
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--gray-mid)] to-transparent"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}

export function SkeletonGrid({ count = 8, columns = 4 }) {
  return (
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonText({ width = "100%", height = "20px" }) {
  return (
    <motion.div
      className="bg-[var(--gray-dark)] rounded"
      style={{ width, height }}
      animate={{
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
