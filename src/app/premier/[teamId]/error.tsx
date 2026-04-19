"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function errorMessage(err: Error): { title: string; detail: string } {
  const msg = err.message ?? "";
  if (msg.includes("rate_limited") || msg.includes("Rate limited")) {
    return {
      title: "Rate limited",
      detail: "Too many requests. Wait a moment and try again.",
    };
  }
  if (msg.includes("riot_down") || msg.includes("Server error")) {
    return {
      title: "Riot services unavailable",
      detail: "The Premier data source is temporarily down. Try again shortly.",
    };
  }
  if (msg.includes("forbidden") || msg.includes("API key")) {
    return {
      title: "Configuration error",
      detail: "API key is missing or invalid. Please contact support.",
    };
  }
  return {
    title: "Something went wrong",
    detail: "Failed to load Premier team data. Please try again.",
  };
}

export default function PremierTeamError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[PremierTeamError]", error);
  }, [error]);

  const { title, detail } = errorMessage(error);

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div
        className="size-20 flex items-center justify-center bg-[#0D0D10] border border-[#FF4655]/30"
        style={{ clipPath: "polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)" }}
      >
        <span className="font-display font-black text-3xl text-[#FF4655]">!</span>
      </div>
      <div>
        <p className="font-display font-black text-2xl text-white">{title}</p>
        <p className="mt-2 font-mono-display text-xs tracking-[0.1em] text-white/50 max-w-xs">
          {detail}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-2 bg-[#FF4655] px-4 py-2 font-mono-display text-[11px] font-bold uppercase tracking-[0.15em] text-white hover:brightness-110 transition-[filter]"
        >
          <RefreshCw className="size-3" aria-hidden />
          Try again
        </button>
        <Link
          href="/premier"
          className="flex items-center gap-2 font-mono-display text-[11px] font-bold uppercase tracking-[0.15em] text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-3" aria-hidden />
          Premier
        </Link>
      </div>
    </div>
  );
}
