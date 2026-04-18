"use client";

import { motion, useReducedMotion } from "framer-motion";

const AVATAR_CLIP =
  "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)";

export function AvatarFrame({
  name,
  level,
  isOnline,
}: {
  name: string;
  level: number;
  isOnline?: boolean;
}) {
  const reduced = Boolean(useReducedMotion());
  const initial = (name.trim().charAt(0) || "?").toUpperCase();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative p-0.5" style={{ background: "#13131A", clipPath: AVATAR_CLIP }}>
        <div
          className="relative flex size-28 items-center justify-center overflow-hidden sm:size-[112px]"
          style={{ clipPath: AVATAR_CLIP, background: "#0a0a0c" }}
        >
          <span className="font-display text-[28px] font-black text-accent-red sm:text-[32px]">
            {initial}
          </span>
          {/* L-corner accents */}
          <span className="pointer-events-none absolute left-0 top-0 size-5 border-l-2 border-t-2 border-accent-red" />
          <span className="pointer-events-none absolute bottom-0 right-0 size-5 border-b-2 border-r-2 border-accent-red" />
          {isOnline ? (
            <span className="absolute bottom-1 right-1 flex size-3.5 items-center justify-center">
              <span className="absolute inline-flex size-full rounded-full bg-[#00E5D1] opacity-40" />
              <motion.span
                className="relative inline-flex size-2.5 rounded-full bg-[#00E5D1] ring-2 ring-[#0a0a0c]"
                animate={reduced ? {} : { scale: [1, 1.25, 1] }}
                transition={reduced ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          ) : null}
        </div>
      </div>
      <div
        className="rounded-sm bg-accent-red px-2 py-0.5 font-mono-display text-[10px] font-bold uppercase tracking-[0.08em] text-white"
        style={{ clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)" }}
      >
        LVL {level.toLocaleString()}
      </div>
    </div>
  );
}
