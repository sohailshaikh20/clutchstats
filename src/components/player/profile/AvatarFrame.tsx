"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const AVATAR_CLIP =
  "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)";

export interface AvatarFrameProps {
  imageUrl?: string;
  initial?: string;
  alt: string;
  isOnline?: boolean;
}

export function AvatarFrame({ imageUrl, initial, alt, isOnline }: AvatarFrameProps) {
  const reduced = Boolean(useReducedMotion());
  const letter = (initial?.trim().charAt(0) || "?").toUpperCase();

  return (
    <div className="relative p-0.5" style={{ background: "#13131A", clipPath: AVATAR_CLIP }}>
      <div
        className="relative flex size-28 items-center justify-center overflow-hidden sm:size-[112px]"
        style={{ clipPath: AVATAR_CLIP, background: "#0a0a0c" }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={alt}
            fill
            sizes="112px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="font-display text-[28px] font-black text-[#FF4655] sm:text-[32px]">{letter}</span>
        )}
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
  );
}
