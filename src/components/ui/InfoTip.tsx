"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";

export function InfoTip({ children }: { children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full border border-white/[0.12] text-white/45 transition-colors hover:border-white/25 hover:text-white/70"
        aria-label="Info"
      >
        <Info className="size-2.5" strokeWidth={2.5} aria-hidden />
      </button>
      <span
        className="pointer-events-none invisible absolute bottom-[calc(100%+8px)] left-0 z-50 max-w-[240px] whitespace-normal border border-white/[0.15] px-3 py-2 font-mono-display text-[11px] leading-snug text-white/80 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100"
        style={{ background: "#0A0A0C" }}
        role="tooltip"
      >
        {children}
      </span>
    </span>
  );
}
