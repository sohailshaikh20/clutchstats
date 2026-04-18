/**
 * Comprehensive Valorant stats calculator.
 *
 * Takes Henrik match history and returns split free/premium stats.
 * Free stats: visible to all users.
 * Premium stats: calculated but flagged — UI blurs/locks them.
 */
import type { HenrikMatch } from "@/types/valorant";

// ─── Rank benchmarks (hardcoded per tier) ────────────────────────────────────

export const RANK_BENCHMARKS: Record<
  string,
  { kd: number; winRate: number; headshotPct: number; avgCombatScore: number }
> = {
  iron:      { kd: 0.80, winRate: 48, headshotPct: 15, avgCombatScore: 130 },
  bronze:    { kd: 0.85, winRate: 49, headshotPct: 17, avgCombatScore: 145 },
  silver:    { kd: 0.90, winRate: 49, headshotPct: 19, avgCombatScore: 160 },
  gold:      { kd: 0.95, winRate: 50, headshotPct: 21, avgCombatScore: 175 },
  platinum:  { kd: 1.00, winRate: 50, headshotPct: 22, avgCombatScore: 190 },
  diamond:   { kd: 1.05, winRate: 51, headshotPct: 24, avgCombatScore: 205 },
  ascendant: { kd: 1.10, winRate: 52, headshotPct: 26, avgCombatScore: 220 },
  immortal:  { kd: 1.15, winRate: 53, headshotPct: 28, avgCombatScore: 240 },
  radiant:   { kd: 1.25, winRate: 55, headshotPct: 30, avgCombatScore: 270 },
};

// ─── Output types ─────────────────────────────────────────────────────────────

export type AgentStat = {
  agent: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  kd: number;
  avgACS: number;
};

export type MapStat = {
  map: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  avgKD: number;
};

export type KdPoint = {
  matchIndex: number;
  kd: number;
  date: number;
};

export type FreeStats = {
  kd: number;
  winRate: number;
  headshotPercent: number;
  avgCombatScore: number;
  wins: number;
  losses: number;
  totalGames: number;
  topAgents: AgentStat[];
  mapStats: MapStat[];
  recentKDTrend: KdPoint[];
};

export type PerformancePercentile = {
  kd: number;
  winRate: number;
  headshotPct: number;
  avgCombatScore: number;
};

export type PremiumStats = {
  avgDamagePerRound: number;
  firstBloodRate: number | null;
  firstDeathRate: number | null;
  winStreaks: { current: number; longest: number };
  performancePercentile: PerformancePercentile | null;
  rankName: string | null;
};

export type PlayerStats = {
  free: FreeStats;
  premium: PremiumStats;
  matchCount: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPlayer(match: HenrikMatch, puuid: string) {
  const all = match.players?.all_players ?? (match.players as unknown as HenrikMatch["players"]["all_players"]);
  if (!Array.isArray(all)) return null;
  return all.find((p) => p.puuid === puuid) ?? null;
}

function isDeathmatch(mode: string): boolean {
  return mode.toLowerCase().includes("deathmatch");
}

function normRankName(patched: string): string {
  return patched.toLowerCase().split(" ")[0] ?? "";
}

function percentileWithinRank(
  playerVal: number,
  benchVal: number,
  direction: "higher" | "lower" = "higher"
): number {
  // Estimate percentile via simple linear scaling around the benchmark.
  // Benchmark ≈ 50th percentile. ±20% of benchmark ≈ ±25 percentile points.
  const ratio = direction === "higher" ? playerVal / benchVal : benchVal / playerVal;
  const clamped = Math.min(Math.max(ratio, 0.5), 1.75);
  return Math.round(((clamped - 0.5) / 1.25) * 90 + 5); // maps [0.5..1.75] → [5..95]
}

// ─── Main calculator ──────────────────────────────────────────────────────────

export function calculatePlayerStats(
  matches: HenrikMatch[],
  puuid: string,
  currentRankPatched?: string | null
): PlayerStats {
  let totalKills = 0;
  let totalDeaths = 0;
  let totalHeadshots = 0;
  let totalShots = 0;
  let acsSum = 0;
  let acsCount = 0;
  let wins = 0;
  let losses = 0;
  let totalDamage = 0;
  let totalRounds = 0;

  const agentMap = new Map<
    string,
    { games: number; wins: number; kills: number; deaths: number; acsSum: number; acsCount: number }
  >();
  const mapMap = new Map<
    string,
    { games: number; wins: number; killsSum: number; deathsSum: number }
  >();
  const kdTrend: KdPoint[] = [];

  // Streak tracking (chronological order needed — sort oldest first)
  const chronoMatches = [...matches].sort(
    (a, b) => (a.metadata.game_start ?? 0) - (b.metadata.game_start ?? 0)
  );
  let currentStreak = 0;
  let longestStreak = 0;
  let streakSign = 0; // +1 win streak, -1 loss streak, tracks only wins for "win streak"

  for (const match of chronoMatches) {
    const player = getPlayer(match, puuid);
    if (!player) continue;

    const mode = match.metadata.mode ?? "";
    const dm = isDeathmatch(mode);
    const rounds = Math.max(match.metadata.rounds_played ?? 1, 1);

    // K/D for all modes
    const mk = player.stats.kills ?? 0;
    const md = player.stats.deaths ?? 0;
    totalKills += mk;
    totalDeaths += md;

    const matchKD = md > 0 ? mk / md : mk;

    if (!dm) {
      const teamKey = player.team.toLowerCase() as "red" | "blue";
      const team = match.teams?.[teamKey];
      const won = (team?.rounds_won ?? 0) > (team?.rounds_lost ?? 0);

      if (won) {
        wins += 1;
        currentStreak = streakSign === 1 ? currentStreak + 1 : 1;
        streakSign = 1;
      } else {
        losses += 1;
        currentStreak = streakSign === -1 ? currentStreak + 1 : 1;
        streakSign = -1;
      }
      if (streakSign === 1 && currentStreak > longestStreak) longestStreak = currentStreak;

      const hs = player.stats.headshots ?? 0;
      const bs = player.stats.bodyshots ?? 0;
      const ls = player.stats.legshots ?? 0;
      const shots = hs + bs + ls;
      if (shots > 0) {
        totalHeadshots += hs;
        totalShots += shots;
      }

      const acs = rounds > 0 ? (player.stats.score ?? 0) / rounds : 0;
      if (acs > 0) {
        acsSum += acs;
        acsCount += 1;
      }

      // Damage
      const dmgMade = player.damage_made ?? 0;
      if (dmgMade > 0) {
        totalDamage += dmgMade;
        totalRounds += rounds;
      }

      // Agent aggregation
      const agentKey = player.character;
      const prev = agentMap.get(agentKey) ?? { games: 0, wins: 0, kills: 0, deaths: 0, acsSum: 0, acsCount: 0 };
      prev.games += 1;
      if (won) prev.wins += 1;
      prev.kills += mk;
      prev.deaths += md;
      if (acs > 0) { prev.acsSum += acs; prev.acsCount += 1; }
      agentMap.set(agentKey, prev);

      // Map aggregation
      const mapKey = match.metadata.map ?? "Unknown";
      const prevM = mapMap.get(mapKey) ?? { games: 0, wins: 0, killsSum: 0, deathsSum: 0 };
      prevM.games += 1;
      if (won) prevM.wins += 1;
      prevM.killsSum += mk;
      prevM.deathsSum += md;
      mapMap.set(mapKey, prevM);

      // KD trend (use non-deathmatch only)
      kdTrend.push({
        matchIndex: kdTrend.length + 1,
        kd: parseFloat(matchKD.toFixed(2)),
        date: match.metadata.game_start ?? 0,
      });
    }
  }

  const totalGames = wins + losses;
  const kd = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
  const headshotPercent = totalShots > 0 ? (totalHeadshots / totalShots) * 100 : 0;
  const avgCombatScore = acsCount > 0 ? acsSum / acsCount : 0;

  // Top agents (min 2 games, sorted by games played)
  const topAgents: AgentStat[] = Array.from(agentMap.entries())
    .filter(([, v]) => v.games >= 2)
    .map(([agent, v]) => ({
      agent,
      gamesPlayed: v.games,
      wins: v.wins,
      winRate: v.games > 0 ? (v.wins / v.games) * 100 : 0,
      kd: v.deaths > 0 ? v.kills / v.deaths : v.kills,
      avgACS: v.acsCount > 0 ? v.acsSum / v.acsCount : 0,
    }))
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
    .slice(0, 5);

  // Map stats
  const mapStats: MapStat[] = Array.from(mapMap.entries())
    .map(([map, v]) => ({
      map,
      gamesPlayed: v.games,
      wins: v.wins,
      winRate: v.games > 0 ? (v.wins / v.games) * 100 : 0,
      avgKD: v.deathsSum > 0 ? v.killsSum / v.deathsSum : v.killsSum,
    }))
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed);

  // Recent KD trend — last 10 non-deathmatch matches (already chronological, take last 10)
  const recentKDTrend = kdTrend.slice(-10).map((p, i) => ({ ...p, matchIndex: i + 1 }));

  // Premium: damage per round
  const avgDamagePerRound = totalRounds > 0 ? totalDamage / totalRounds : 0;

  // Premium: win streaks
  const winCurrentStreak = streakSign === 1 ? currentStreak : 0;

  // Premium: performance percentile
  let performancePercentile: PerformancePercentile | null = null;
  if (currentRankPatched) {
    const rankKey = normRankName(currentRankPatched);
    const bench = RANK_BENCHMARKS[rankKey];
    if (bench) {
      performancePercentile = {
        kd: percentileWithinRank(kd, bench.kd, "higher"),
        winRate: percentileWithinRank(winRate, bench.winRate, "higher"),
        headshotPct: percentileWithinRank(headshotPercent, bench.headshotPct, "higher"),
        avgCombatScore: percentileWithinRank(avgCombatScore, bench.avgCombatScore, "higher"),
      };
    }
  }

  return {
    matchCount: matches.length,
    free: {
      kd: parseFloat(kd.toFixed(2)),
      winRate: parseFloat(winRate.toFixed(1)),
      headshotPercent: parseFloat(headshotPercent.toFixed(1)),
      avgCombatScore: parseFloat(avgCombatScore.toFixed(0)),
      wins,
      losses,
      totalGames,
      topAgents,
      mapStats,
      recentKDTrend,
    },
    premium: {
      avgDamagePerRound: parseFloat(avgDamagePerRound.toFixed(1)),
      firstBloodRate: null, // Henrik doesn't expose per-round first-blood data
      firstDeathRate: null,
      winStreaks: { current: winCurrentStreak, longest: longestStreak },
      performancePercentile,
      rankName: currentRankPatched ?? null,
    },
  };
}

/**
 * Finds the weakest area from a player's stats compared to their rank benchmark.
 * Returns the stat name + deficit string for coaching insights.
 */
export function findWeakestStat(
  stats: FreeStats,
  rankName: string
): { stat: string; label: string; playerVal: string; benchVal: string } | null {
  const bench = RANK_BENCHMARKS[normRankName(rankName)];
  if (!bench) return null;

  const gaps = [
    { stat: "kd", label: "K/D ratio", player: stats.kd, bench: bench.kd, fmt: (v: number) => v.toFixed(2) },
    { stat: "winRate", label: "Win rate", player: stats.winRate, bench: bench.winRate, fmt: (v: number) => `${v.toFixed(1)}%` },
    { stat: "headshotPercent", label: "Headshot %", player: stats.headshotPercent, bench: bench.headshotPct, fmt: (v: number) => `${v.toFixed(1)}%` },
    { stat: "avgCombatScore", label: "ACS", player: stats.avgCombatScore, bench: bench.avgCombatScore, fmt: (v: number) => Math.round(v).toString() },
  ];

  // Find biggest relative gap (negative = below benchmark)
  const withGap = gaps.map((g) => ({ ...g, gap: (g.player - g.bench) / g.bench }));
  const worst = withGap.sort((a, b) => a.gap - b.gap)[0];
  if (!worst || worst.gap >= 0) return null;

  return {
    stat: worst.stat,
    label: worst.label,
    playerVal: worst.fmt(worst.player),
    benchVal: worst.fmt(worst.bench),
  };
}
