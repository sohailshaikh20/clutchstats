import type { PerformanceStat } from "@/components/player/PerformanceGrid";
import type { MatchRow } from "@/lib/player/build-profile-payload";
import { RANK_BENCHMARKS } from "@/lib/stats/calculator";
import type { PlayerStats } from "@/lib/stats/calculator";

function normRankKey(patched: string | null): keyof typeof RANK_BENCHMARKS {
  if (!patched) return "platinum";
  const k = patched.trim().toLowerCase().split(/\s+/)[0] ?? "platinum";
  if (k in RANK_BENCHMARKS) return k as keyof typeof RANK_BENCHMARKS;
  return "platinum";
}

function chronoLast(matches: MatchRow[], n: number): MatchRow[] {
  const nonDm = matches.filter((m) => m.filterQueue !== "deathmatch");
  return [...nonDm].sort((a, b) => a.gameStart - b.gameStart).slice(-n);
}

/** Pull last N numeric samples for sparklines. */
function kdTrendValues(matches: MatchRow[], n: number): number[] {
  return chronoLast(matches, n).map((m) => m.kd);
}

function acsTrendValues(matches: MatchRow[], n: number): number[] {
  return chronoLast(matches, n).map((m) => m.combatScore);
}

function adrTrendValues(matches: MatchRow[], n: number): number[] {
  return chronoLast(matches, n).map((m) => m.damagePerRound ?? 0);
}

function hsTrendValues(matches: MatchRow[], n: number): number[] {
  return chronoLast(matches, n).map((m) => m.headshotPct ?? 0);
}

export function buildPerformanceStats(
  statsCalc: PlayerStats,
  rankPatched: string | null,
  matches: MatchRow[]
): PerformanceStat[] {
  const bench = RANK_BENCHMARKS[normRankKey(rankPatched)];
  const perf = statsCalc.premium.performancePercentile;
  const f = statsCalc.free;
  const p = statsCalc.premium;

  const kdTrend = kdTrendValues(matches, 10);
  const acsTrend = acsTrendValues(matches, 10);
  const adrTrend = adrTrendValues(matches, 10);
  const hsTrend = hsTrendValues(matches, 10);

  // TODO(backend): replace top-1% reference values with real percentile data
  const TOP1 = {
    kd: 1.8,
    avgCombatScore: 310,
    adr: 185,
    headshotPct: 35,
    kast: 82,
    firstBloods: 5.2,
    kpr: 1.1,
    dpr: 0.62,
    dda: 35,
    econ: 95,
    multi: 22,
    clutch: 45,
  } as const;

  // TODO(backend): KAST — Henrik does not expose per-round survival; placeholder until we compute from round events.
  const kastPct = 0;
  // TODO(backend): firstBloodRate is null in calculator (Henrik); placeholder count.
  const firstBloods = 0;

  return [
    {
      key: "kd",
      label: "K/D Ratio",
      value: f.kd.toFixed(2),
      format: "number",
      rawValue: f.kd,
      tierAverage: bench.kd,
      tierTop1Pct: TOP1.kd,
      percentile: perf?.kd.percentile ?? 75,
      trend: kdTrend.length >= 2 ? kdTrend : [],
      delta: 0,
      isHighlight: (perf?.kd.percentile ?? 0) >= 95,
    },
    {
      key: "acs",
      label: "Avg Combat Score",
      value: f.avgCombatScore.toFixed(0),
      format: "integer",
      rawValue: f.avgCombatScore,
      tierAverage: bench.avgCombatScore,
      tierTop1Pct: TOP1.avgCombatScore,
      percentile: perf?.avgCombatScore.percentile ?? 72,
      trend: acsTrend.length >= 2 ? acsTrend : [],
      delta: 0,
      isHighlight: (perf?.avgCombatScore.percentile ?? 0) >= 95,
    },
    {
      key: "adr",
      label: "Damage/Round",
      value: p.avgDamagePerRound.toFixed(1),
      format: "number",
      rawValue: p.avgDamagePerRound,
      tierAverage: bench.adr,
      tierTop1Pct: TOP1.adr,
      percentile: perf?.adr.percentile ?? 70,
      trend: adrTrend.length >= 2 ? adrTrend : [],
      delta: 0,
      isHighlight: (perf?.adr.percentile ?? 0) >= 95,
    },
    {
      key: "hs",
      label: "Headshot %",
      value: f.headshotPercent.toFixed(1) + "%",
      format: "percent",
      rawValue: f.headshotPercent,
      tierAverage: bench.headshotPct,
      tierTop1Pct: TOP1.headshotPct,
      percentile: perf?.headshotPct.percentile ?? 55,
      trend: hsTrend.length >= 2 ? hsTrend : [],
      delta: 0,
      isHighlight: (perf?.headshotPct.percentile ?? 0) >= 95,
    },
    {
      key: "kast",
      label: "KAST %",
      value: kastPct.toFixed(1) + "%",
      format: "percent",
      rawValue: kastPct,
      tierAverage: 70,
      tierTop1Pct: TOP1.kast,
      percentile: 68,
      trend: [],
      delta: 0,
    },
    {
      key: "fb",
      label: "First Bloods",
      value: String(firstBloods),
      format: "integer",
      rawValue: firstBloods,
      tierAverage: 2.5,
      tierTop1Pct: TOP1.firstBloods,
      percentile: 60,
      trend: [],
      delta: 0,
    },
    {
      key: "kpr",
      label: "Kills/Round",
      value: p.killsPerRound.toFixed(2),
      format: "number",
      rawValue: p.killsPerRound,
      tierAverage: bench.kpr,
      tierTop1Pct: TOP1.kpr,
      percentile: perf?.kpr.percentile ?? 65,
      trend: [],
      delta: 0,
    },
    {
      key: "dpr",
      label: "Deaths/Round",
      value: p.deathsPerRound.toFixed(2),
      format: "number",
      rawValue: p.deathsPerRound,
      tierAverage: 0.7,
      tierTop1Pct: TOP1.dpr,
      percentile: 50,
      trend: [],
      delta: 0,
    },
    {
      key: "dda",
      label: "DDA/Round",
      value: "+24",
      rawValue: 24,
      tierAverage: 18,
      tierTop1Pct: TOP1.dda,
      isPro: true,
      percentile: 0,
      delta: 0,
    },
    {
      key: "econ",
      label: "Econ Rating",
      value: "72",
      rawValue: 72,
      tierAverage: 65,
      tierTop1Pct: TOP1.econ,
      isPro: true,
      percentile: 0,
      delta: 0,
    },
    {
      key: "multi",
      label: "Multi-Kills",
      value: "18",
      rawValue: 18,
      tierAverage: 12,
      tierTop1Pct: TOP1.multi,
      isPro: true,
      percentile: 0,
      delta: 0,
    },
    {
      key: "clutch",
      label: "Clutch %",
      value: "34%",
      rawValue: 34,
      tierAverage: 22,
      tierTop1Pct: TOP1.clutch,
      format: "percent",
      isPro: true,
      percentile: 0,
      delta: 0,
    },
  ];
}
