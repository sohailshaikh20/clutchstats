"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useState } from "react";

export interface CompareRow {
  label: string;
  value: string;
  percentile: number;
  tierMin: number;
  tierMax: number;
  tierMean?: number;
  higherIsBetter: boolean;
}

export interface CompareBlockProps {
  tier: string;
  rows: CompareRow[];
}

const CURVE_PATH = "M 0 48 Q 100 48 200 8 Q 300 48 400 48";
const CURVE_AREA = `${CURVE_PATH} L 400 56 L 0 56 Z`;

function mapRange(v: number, min: number, max: number, outMin: number, outMax: number): number {
  if (max === min) return (outMin + outMax) / 2;
  const t = (v - min) / (max - min);
  return outMin + Math.min(1, Math.max(0, t)) * (outMax - outMin);
}

function pinX(row: CompareRow): number {
  const p = row.percentile / 100;
  const raw = row.higherIsBetter ? p * 400 : (1 - p) * 400;
  return Math.min(392, Math.max(8, raw));
}

function meanX(row: CompareRow): number | null {
  if (row.tierMean === undefined) return null;
  return Math.min(400, Math.max(0, mapRange(row.tierMean, row.tierMin, row.tierMax, 0, 400)));
}

function topPercentColor(percentile: number): string {
  if (percentile >= 95) return "text-[#FFB547]";
  if (percentile >= 80) return "text-[#00E5D1]";
  if (percentile >= 50) return "text-white";
  return "text-[#FF4655]";
}

function useCountUp(target: number, durationMs: number, active: boolean): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) {
      setV(0);
      return;
    }
    let startAt: number | null = null;
    let raf = 0;
    const tick = (now: number) => {
      if (startAt === null) startAt = now;
      const t = Math.min(1, (now - startAt) / durationMs);
      const eased = 1 - (1 - t) * (1 - t);
      setV(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, active]);
  return v;
}

function CompareCurveSvg({
  row,
  reduced,
  pinDelay,
}: {
  row: CompareRow;
  reduced: boolean;
  pinDelay: number;
}) {
  const gid = useId().replace(/:/g, "");
  const mx = meanX(row);
  const px = pinX(row);

  return (
    <svg
      className="h-14 w-full"
      viewBox="0 0 400 56"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`cb-fill-${gid}`} x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF4655" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#00E5D1" />
        </linearGradient>
      </defs>
      <path d={CURVE_AREA} fill={`url(#cb-fill-${gid})`} fillOpacity={0.2} />
      <path d={CURVE_PATH} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      {mx !== null ? (
        <line
          x1={mx}
          x2={mx}
          y1={4}
          y2={54}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1}
          strokeDasharray="2 4"
        />
      ) : null}
      <motion.g
        initial={reduced ? false : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{
          duration: reduced ? 0 : 0.6,
          ease: [0.22, 1, 0.36, 1],
          delay: reduced ? 0 : pinDelay,
        }}
        style={{ transformOrigin: `${px}px 18px`, transformBox: "fill-box" as const }}
      >
        <text
          x={px}
          y={6}
          textAnchor="middle"
          fill="#FF4655"
          style={{ fontFamily: "var(--font-mono-display), ui-monospace, monospace", fontSize: 10, fontWeight: 700 }}
        >
          {row.value}
        </text>
        <path d={`M ${px - 4} 10 L ${px + 4} 10 L ${px} 18 Z`} fill="#FF4655" />
        <line x1={px} x2={px} y1={18} y2={52} stroke="#FF4655" strokeWidth={2} />
      </motion.g>
    </svg>
  );
}

function CompareStatRow({
  row,
  index,
  reduced,
}: {
  row: CompareRow;
  index: number;
  reduced: boolean;
}) {
  const topTarget = Math.max(0, Math.min(100, Math.round(100 - row.percentile)));
  const counted = useCountUp(topTarget, 1000, true);
  const pinDelay = reduced ? 0 : 0.4 + index * 0.08;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className="grid grid-cols-1 items-start gap-4 border-b border-white/[0.04] py-3 last:border-b-0 md:grid-cols-[140px_1fr_80px] md:items-center"
    >
      <div className="min-w-0">
        <p className="font-display text-sm font-medium text-white">{row.label}</p>
        <p className="mt-0.5 font-mono-display text-xs text-white/50">{row.value}</p>
      </div>

      <div className="min-h-[56px] w-full min-w-0">
        <CompareCurveSvg row={row} reduced={reduced} pinDelay={pinDelay} />
      </div>

      <div className="text-left md:text-right">
        <p className={`font-display text-2xl font-black tabular-nums ${topPercentColor(row.percentile)}`}>
          Top {counted}%
        </p>
        <p className="mt-0.5 font-mono-display text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
          percentile
        </p>
      </div>
    </motion.div>
  );
}

export function CompareBlock({ tier, rows }: CompareBlockProps) {
  const reduced = Boolean(useReducedMotion());
  const container = useMemo(
    () => ({
      hidden: {},
      show: {
        transition: { staggerChildren: reduced ? 0 : 0.08, delayChildren: reduced ? 0 : 0.04 },
      },
    }),
    [reduced]
  );

  if (!rows.length) {
    return (
      <div className="border-t border-white/5 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl text-center">
          <p className="font-mono-display text-xs text-white/40">No comparison data available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-white/5 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex items-center gap-3">
          <span className="h-px w-6 shrink-0 bg-accent-red" aria-hidden />
          <h2 className="font-mono-display text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
            HOW YOU COMPARE
          </h2>
        </div>
        <p className="mt-2 font-mono-display text-xs text-white/40">
          vs. {rows.length} stats across other {tier} players
        </p>

        <motion.div
          className="mt-6 space-y-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          {rows.map((row, index) => (
            <CompareStatRow key={row.label} row={row} index={index} reduced={reduced} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
