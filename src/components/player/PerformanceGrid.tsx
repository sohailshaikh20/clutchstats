"use client";

import { Lock } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { InfoTip } from "@/components/ui/InfoTip";
import { inferDirection } from "@/lib/trend";

export interface PerformanceStat {
  key: string;
  label: string;
  value: string;
  format?: "number" | "percent" | "integer";
  percentile: number;
  tierAverage?: number;
  /** 99th-percentile style reference in-tier (TODO: backend). */
  tierTop1Pct?: number;
  rawValue?: number;
  trend?: number[];
  delta?: number;
  isPro?: boolean;
  isHighlight?: boolean;
}

export interface PerformanceGridProps {
  stats: PerformanceStat[];
  isProUser: boolean;
  /** e.g. "Diamond" for "vs Diamond avg" */
  tierLabel: string;
}

const TIME_RANGES = ["Last 20", "Last Act", "All Time"] as const;
type PeerMode = "tierAvg" | "top1";

const TIPS: Record<string, string> = {
  kd: "Kills divided by deaths. Above 1.0 = more kills than deaths per match.",
  acs: "Riot's in-game score weighing kills, damage, and round impact. Top players sit at 220+.",
  adr: "Average damage dealt per round. 150+ is solid at Radiant level.",
  hs: "Percentage of shots that landed on the head. Top-tier aim is 30%+.",
  kast: "Rounds where you got a Kill, Assist, Survived, or were Traded. Measures round contribution.",
  fb: "Total rounds where you scored the first kill. Raw opener count.",
  kpr: "Average kills per round. 0.8+ is high impact.",
  dpr: "Average deaths per round. LOWER is better — 0.65 or below is elite.",
  dda: "Damage Dealt vs Absorbed delta. Positive means you trade favorably.",
  econ: "Average damage per 1000 credits of your loadout. Rewards pistol round impact.",
  multi: "Total rounds with 3+ kills (3K/4K/5K).",
  clutch: "Percentage of 1vX situations you won.",
};

function sparkPath(values: number[], w: number, h: number): { d: string; areaD: string } {
  if (values.length < 2) {
    const mid = h / 2;
    return { d: `M 0 ${mid} L ${w} ${mid}`, areaD: `M 0 ${h} L 0 ${mid} L ${w} ${mid} L ${w} ${h} Z` };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 2;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return { x, y };
  });
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaD = `${d} L ${pts[pts.length - 1].x.toFixed(1)} ${h} L ${pts[0].x.toFixed(1)} ${h} Z`;
  return { d, areaD };
}

function strokeFor(dir: "up" | "down" | "flat"): string {
  if (dir === "up") return "#00E5D1";
  if (dir === "down") return "#FF4655";
  return "#8A8A95";
}

function PerformanceTile({
  stat,
  isProUser,
  peerMode,
}: {
  stat: PerformanceStat;
  isProUser: boolean;
  peerMode: PeerMode;
}) {
  const reduced = Boolean(useReducedMotion());
  const router = useRouter();
  const gid = useId().replace(/:/g, "");
  const gated = Boolean(stat.isPro && !isProUser);
  const w = 100;
  const h = 24;
  const trend = useMemo(
    () => (stat.trend && stat.trend.length >= 2 ? stat.trend : []),
    [stat.trend]
  );
  const dir = inferDirection(trend);
  const stroke = strokeFor(dir);
  const { d, areaD } = useMemo(() => sparkPath(trend, w, h), [trend, w, h]);

  const raw = stat.rawValue;
  const tier = peerMode === "top1" ? stat.tierTop1Pct : stat.tierAverage;
  let barPct = 0;
  let relPct = 0;
  let barTone: "up" | "down" | "flat" = "flat";
  if (tier != null && raw != null && tier !== 0) {
    relPct = ((raw - tier) / tier) * 100;
    barPct = Math.min(100, Math.abs((raw - tier) / tier) * 200);
    if (Math.abs(relPct) < 3) barTone = "flat";
    else if (raw > tier) barTone = "up";
    else barTone = "down";
  }
  const barFill =
    barTone === "up" ? "bg-[#00E5D1]" : barTone === "down" ? "bg-accent-red" : "bg-white/70";
  const relStr = `${relPct >= 0 ? "+" : ""}${relPct.toFixed(0)}%`;
  const relArrow = relPct > 3 ? "▲" : relPct < -3 ? "▼" : "—";

  const topPct = (100 - stat.percentile).toFixed(1);
  const delta = stat.delta ?? 0;
  const deltaTone = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const deltaArrow = delta > 0 ? "▲" : delta < 0 ? "▼" : "—";

  const tip = TIPS[stat.key] ?? "";
  const vsLabel = peerMode === "top1" ? "TOP 1%" : "RADIANT AVG";

  const inner = (
    <>
      <span
        className="pointer-events-none absolute right-0 top-0 size-2 bg-accent-red [clip-path:polygon(100%_0,0_0,100%_100%)]"
        aria-hidden
      />
      <div className="flex items-start justify-between gap-2 pr-1">
        <span className="flex items-center gap-1 font-mono-display text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
          {stat.label}
          {tip ? (
            <InfoTip>
              <span>{tip}</span>
            </InfoTip>
          ) : null}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          {stat.isHighlight ? (
            <span className="font-mono-display text-[10px] font-bold uppercase tracking-wider text-[#FFB547]">
              ★ TOP 5%
            </span>
          ) : null}
          {stat.isPro ? (
            <span className="rounded-sm bg-accent-red px-1.5 py-0.5 font-mono-display text-[9px] font-bold uppercase text-white">
              PRO
            </span>
          ) : null}
        </div>
      </div>

      <p
        className={`mt-3 font-display text-[28px] font-black tabular-nums leading-none text-white md:text-[36px] ${
          gated ? "blur-sm select-none opacity-60" : ""
        }`}
      >
        {stat.value}
      </p>

      {trend.length >= 2 ? (
        <div className="mt-3">
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
            <defs>
              <linearGradient id={`pg-${gid}-${stat.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
                <stop offset="100%" stopColor={stroke} stopOpacity="0.03" />
              </linearGradient>
            </defs>
            <path d={areaD} fill={`url(#pg-${gid}-${stat.key})`} />
            {(() => {
              const min = Math.min(...trend);
              const max = Math.max(...trend);
              const span = max - min || 1;
              const pad = 2;
              const midVal = (min + max) / 2;
              const midY = pad + (1 - (midVal - min) / span) * (h - pad * 2);
              return (
                <line
                  x1={pad}
                  x2={w - pad}
                  y1={midY}
                  y2={midY}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={1}
                  strokeDasharray="1 3"
                />
              );
            })()}
            <motion.path
              d={d}
              fill="none"
              stroke={stroke}
              strokeWidth={2}
              strokeLinecap="round"
              initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduced ? 0 : 0.75, ease: "easeOut" }}
            />
            {(() => {
              const last = trend[trend.length - 1];
              const min = Math.min(...trend);
              const max = Math.max(...trend);
              const span = max - min || 1;
              const pad = 2;
              const lx = w - pad;
              const ly = pad + (1 - (last - min) / span) * (h - pad * 2);
              return <circle cx={lx} cy={ly} r={2.5} fill={stroke} />;
            })()}
          </svg>
        </div>
      ) : null}

      {tier != null && raw != null ? (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono-display text-[10px] font-bold uppercase tracking-wide text-white/35">
              vs {vsLabel}
            </span>
            <span
              className={`font-mono-display text-[10px] font-bold tabular-nums ${
                barTone === "up" ? "text-[#00E5D1]" : barTone === "down" ? "text-accent-red" : "text-white/45"
              }`}
            >
              {relArrow} {relStr}
            </span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden bg-white/[0.06]">
            <div className={`h-full ${barFill}`} style={{ width: `${barPct}%` }} />
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="font-mono-display text-[11px] text-white/40">Top {topPct}%</span>
        <span
          className={`rounded-sm px-1.5 py-0.5 font-mono-display text-[10px] font-bold tabular-nums ${
            deltaTone === "up"
              ? "bg-[#00E5D1]/15 text-[#00E5D1]"
              : deltaTone === "down"
                ? "bg-accent-red/15 text-accent-red"
                : "bg-white/[0.06] text-white/40"
          }`}
        >
          {delta === 0 ? "—" : `${deltaArrow} ${delta > 0 ? "+" : ""}${delta.toFixed(1)}`}
        </span>
      </div>

      {gated ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center justify-end bg-gradient-to-t from-[rgba(10,10,12,0.95)] to-transparent pb-4 pt-16">
          <Lock className="size-[14px] text-white/60" aria-hidden />
          <p className="mt-2 font-mono-display text-[10px] font-bold uppercase tracking-[0.2em] text-accent-red">
            UPGRADE TO PRO
          </p>
          <p className="mt-1 font-mono-display text-[10px] text-white/50">Unlock advanced analytics</p>
        </div>
      ) : null}
    </>
  );

  const shellClass = `relative overflow-hidden rounded-none border border-white/[0.06] bg-[#0D0D10] p-5 text-left transition-all hover:border-white/[0.12] ${
    stat.isHighlight ? "ring-1 ring-[#FFB547]/60" : ""
  }`;

  if (gated) {
    return (
      <button
        type="button"
        onClick={() => router.push("/pricing")}
        className={`${shellClass} block w-full cursor-pointer text-left`}
      >
        {inner}
      </button>
    );
  }

  return <div className={shellClass}>{inner}</div>;
}

export function PerformanceGrid({ stats, isProUser, tierLabel }: PerformanceGridProps) {
  const [range, setRange] = useState<(typeof TIME_RANGES)[number]>("Last 20");
  const [peerMode, setPeerMode] = useState<PeerMode>("tierAvg");

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 pb-6 pt-5 sm:px-6 lg:px-8 xl:px-10">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="h-px w-6 shrink-0 bg-accent-red" aria-hidden />
          <h2 className="font-mono-display text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
            Performance // Overview
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className="flex flex-wrap gap-2">
            {TIME_RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-sm px-3 py-2 font-mono-display text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  range === r ? "bg-accent-red text-white" : "bg-white/[0.03] text-white/50 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div
            className="inline-flex w-fit rounded-sm border border-white/[0.08] p-0.5 font-mono-display text-[10px] font-bold uppercase tracking-wide"
            role="group"
            aria-label="Peer comparison"
          >
            <button
              type="button"
              onClick={() => setPeerMode("tierAvg")}
              className={`rounded-sm px-2.5 py-2 transition-colors ${
                peerMode === "tierAvg" ? "bg-accent-red text-white" : "text-white/50 hover:text-white"
              }`}
            >
              VS RADIANT AVG
            </button>
            <button
              type="button"
              onClick={() => setPeerMode("top1")}
              className={`rounded-sm px-2.5 py-2 transition-colors ${
                peerMode === "top1" ? "bg-accent-red text-white" : "text-white/50 hover:text-white"
              }`}
            >
              VS TOP 1%
            </button>
          </div>
        </div>
      </div>

      <p className="sr-only">Tier context: {tierLabel}</p>

      <div className="grid grid-cols-1 gap-px bg-white/[0.04] md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <PerformanceTile key={stat.key} stat={stat} isProUser={isProUser} peerMode={peerMode} />
        ))}
      </div>
    </div>
  );
}
