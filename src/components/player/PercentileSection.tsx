"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { PerformancePercentile } from "@/lib/stats/calculator";

function normRankTitle(patched: string | null): string {
  if (!patched) return "your rank";
  const first = patched.trim().split(/\s+/)[0] ?? patched;
  return first;
}

const rows: Array<{
  key: keyof PerformancePercentile;
  label: (pct: number, rank: string) => string;
}> = [
  {
    key: "kd",
    label: (pct, rank) => `Your KD is better than ${pct}% of ${rank} players`,
  },
  {
    key: "winRate",
    label: (pct, rank) => `Your win rate is better than ${pct}% of ${rank} players`,
  },
  {
    key: "headshotPct",
    label: (pct, rank) => `Your HS% is better than ${pct}% of ${rank} players`,
  },
  {
    key: "avgCombatScore",
    label: (pct, rank) => `Your ACS is better than ${pct}% of ${rank} players`,
  },
  {
    key: "adr",
    label: (pct, rank) => `Your damage/round is better than ${pct}% of ${rank} players`,
  },
];

export function PercentileSection({
  data,
  rankPatched,
}: {
  data: PerformancePercentile | null;
  rankPatched: string | null;
}) {
  const reduced = Boolean(useReducedMotion());
  if (!data) return null;

  const rank = normRankTitle(rankPatched);

  return (
    <section className="border-t border-white/5 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <h2 className="font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary">
          How you compare
        </h2>
        <div className="mt-6 space-y-5 rounded-xl border border-white/5 bg-surface p-5 sm:p-6">
          {rows.map(({ key, label }, i) => {
            const entry = data[key];
            const pct = Math.min(100, Math.max(0, entry.percentile));
            return (
              <motion.div
                key={key}
                initial={reduced ? false : { opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduced ? 0 : i * 0.04, duration: 0.35 }}
              >
                <p className="font-body text-sm text-text-primary">{label(pct, rank)}</p>
                <div className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-surface-light">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-win/70 to-win"
                    initial={reduced ? { width: `${pct}%` } : { width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: reduced ? 0 : 0.85, ease: "easeOut" }}
                  />
                  <span
                    className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-white bg-accent-red shadow-md"
                    style={{ left: `calc(${pct}% - 6px)` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
