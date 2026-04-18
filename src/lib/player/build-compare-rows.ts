import type { CompareRow } from "@/components/player/CompareBlock";
import { RANK_BENCHMARKS } from "@/lib/stats/calculator";
import type { PerformancePercentile } from "@/lib/stats/calculator";

function normRankKey(patched: string | null): keyof typeof RANK_BENCHMARKS | null {
  if (!patched) return null;
  const k = patched.trim().toLowerCase().split(/\s+/)[0] ?? "";
  if (k in RANK_BENCHMARKS) return k as keyof typeof RANK_BENCHMARKS;
  return null;
}

/** Tier distribution heuristics around rank benchmark means — TODO(backend): replace with real distributions. */
function tierKd(b: number) {
  return {
    tierMin: Math.max(0.45, parseFloat((b * 0.64).toFixed(2))),
    tierMax: parseFloat((b * 1.44).toFixed(2)),
    tierMean: b,
    higherIsBetter: true as const,
  };
}

function tierWin(b: number) {
  return {
    tierMin: Math.max(35, Math.round(b - 17)),
    tierMax: Math.min(72, Math.round(b + 17)),
    tierMean: b,
    higherIsBetter: true as const,
  };
}

function tierHs(b: number) {
  return {
    tierMin: Math.max(8, Math.round(b * 0.55)),
    tierMax: Math.round(b * 1.48),
    tierMean: b,
    higherIsBetter: true as const,
  };
}

function tierAcs(b: number) {
  return {
    tierMin: Math.round(b * 0.72),
    tierMax: Math.round(b * 1.32),
    tierMean: b,
    higherIsBetter: true as const,
  };
}

function tierAdr(b: number) {
  return {
    tierMin: Math.round(b * 0.76),
    tierMax: Math.round(b * 1.24),
    tierMean: b,
    higherIsBetter: true as const,
  };
}

export function buildCompareRows(
  data: PerformancePercentile | null,
  rankPatched: string | null
): CompareRow[] {
  const key = normRankKey(rankPatched);
  if (!data || !key) return [];

  const bench = RANK_BENCHMARKS[key];

  const clampPct = (n: number) => Math.min(100, Math.max(0, n));

  const rows: CompareRow[] = [
    {
      label: "K/D Ratio",
      value: data.kd.value.toFixed(2),
      percentile: clampPct(data.kd.percentile),
      ...tierKd(bench.kd),
    },
    {
      label: "Win Rate",
      value: `${data.winRate.value.toFixed(1)}%`,
      percentile: clampPct(data.winRate.percentile),
      ...tierWin(bench.winRate),
    },
    {
      label: "Headshot %",
      value: `${data.headshotPct.value.toFixed(1)}%`,
      percentile: clampPct(data.headshotPct.percentile),
      ...tierHs(bench.headshotPct),
    },
    {
      label: "ACS",
      value: Math.round(data.avgCombatScore.value).toString(),
      percentile: clampPct(data.avgCombatScore.percentile),
      ...tierAcs(bench.avgCombatScore),
    },
    {
      label: "Damage/Round",
      value: data.adr.value.toFixed(1),
      percentile: clampPct(data.adr.percentile),
      ...tierAdr(bench.adr),
    },
  ];

  return rows;
}
