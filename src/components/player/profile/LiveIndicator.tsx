"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Pulsing red "LIVE ON TWITCH" pill for profile header. */
export function LiveIndicator() {
  const reduced = Boolean(useReducedMotion());

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 rounded-sm border border-accent-red/50 bg-accent-red/15 px-3 py-1.5"
      style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
    >
      <motion.span
        className="size-2 rounded-full bg-accent-red"
        animate={reduced ? { opacity: 1 } : { opacity: [1, 0.4, 1] }}
        transition={reduced ? { duration: 0 } : { duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <span className="font-mono-display text-[10px] font-bold uppercase tracking-[0.2em] text-accent-red">
        Live on Twitch
      </span>
    </motion.div>
  );
}
