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
  loss: "text-accent-red",
  draw: "text-[#FFB547]",
};

function gameStartFromIso(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? Math.floor(t / 1000) : 0;
}

function kdTone(kd: number): string {
  if (kd >= 1.2) return "text-[#00E5D1]";
  if (kd < 0.9) return "text-accent-red";
  return "text-white";
}

function StatCell({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center text-center">
      <span className="font-mono-display text-[9px] font-bold uppercase tracking-[0.2em] text-white/45">{label}</span>
      <span className={`mt-0.5 font-mono-display text-[14px] font-semibold tabular-nums ${valueClass ?? "text-white"}`}>
        {value}
      </span>
    </div>
  );
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
  const timeAgo = formatTimeAgo(gameStartFromIso(match.playedAtISO));
  const fb = s.firstBloods ?? 0;
  const dda = s.ddaPerRound;
  const ddaLabel =
    dda === undefined ? "—" : dda === 0 ? "0" : dda > 0 ? `+${dda.toFixed(0)}` : dda.toFixed(0);
  const ddaClass =
    dda === undefined ? "text-white/30" : dda > 0 ? "text-[#00E5D1]" : dda < 0 ? "text-accent-red" : "text-white/50";
  const hsClass = s.hsPct >= 30 ? "text-[#FFB547]" : "text-white";
  const fbClass = fb >= 3 ? "text-[#00E5D1]" : "text-white";

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
        <div className="flex flex-col gap-3 py-3 pr-3 md:hidden">
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
              <p className={`mt-0.5 font-mono-display text-[10px] tabular-nums ${kdTone(s.kd)}`}>K/D {s.kd.toFixed(2)}</p>
            </div>
          </div>
          {expanded ? (
            <div className="grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-3">
              <StatCell label="ACS" value={Math.round(s.acs).toString()} />
              <StatCell
                label="ADR"
                value={s.damagePerRound > 0 ? Math.round(s.damagePerRound).toString() : "—"}
              />
              <StatCell label="HS%" value={`${s.hsPct.toFixed(0)}%`} valueClass={hsClass} />
              <StatCell label="+FB" value={String(fb)} valueClass={fbClass} />
              <StatCell label="+DDA" value={dda === undefined ? "—" : ddaLabel} valueClass={ddaClass} />
            </div>
          ) : null}
        </div>

        <div className="hidden grid-cols-[40px_140px_80px_100px_60px_60px_60px_60px_60px_60px_auto] items-center gap-x-2 py-3 pr-3 md:grid">
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

          <div className="text-center">
            <p className="font-mono-display text-base font-medium tabular-nums text-white">
              {s.kills} / {s.deaths} / {s.assists}
            </p>
            <p className="mt-0.5 font-mono-display text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">KDA</p>
          </div>

          <StatCell label="KD" value={s.kd.toFixed(2)} valueClass={kdTone(s.kd)} />
          <StatCell label="ACS" value={Math.round(s.acs).toString()} />
          <StatCell
            label="ADR"
            value={s.damagePerRound > 0 ? Math.round(s.damagePerRound).toString() : "—"}
          />
          <StatCell label="HS%" value={`${s.hsPct.toFixed(0)}%`} valueClass={hsClass} />
          <StatCell label="+FB" value={String(fb)} valueClass={fbClass} />
          <StatCell label="+DDA" value={dda === undefined ? "—" : ddaLabel} valueClass={ddaClass} />

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
