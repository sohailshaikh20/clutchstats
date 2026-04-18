"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { formatTimeAgo } from "@/lib/utils/time-ago";
import type { Match } from "@/types/profile-match-card";
import { MatchDetailPanel } from "./MatchDetailPanel";

const BORDER: Record<Match["result"], string> = {
  win: "#00E5D1",
  loss: "#FF4655",
  draw: "#FFB547",
};

const SCORE_TONE: Record<Match["result"], string> = {
  win: "text-[#00E5D1]",
  loss: "text-[#FF4655]",
  draw: "text-[#FFB547]",
};

function gameStartFromIso(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? Math.floor(t / 1000) : 0;
}

export function MatchCard({
  match,
  expanded,
  onToggle,
}: {
  match: Match;
  expanded: boolean;
  onToggle: () => void;
}) {
  const reduced = Boolean(useReducedMotion());
  const borderColor = BORDER[match.result];
  const ownScoreClass = SCORE_TONE[match.result];
  const s = match.stats;
  const showFb = (s.firstBloods ?? 0) > 0;
  const timeAgo = formatTimeAgo(gameStartFromIso(match.playedAtISO));

  return (
    <div
      className="relative cursor-pointer overflow-hidden bg-[#0D0D10] transition-colors hover:bg-[#121218]"
      style={{ borderLeftWidth: 4, borderLeftStyle: "solid", borderLeftColor: borderColor }}
    >
      <div
        className="pl-4"
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
      >
        {/* Mobile: two-row layout */}
        <div className="flex flex-col gap-3 py-4 pr-3 md:hidden">
          <div className="flex items-start gap-3">
            <div className="relative size-10 shrink-0 overflow-hidden ring-1 ring-white/10 transition-[filter] hover:brightness-110">
              {match.agent.iconUrl ? (
                <Image
                  src={match.agent.iconUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="size-10 bg-white/10" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-medium leading-tight text-white">{match.map}</p>
              <p className="mt-0.5 font-mono-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                {match.mode}
              </p>
              <p className="mt-0.5 font-mono-display text-[10px] text-white/30">{timeAgo}</p>
            </div>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: reduced ? 0 : 0.25 }}
              className="shrink-0 pt-1 text-white/50"
            >
              <ChevronDown className="size-4" aria-hidden />
            </motion.div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono-display text-xl font-bold tabular-nums leading-none tracking-tight">
                  <span className={ownScoreClass}>{match.score.own}</span>
                  <span className="text-white/40"> : </span>
                  <span className="text-white/70">{match.score.enemy}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono-display text-base font-medium tabular-nums text-white">
                  {s.kills} / {s.deaths} / {s.assists}
                </p>
                <p className="mt-0.5 font-mono-display text-[10px] text-white/50">K/D {s.kd.toFixed(2)}</p>
              </div>
            </div>
            <StatStrip stats={s} showFb={showFb} />
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden grid-cols-[56px_minmax(0,160px)_80px_120px_minmax(0,1fr)_auto] items-center gap-4 py-4 pr-3 md:grid">
          <div className="flex justify-center">
            <div className="relative size-10 overflow-hidden ring-1 ring-white/10 transition-[filter] hover:brightness-110">
              {match.agent.iconUrl ? (
                <Image
                  src={match.agent.iconUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="size-10 bg-white/10" />
              )}
            </div>
          </div>

          <div className="min-w-0">
            <p className="font-display text-base font-medium leading-tight text-white">{match.map}</p>
            <p className="mt-0.5 font-mono-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              {match.mode}
            </p>
            <p className="mt-0.5 font-mono-display text-[10px] text-white/30">{timeAgo}</p>
          </div>

          <div className="text-center">
            <p className="font-mono-display text-xl font-bold tabular-nums leading-none">
              <span className={ownScoreClass}>{match.score.own}</span>
              <span className="text-white/40"> : </span>
              <span className="text-white/70">{match.score.enemy}</span>
            </p>
          </div>

          <div>
            <p className="font-mono-display text-base font-medium tabular-nums text-white">
              {s.kills} / {s.deaths} / {s.assists}
            </p>
            <p className="mt-0.5 font-mono-display text-[10px] text-white/50">K/D {s.kd.toFixed(2)}</p>
          </div>

          <StatStrip stats={s} showFb={showFb} />

          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="flex justify-end text-white/50"
          >
            <ChevronDown className="size-4" aria-hidden />
          </motion.div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            className="overflow-hidden"
          >
            <MatchDetailPanel match={match} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function StatStrip({
  stats,
  showFb,
}: {
  stats: Match["stats"];
  showFb: boolean;
}) {
  const tiles: { label: string; value: string }[] = [
    { label: "ACS", value: Math.round(stats.acs).toString() },
    { label: "DMG/R", value: stats.damagePerRound > 0 ? stats.damagePerRound.toFixed(0) : "—" },
    { label: "HS%", value: `${stats.hsPct.toFixed(0)}%` },
  ];
  if (showFb) {
    tiles.push({ label: "+FB", value: String(stats.firstBloods ?? 0) });
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="flex min-w-[3.25rem] flex-col items-end rounded-none border border-white/[0.06] bg-white/[0.02] px-2 py-1"
        >
          <span className="font-mono-display text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            {t.label}
          </span>
          <span className="font-display text-[14px] font-semibold tabular-nums text-white">{t.value}</span>
        </div>
      ))}
    </div>
  );
}
