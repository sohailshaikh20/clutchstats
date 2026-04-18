"use client";

import { motion, useReducedMotion } from "framer-motion";

export const TIER_COLORS: Record<string, { primary: string; glow: string }> = {
  Iron: { primary: "#4A4A52", glow: "rgba(74,74,82,0.3)" },
  Bronze: { primary: "#A06A3B", glow: "rgba(160,106,59,0.3)" },
  Silver: { primary: "#B8C5C9", glow: "rgba(184,197,201,0.3)" },
  Gold: { primary: "#E4C65C", glow: "rgba(228,198,92,0.4)" },
  Platinum: { primary: "#3A9DB8", glow: "rgba(58,157,184,0.4)" },
  Diamond: { primary: "#C583D6", glow: "rgba(197,131,214,0.4)" },
  Ascendant: { primary: "#2FB57A", glow: "rgba(47,181,122,0.4)" },
  Immortal: { primary: "#A42E4A", glow: "rgba(164,46,74,0.4)" },
  Radiant: { primary: "#FFF6A1", glow: "rgba(255,246,161,0.6)" },
};

const DEFAULT_TIER = { primary: "#8A8A95", glow: "rgba(138,138,149,0.35)" };

export function tierKeyFromPatched(patched: string): string {
  const raw = patched.trim().split(/\s+/)[0] ?? "";
  if (!raw) return "Iron";
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

export function lookupTierColors(patched: string) {
  const key = tierKeyFromPatched(patched);
  return TIER_COLORS[key] ?? DEFAULT_TIER;
}

const clip =
  "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)";

type RankBoxProps = {
  label: string;
  tierName: string;
  rr?: number;
  showRr?: boolean;
  patched: string;
  size?: "current" | "peak";
};

function RankBox({ label, tierName, rr, showRr, patched, size = "current" }: RankBoxProps) {
  const reduced = Boolean(useReducedMotion());
  const { primary, glow } = lookupTierColors(patched);
  const titleSize = size === "current" ? "text-lg" : "text-sm";

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-w-[140px] flex-1 px-4 py-3 sm:min-w-[160px]"
      style={{
        clipPath: clip,
        background: "rgba(19,19,26,0.72)",
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 24px ${glow}`,
        backdropFilter: "blur(10px)",
      }}
    >
      <p className="font-mono-display text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">
        {label}
      </p>
      <p
        className={`font-display ${titleSize} font-black uppercase leading-tight text-white`}
        style={{ textShadow: `0 0 18px ${glow}, 0 0 2px ${primary}` }}
      >
        {tierName}
      </p>
      {showRr && rr != null ? (
        <p className="mt-1 flex items-baseline gap-1">
          <span className="font-mono-display text-2xl font-bold tabular-nums text-white">{rr}</span>
          <span className="font-mono-display text-[10px] font-bold uppercase tracking-widest text-white/50">
            RR
          </span>
        </p>
      ) : null}
    </motion.div>
  );
}

export function RankBadge({
  currentTierPatched,
  currentRR,
  currentRRDelta,
  peakTierPatched,
  peakRR,
  peakEpisode,
  leaderboardRank,
}: {
  currentTierPatched: string;
  currentRR: number;
  currentRRDelta?: number;
  peakTierPatched: string;
  peakRR?: number;
  peakEpisode?: string;
  leaderboardRank?: number;
}) {
  const currentWord = tierKeyFromPatched(currentTierPatched);
  const peakWord = tierKeyFromPatched(peakTierPatched);

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <div className="flex gap-2 sm:gap-3">
        <RankBox
          label="Current"
          tierName={currentWord.toUpperCase()}
          rr={currentRR}
          showRr
          patched={currentTierPatched}
          size="current"
        />
        <RankBox
          label="Peak"
          tierName={peakWord.toUpperCase()}
          rr={peakRR}
          showRr={peakRR != null}
          patched={peakTierPatched}
          size="peak"
        />
      </div>
      {currentRRDelta != null && currentRRDelta !== 0 ? (
        <p
          className={`text-center font-mono-display text-xs font-bold tabular-nums ${
            currentRRDelta > 0 ? "text-[#00E5D1]" : "text-accent-red"
          }`}
        >
          {currentRRDelta > 0 ? "+" : ""}
          {currentRRDelta} last game
        </p>
      ) : null}
      {leaderboardRank != null ? (
        <p className="text-center font-mono-display text-[10px] uppercase tracking-widest text-white/50">
          <span className="text-accent-red">#</span>
          <span className="font-bold text-white">{leaderboardRank}</span> leaderboard
        </p>
      ) : null}
      {peakEpisode ? (
        <p className="text-center font-mono-display text-[9px] text-white/35">{peakEpisode}</p>
      ) : null}
    </div>
  );
}
