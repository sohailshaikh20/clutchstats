"use client";

import { motion, useReducedMotion } from "framer-motion";
import { formatDelta } from "@/lib/format";

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
  rrDelta?: number | null;
};

function RankBox({ label, tierName, rr, showRr, patched, size = "current", rrDelta }: RankBoxProps) {
  const reduced = Boolean(useReducedMotion());
  const { primary, glow } = lookupTierColors(patched);
  const titleSize = size === "current" ? "text-base" : "text-sm";
  const minW = size === "current" ? "min-w-[110px]" : "min-w-[110px]";

  const hasDelta = typeof rrDelta === "number";
  const deltaLine =
    size === "current" && showRr && rr != null && hasDelta
      ? `${formatDelta(rrDelta, { suffix: " RR" })} · 24h`
      : null;
  const deltaTone = !hasDelta
    ? "text-white/40"
    : rrDelta > 0
      ? "text-[#00E5D1]"
      : rrDelta < 0
        ? "text-accent-red"
        : "text-white/40";

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`relative ${minW} flex-1 px-3 py-2 sm:px-3.5`}
      style={{
        clipPath: clip,
        background: "rgba(19,19,26,0.72)",
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 20px ${glow}`,
        backdropFilter: "blur(10px)",
      }}
    >
      <p className="font-mono-display text-[8px] font-bold uppercase tracking-[0.25em] text-white/40">{label}</p>
      <p
        className={`font-display ${titleSize} font-black uppercase leading-tight text-white`}
        style={{ textShadow: `0 0 14px ${glow}, 0 0 2px ${primary}` }}
      >
        {tierName}
      </p>
      {showRr && rr != null ? (
        <div className="mt-0.5">
          <p className="flex items-baseline gap-1">
            <span className="font-mono-display text-xl font-bold tabular-nums text-white sm:text-2xl">{rr}</span>
            <span className="font-mono-display text-[9px] font-bold uppercase tracking-widest text-white/50">RR</span>
          </p>
          {deltaLine ? (
            <p className={`mt-0.5 font-mono-display text-[10px] font-bold tabular-nums ${deltaTone}`}>{deltaLine}</p>
          ) : null}
        </div>
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
      <div className="flex gap-2 sm:gap-2.5">
        <RankBox
          label="Current"
          tierName={currentWord.toUpperCase()}
          rr={currentRR}
          showRr
          patched={currentTierPatched}
          size="current"
          rrDelta={currentRRDelta}
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
