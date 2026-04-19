"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function MatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[EsportsMatchError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0A0A0C] px-6 text-center">
      <div
        className="flex size-20 items-center justify-center border border-[#FF4655]/30 bg-[#0D0D10]"
        style={{
          clipPath: "polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)",
        }}
      >
        <span className="font-display text-3xl font-black text-[#FF4655]">!</span>
      </div>
      <div>
        <p className="font-display text-2xl font-black text-white">Couldn’t load match</p>
        <p className="mt-2 max-w-sm font-mono-display text-xs tracking-[0.1em] text-white/50">
          The VLR service may be busy. Try again in a moment.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 border border-[#FF4655]/40 bg-[#FF4655]/10 px-5 py-2.5 font-mono-display text-[11px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#FF4655]/20"
        >
          <RefreshCw className="size-4" aria-hidden />
          Retry
        </button>
        <Link
          href="/esports"
          className="border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 font-mono-display text-[11px] uppercase tracking-[0.2em] text-white/80 hover:bg-white/[0.06]"
        >
          Esports hub
        </Link>
      </div>
    </div>
  );
}
