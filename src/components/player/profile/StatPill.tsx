"use client";

import { HelpCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { inferDirection } from "@/lib/trend";

function sparklinePath(values: number[], w: number, h: number): { d: string; areaD: string } {
  if (values.length < 2) {
    const mid = h / 2;
    return {
      d: `M 0 ${mid} L ${w} ${mid}`,
      areaD: `M 0 ${h} L 0 ${mid} L ${w} ${mid} L ${w} ${h} Z`,
    };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 2;
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return { x, y };
  });
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaD = `${d} L ${pts[pts.length - 1].x.toFixed(1)} ${h} L ${pts[0].x.toFixed(1)} ${h} Z`;
  return { d, areaD };
}

function strokeForDirection(dir: "up" | "down" | "flat"): string {
  if (dir === "up") return "#00E5D1";
  if (dir === "down") return "#FF4655";
  return "#8A8A95";
}

function barFillClass(percentile: number): string {
  if (percentile >= 95) return "bg-[#FFB547]";
  if (percentile >= 80) return "bg-[#00E5D1]";
  if (percentile >= 50) return "bg-white/80";
  return "bg-[#8A8A95]";
}

export type HeadlineStat = {
  key: string;
  label: string;
  value: string;
  percentile: number;
  delta: number;
  trend: number[];
  trendDirection: "up" | "down" | "flat";
};

export function StatPill({
  stat,
  variant = "default",
}: {
  stat: HeadlineStat;
  variant?: "default" | "clutch";
}) {
  const reduced = Boolean(useReducedMotion());
  const w = 72;
  const h = 24;
  const trend = useMemo(
    () => (stat.trend.length >= 2 ? stat.trend : [0, 0, 0, 0, 0.5, 1, 1]),
    [stat.trend]
  );
  const { d, areaD } = useMemo(() => sparklinePath(trend, w, h), [trend, w, h]);
  const strokeDir = variant === "clutch" ? stat.trendDirection : inferDirection(trend);
  const stroke = strokeForDirection(strokeDir);
  const elite = stat.percentile >= 90;
  const fillPct = Math.min(100, Math.max(0, stat.percentile));
  const topLabel = (100 - stat.percentile).toFixed(1);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={`relative flex flex-col justify-between gap-2 border-t border-white/[0.06] px-4 py-4 md:border-t-0 md:border-l md:border-white/[0.06] md:py-5 ${
        variant === "clutch" ? "md:pl-5" : ""
      }`}
    >
      {variant === "clutch" ? (
        <span
          className="pointer-events-none absolute left-0 top-5 hidden h-[calc(100%-40px)] w-[3px] bg-accent-red md:block"
          aria-hidden
        />
      ) : null}

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {variant === "clutch" ? (
            <>
              <span className="font-mono-display text-[10px] font-bold uppercase tracking-[0.3em] text-accent-red">
                Clutch rating
              </span>
              <button
                type="button"
                className="inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-white/15 text-[10px] text-white/50 hover:border-white/30"
                title="Composite score (TODO): blends K/D, win rate, and ACS. Will be replaced by backend v1."
              >
                <HelpCircle className="size-3" aria-hidden />
                <span className="sr-only">Composite formula — see tooltip on hover</span>
              </button>
            </>
          ) : (
            <span className="font-mono-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
              {stat.label}
            </span>
          )}
        </div>
        {elite && variant !== "clutch" ? (
          <span className="shrink-0 font-mono-display text-[9px] font-bold uppercase tracking-wider text-[#FFB547]">
            ★ Elite
          </span>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-2">
        {variant === "clutch" ? (
          <div className="flex items-baseline gap-1">
            <span className="font-display text-4xl font-black tabular-nums text-white">{stat.value}</span>
            <span className="font-mono-display text-xs text-white/40">/ 1000</span>
          </div>
        ) : (
          <span className="font-display text-3xl font-black tabular-nums text-white">{stat.value}</span>
        )}
        <div className="shrink-0" style={{ width: w, height: h }}>
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
            <defs>
              <linearGradient id={`fill-${stat.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
                <stop offset="100%" stopColor={stroke} stopOpacity="0.03" />
              </linearGradient>
            </defs>
            <motion.path
              d={areaD}
              fill={`url(#fill-${stat.key})`}
              initial={false}
              animate={{ opacity: 1 }}
            />
            <motion.path
              d={d}
              fill="none"
              stroke={stroke}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduced ? 0 : 0.8, delay: reduced ? 0 : 0.3, ease: "easeOut" }}
            />
            {(() => {
              const last = trend[trend.length - 1];
              const min = Math.min(...trend);
              const max = Math.max(...trend);
              const span = max - min || 1;
              const pad = 2;
              const lx = w - pad;
              const ly = pad + (1 - (last - min) / span) * (h - pad * 2);
              return (
                <g transform={`translate(${lx}, ${ly})`}>
                  <motion.circle
                    cx={0}
                    cy={0}
                    r={2.5}
                    fill={stroke}
                    initial={reduced ? false : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: reduced ? 0 : 1.1, type: "spring", stiffness: 400, damping: 22 }}
                  />
                  {!reduced ? (
                    <motion.circle
                      cx={0}
                      cy={0}
                      r={2.5}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={2}
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 3, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    />
                  ) : null}
                </g>
              );
            })()}
          </svg>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-sans-tight text-xs text-white/60">
          Top {topLabel}%
          {variant === "clutch" && stat.delta !== 0 ? (
            <span
              className={`ml-2 inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono-display text-[10px] font-bold ${
                stat.delta > 0 ? "bg-[#00E5D1]/15 text-[#00E5D1]" : "bg-accent-red/15 text-accent-red"
              }`}
            >
              {stat.delta > 0 ? "▲" : "▼"} {Math.abs(stat.delta)}
            </span>
          ) : null}
        </span>
        {variant !== "clutch" ? (
          <span
            className={`font-mono-display text-[10px] font-bold tabular-nums ${
              stat.delta > 0 ? "text-[#00E5D1]" : stat.delta < 0 ? "text-accent-red" : "text-white/35"
            }`}
          >
            {stat.delta !== 0 ? `${stat.delta > 0 ? "+" : ""}${stat.delta.toFixed(1)}` : "—"}
          </span>
        ) : null}
      </div>

      <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${barFillClass(fillPct)}`}
          initial={reduced ? { width: `${fillPct}%` } : { width: 0 }}
          animate={{ width: `${fillPct}%` }}
          transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : 0.5, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
