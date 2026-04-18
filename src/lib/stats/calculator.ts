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
  { kd: number; winRate: number; headshotPct: number; avgCombatScore: number; adr: number; kpr: number }
> = {
  iron:      { kd: 0.80, winRate: 48, headshotPct: 15, avgCombatScore: 130, adr: 110, kpr: 0.52 },
  bronze:    { kd: 0.85, winRate: 49, headshotPct: 17, avgCombatScore: 145, adr: 125, kpr: 0.58 },
  silver:    { kd: 0.90, winRate: 49, headshotPct: 19, avgCombatScore: 160, adr: 138, kpr: 0.62 },
  gold:      { kd: 0.95, winRate: 50, headshotPct: 21, avgCombatScore: 175, adr: 148, kpr: 0.66 },
  platinum:  { kd: 1.00, winRate: 50, headshotPct: 22, avgCombatScore: 190, adr: 158, kpr: 0.70 },
  diamond:   { kd: 1.05, winRate: 51, headshotPct: 24, avgCombatScore: 205, adr: 168, kpr: 0.74 },
  ascendant: { kd: 1.10, winRate: 52, headshotPct: 26, avgCombatScore: 220, adr: 178, kpr: 0.78 },
  immortal:  { kd: 1.15, winRate: 53, headshotPct: 28, avgCombatScore: 240, adr: 192, kpr: 0.84 },
  radiant:   { kd: 1.25, winRate: 55, headshotPct: 30, avgCombatScore: 270, adr: 210, kpr: 0.94 },
};

// ─── Output types ─────────────────────────────────────────────────────────────

export type AgentStat = {
  agent: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  kd: number;
  avgACS: number;
  // Premium extras
  headshotPct: number | null;
  avgDamagePerRound: number | null;
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

export type AcsPoint = {
  matchIndex: number;
  acs: number;
  date: number;
};

export type WinRateTrendPoint = {
  matchIndex: number;
  winRate: number; // cumulative win-rate up to this match (%)
};

export type ModeBreakdown = {
  mode: string;
  games: number;
  wins: number;
  winRate: number;
  avgKD: number;
};

export type AbilityCastStats = {
  c: number;  // average C-ability casts per match
  q: number;  // average Q-ability casts per match
  e: number;  // average E-ability casts per match
  x: number;  // average Ultimate casts per match
  total: number; // average total casts per match
};

export type StatPercentile = {
  value: number;
  percentile: number; // estimated 0–100
};

export type FreeStats = {
  kd: number;
  kda: number;          // (kills + assists) / deaths
  winRate: number;
  headshotPercent: number;
  bodyshotPercent: number;
  legshotPercent: number;
  avgCombatScore: number;
  wins: number;
  losses: number;
  totalGames: number;
  topAgents: AgentStat[];
  mapStats: MapStat[];
  recentKDTrend: KdPoint[];
  mostPlayedAgent: string | null;
  mostPlayedMap: string | null;
  mostPlayedMode: string | null;
  bestMatchKD: number | null;
  worstMatchKD: number | null;
};

export type PerformancePercentile = {
  kd: StatPercentile;
  winRate: StatPercentile;
  headshotPct: StatPercentile;
  avgCombatScore: StatPercentile;
  adr: StatPercentile;
  kpr: StatPercentile;
};

export type PremiumStats = {
  // Damage
  avgDamagePerRound: number;
  avgDamageReceived: number;
  damageDelta: number;  // dealt - received per round

  // Per-round rates
  killsPerRound: number;
  assistsPerRound: number;
  deathsPerRound: number;

  // Ability casts (unique to ClutchStats)
  abilityCasts: AbilityCastStats | null;

  // Consistency
  kdStdDev: number;
  consistencyRating: string; // "Very Consistent" | "Consistent" | "Moderate" | "Volatile"

  // Streaks
  firstBloodRate: number | null;
  firstDeathRate: number | null;
  winStreaks: { current: number; longest: number };

  // Advanced trends
  acsTrend: AcsPoint[];
  winRateTrend: WinRateTrendPoint[];
  modeBreakdown: ModeBreakdown[];

  // Percentile vs. peers
  performancePercentile: PerformancePercentile | null;
  rankName: string | null;

  // Time
  totalPlayTimeMinutes: number;
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
  const ratio = direction === "higher" ? playerVal / benchVal : benchVal / playerVal;
  const clamped = Math.min(Math.max(ratio, 0.5), 1.75);
  return Math.round(((clamped - 0.5) / 1.25) * 90 + 5);
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function consistencyLabel(sd: number): string {
  if (sd < 0.25) return "Very Consistent";
  if (sd < 0.45) return "Consistent";
  if (sd < 0.70) return "Moderate";
  return "Volatile";
}

function normMode(mode: string): string {
  const m = mode.toLowerCase();
  if (m.includes("competitive")) return "competitive";
  if (m.includes("unrated")) return "unrated";
  if (m.includes("deathmatch")) return "deathmatch";
  if (m.includes("spike rush") || m.includes("spikerush")) return "spike rush";
  if (m.includes("escalation")) return "escalation";
  if (m.includes("swiftplay") || m.includes("swift play")) return "swift play";
  if (m.includes("team deathmatch")) return "team deathmatch";
  return mode.toLowerCase();
}

// ─── Main calculator ──────────────────────────────────────────────────────────

export function calculatePlayerStats(
  matches: HenrikMatch[],
  puuid: string,
  currentRankPatched?: string | null
): PlayerStats {
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalHeadshots = 0;
  let totalBodyshots = 0;
  let totalLegshots = 0;
  let acsSum = 0;
  let acsCount = 0;
  let wins = 0;
  let losses = 0;
  let totalDamageDealt = 0;
  let totalDamageReceived = 0;
  let totalRounds = 0;
  let totalPlayTimeMs = 0;

  // Ability cast totals
  let abilityCastGames = 0;
  let castC = 0, castQ = 0, castE = 0, castX = 0;

  const agentMap = new Map<
    string,
    { games: number; wins: number; kills: number; deaths: number; assists: number; acsSum: number; acsCount: number; hs: number; shots: number; dmg: number; rounds: number }
  >();
  const mapMap = new Map<
    string,
    { games: number; wins: number; killsSum: number; deathsSum: number }
  >();
  const modeMap = new Map<
    string,
    { games: number; wins: number; killsSum: number; deathsSum: number }
  >();

  const kdTrend: KdPoint[] = [];
  const acsTrend: AcsPoint[] = [];
  const winRateTrend: WinRateTrendPoint[] = [];
  const perMatchKDs: number[] = [];

  let bestMatchKD: number | null = null;
  let worstMatchKD: number | null = null;

  // Sort oldest first for trend calculations
  const chronoMatches = [...matches].sort(
    (a, b) => (a.metadata.game_start ?? 0) - (b.metadata.game_start ?? 0)
  );

  // Streak tracking
  let currentStreak = 0;
  let longestStreak = 0;
  let streakSign = 0;

  // Cumulative win tracking for trend
  let cumulativeWins = 0;
  let cumulativeGames = 0;

  for (const match of chronoMatches) {
    const player = getPlayer(match, puuid);
    if (!player) continue;

    const mode = match.metadata.mode ?? "";
    const dm = isDeathmatch(mode);
    const rounds = Math.max(match.metadata.rounds_played ?? 1, 1);
    const gameStart = match.metadata.game_start ?? 0;

    // Round time: ~1 min 40s per round on average (100s)
    totalPlayTimeMs += rounds * 100_000;

    const mk = player.stats.kills ?? 0;
    const md = player.stats.deaths ?? 0;
    const ma = player.stats.assists ?? 0;
    totalKills += mk;
    totalDeaths += md;
    totalAssists += ma;

    const matchKD = md > 0 ? mk / md : mk;

    // Mode breakdown (all modes)
    const modeKey = normMode(mode);
    const prevMode = modeMap.get(modeKey) ?? { games: 0, wins: 0, killsSum: 0, deathsSum: 0 };
    prevMode.games += 1;
    prevMode.killsSum += mk;
    prevMode.deathsSum += md;

    if (!dm) {
      const teamKey = player.team.toLowerCase() as "red" | "blue";
      const team = match.teams?.[teamKey];
      const won = (team?.rounds_won ?? 0) > (team?.rounds_lost ?? 0);

      if (won) {
        wins += 1;
        prevMode.wins += 1;
        currentStreak = streakSign === 1 ? currentStreak + 1 : 1;
        streakSign = 1;
      } else {
        losses += 1;
        currentStreak = streakSign === -1 ? currentStreak + 1 : 1;
        streakSign = -1;
      }
      if (streakSign === 1 && currentStreak > longestStreak) longestStreak = currentStreak;

      // Cumulative win-rate trend
      cumulativeGames += 1;
      if (won) cumulativeWins += 1;
      winRateTrend.push({
        matchIndex: winRateTrend.length + 1,
        winRate: parseFloat(((cumulativeWins / cumulativeGames) * 100).toFixed(1)),
      });

      // Shot breakdown
      const hs = player.stats.headshots ?? 0;
      const bs = player.stats.bodyshots ?? 0;
      const ls = player.stats.legshots ?? 0;
      const shots = hs + bs + ls;
      if (shots > 0) {
        totalHeadshots += hs;
        totalBodyshots += bs;
        totalLegshots += ls;
      }

      // ACS
      const acs = rounds > 0 ? (player.stats.score ?? 0) / rounds : 0;
      if (acs > 0) {
        acsSum += acs;
        acsCount += 1;
        acsTrend.push({
          matchIndex: acsTrend.length + 1,
          acs: parseFloat(acs.toFixed(0)),
          date: gameStart,
        });
      }

      // Damage
      const dmgMade = player.damage_made ?? 0;
      const dmgReceived = player.damage_received ?? 0;
      if (dmgMade > 0 || dmgReceived > 0) {
        totalDamageDealt += dmgMade;
        totalDamageReceived += dmgReceived;
        totalRounds += rounds;
      }

      // KD trend (non-deathmatch only)
      perMatchKDs.push(matchKD);
      kdTrend.push({
        matchIndex: kdTrend.length + 1,
        kd: parseFloat(matchKD.toFixed(2)),
        date: gameStart,
      });

      if (bestMatchKD === null || matchKD > bestMatchKD) bestMatchKD = parseFloat(matchKD.toFixed(2));
      if (worstMatchKD === null || matchKD < worstMatchKD) worstMatchKD = parseFloat(matchKD.toFixed(2));

      // Agent aggregation
      const agentKey = player.character;
      const prev = agentMap.get(agentKey) ?? { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0, acsSum: 0, acsCount: 0, hs: 0, shots: 0, dmg: 0, rounds: 0 };
      prev.games += 1;
      if (won) prev.wins += 1;
      prev.kills += mk;
      prev.deaths += md;
      prev.assists += ma;
      if (acs > 0) { prev.acsSum += acs; prev.acsCount += 1; }
      if (shots > 0) { prev.hs += hs; prev.shots += shots; }
      if (dmgMade > 0) { prev.dmg += dmgMade; prev.rounds += rounds; }
      agentMap.set(agentKey, prev);

      // Map aggregation
      const mapKey = match.metadata.map ?? "Unknown";
      const prevM = mapMap.get(mapKey) ?? { games: 0, wins: 0, killsSum: 0, deathsSum: 0 };
      prevM.games += 1;
      if (won) prevM.wins += 1;
      prevM.killsSum += mk;
      prevM.deathsSum += md;
      mapMap.set(mapKey, prevM);

      // Ability casts (Henrik: player.ability_casts)
      const ac = (player as { ability_casts?: { c_cast?: number; q_cast?: number; e_cast?: number; x_cast?: number } }).ability_casts;
      if (ac) {
        abilityCastGames += 1;
        castC += ac.c_cast ?? 0;
        castQ += ac.q_cast ?? 0;
        castE += ac.e_cast ?? 0;
        castX += ac.x_cast ?? 0;
      }
    } else {
      // Deathmatch: still count mode wins (DM has no team win, skip)
    }

    modeMap.set(modeKey, prevMode);
  }

  const totalShotsFired = totalHeadshots + totalBodyshots + totalLegshots;
  const totalGames = wins + losses;
  const kd = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;
  const kda = totalDeaths > 0 ? (totalKills + totalAssists) / totalDeaths : totalKills + totalAssists;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
  const headshotPercent = totalShotsFired > 0 ? (totalHeadshots / totalShotsFired) * 100 : 0;
  const bodyshotPercent = totalShotsFired > 0 ? (totalBodyshots / totalShotsFired) * 100 : 0;
  const legshotPercent = totalShotsFired > 0 ? (totalLegshots / totalShotsFired) * 100 : 0;
  const avgCombatScore = acsCount > 0 ? acsSum / acsCount : 0;
  const avgDamagePerRound = totalRounds > 0 ? totalDamageDealt / totalRounds : 0;
  const avgDamageReceived = totalRounds > 0 ? totalDamageReceived / totalRounds : 0;
  const damageDelta = avgDamagePerRound - avgDamageReceived;
  const killsPerRound = totalRounds > 0 ? totalKills / totalRounds : 0;
  const assistsPerRound = totalRounds > 0 ? totalAssists / totalRounds : 0;
  const deathsPerRound = totalRounds > 0 ? totalDeaths / totalRounds : 0;

  // KD std dev → consistency
  const kdSD = stdDev(perMatchKDs);
  const consistencyRating = consistencyLabel(kdSD);

  // Ability casts
  const abilityCasts: AbilityCastStats | null =
    abilityCastGames > 0
      ? {
          c: parseFloat((castC / abilityCastGames).toFixed(2)),
          q: parseFloat((castQ / abilityCastGames).toFixed(2)),
          e: parseFloat((castE / abilityCastGames).toFixed(2)),
          x: parseFloat((castX / abilityCastGames).toFixed(2)),
          total: parseFloat(((castC + castQ + castE + castX) / abilityCastGames).toFixed(2)),
        }
      : null;

  // Top agents
  const topAgents: AgentStat[] = Array.from(agentMap.entries())
    .filter(([, v]) => v.games >= 2)
    .map(([agent, v]) => ({
      agent,
      gamesPlayed: v.games,
      wins: v.wins,
      winRate: v.games > 0 ? parseFloat(((v.wins / v.games) * 100).toFixed(1)) : 0,
      kd: v.deaths > 0 ? parseFloat((v.kills / v.deaths).toFixed(2)) : v.kills,
      avgACS: v.acsCount > 0 ? parseFloat((v.acsSum / v.acsCount).toFixed(0)) : 0,
      headshotPct: v.shots > 0 ? parseFloat(((v.hs / v.shots) * 100).toFixed(1)) : null,
      avgDamagePerRound: v.rounds > 0 ? parseFloat((v.dmg / v.rounds).toFixed(1)) : null,
    }))
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
    .slice(0, 5);

  // Map stats
  const mapStats: MapStat[] = Array.from(mapMap.entries())
    .map(([map, v]) => ({
      map,
      gamesPlayed: v.games,
      wins: v.wins,
      winRate: v.games > 0 ? parseFloat(((v.wins / v.games) * 100).toFixed(1)) : 0,
      avgKD: v.deathsSum > 0 ? parseFloat((v.killsSum / v.deathsSum).toFixed(2)) : v.killsSum,
    }))
    .sort((a, b) => b.gamesPlayed - a.gamesPlayed);

  // Mode breakdown
  const modeBreakdown: ModeBreakdown[] = Array.from(modeMap.entries())
    .filter(([, v]) => v.games > 0)
    .map(([mode, v]) => ({
      mode,
      games: v.games,
      wins: v.wins,
      winRate: v.games > 0 ? parseFloat(((v.wins / v.games) * 100).toFixed(1)) : 0,
      avgKD: v.deathsSum > 0 ? parseFloat((v.killsSum / v.deathsSum).toFixed(2)) : v.killsSum,
    }))
    .sort((a, b) => b.games - a.games);

  // Recent KD trend — last 10 non-deathmatch matches
  const recentKDTrend = kdTrend.slice(-10).map((p, i) => ({ ...p, matchIndex: i + 1 }));

  // Most played
  const mostPlayedAgent = topAgents[0]?.agent ?? null;
  const mostPlayedMap = mapStats[0]?.map ?? null;
  const mostPlayedMode = modeBreakdown[0]?.mode ?? null;

  // Win current streak
  const winCurrentStreak = streakSign === 1 ? currentStreak : 0;

  // Performance percentile
  let performancePercentile: PerformancePercentile | null = null;
  if (currentRankPatched) {
    const rankKey = normRankName(currentRankPatched);
    const bench = RANK_BENCHMARKS[rankKey];
    if (bench) {
      performancePercentile = {
        kd: { value: parseFloat(kd.toFixed(2)), percentile: percentileWithinRank(kd, bench.kd) },
        winRate: { value: parseFloat(winRate.toFixed(1)), percentile: percentileWithinRank(winRate, bench.winRate) },
        headshotPct: { value: parseFloat(headshotPercent.toFixed(1)), percentile: percentileWithinRank(headshotPercent, bench.headshotPct) },
        avgCombatScore: { value: parseFloat(avgCombatScore.toFixed(0)), percentile: percentileWithinRank(avgCombatScore, bench.avgCombatScore) },
        adr: { value: parseFloat(avgDamagePerRound.toFixed(1)), percentile: percentileWithinRank(avgDamagePerRound, bench.adr) },
        kpr: { value: parseFloat(killsPerRound.toFixed(3)), percentile: percentileWithinRank(killsPerRound, bench.kpr) },
      };
    }
  }

  return {
    matchCount: matches.length,
    free: {
      kd: parseFloat(kd.toFixed(2)),
      kda: parseFloat(kda.toFixed(2)),
      winRate: parseFloat(winRate.toFixed(1)),
      headshotPercent: parseFloat(headshotPercent.toFixed(1)),
      bodyshotPercent: parseFloat(bodyshotPercent.toFixed(1)),
      legshotPercent: parseFloat(legshotPercent.toFixed(1)),
      avgCombatScore: parseFloat(avgCombatScore.toFixed(0)),
      wins,
      losses,
      totalGames,
      topAgents,
      mapStats,
      recentKDTrend,
      mostPlayedAgent,
      mostPlayedMap,
      mostPlayedMode,
      bestMatchKD,
      worstMatchKD,
    },
    premium: {
      avgDamagePerRound: parseFloat(avgDamagePerRound.toFixed(1)),
      avgDamageReceived: parseFloat(avgDamageReceived.toFixed(1)),
      damageDelta: parseFloat(damageDelta.toFixed(1)),
      killsPerRound: parseFloat(killsPerRound.toFixed(3)),
      assistsPerRound: parseFloat(assistsPerRound.toFixed(3)),
      deathsPerRound: parseFloat(deathsPerRound.toFixed(3)),
      abilityCasts,
      kdStdDev: parseFloat(kdSD.toFixed(3)),
      consistencyRating,
      firstBloodRate: null, // Henrik doesn't expose per-round first-blood data
      firstDeathRate: null,
      winStreaks: { current: winCurrentStreak, longest: longestStreak },
      acsTrend: acsTrend.slice(-20),
      winRateTrend: winRateTrend.slice(-20),
      modeBreakdown,
      performancePercentile,
      rankName: currentRankPatched ?? null,
      totalPlayTimeMinutes: Math.round(totalPlayTimeMs / 60_000),
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
