"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageFadeIn({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = Boolean(useReducedMotion());

  return (
    <motion.div
      key={pathname}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduced ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
      className="min-w-0"
    >
      {children}
    </motion.div>
  );
}
