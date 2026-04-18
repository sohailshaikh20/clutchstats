import type { ProfileHeaderData } from "@/components/player/ProfileHeader";
import type { HeadlineStat } from "@/components/player/profile/StatPill";
import type { MatchRow, PlayerProfilePayload } from "@/lib/player/build-profile-payload";
import type { PlayerStats } from "@/lib/stats/calculator";
import type { HenrikMMRResponse } from "@/types/valorant";

function trendDirection(trend: number[]): "up" | "down" | "flat" {
  if (trend.length < 2) return "flat";
  const a = trend[0];
  const b = trend[trend.length - 1];
  if (b > a * 1.02) return "up";
  if (b < a * 0.98) return "down";
  return "flat";
}

function chronoLast(matches: MatchRow[], n: number): MatchRow[] {
  const nonDm = matches.filter((m) => m.filterQueue !== "deathmatch");
  return [...nonDm].sort((a, b) => a.gameStart - b.gameStart).slice(-n);
}

function buildSession(matches: MatchRow[]): ProfileHeaderData["session"] | undefined {
  if (!matches.length) return undefined;
  const nowSec = Date.now() / 1000;
  let last = 0;
  let c24 = 0;
  let w24 = 0;
  let l24 = 0;
  for (const m of matches) {
    if (m.gameStart > last) last = m.gameStart;
    if (nowSec - m.gameStart > 86400) continue;
    c24 += 1;
    if (m.filterQueue === "deathmatch") continue;
    if (m.won) w24 += 1;
    else l24 += 1;
  }
  const lastSeenISO = new Date(last > 1e11 ? last : last * 1000).toISOString();
  return { matchesLast24h: c24, wins24h: w24, losses24h: l24, lastSeenISO };
}

export function buildProfileHeaderData(
  payload: PlayerProfilePayload,
  statsCalc: PlayerStats,
  mmr: HenrikMMRResponse,
  matches: MatchRow[]
): ProfileHeaderData {
  const stats = {
    kd: statsCalc.free.kd,
    winRate: statsCalc.free.winRate,
    acs: statsCalc.free.avgCombatScore,
    adr: statsCalc.premium.avgDamagePerRound,
    hsPct: statsCalc.free.headshotPercent,
  };

  // TODO(clutch-rating-v1): replace with real backend composite
  const clutchRating = Math.round(
    Math.min(1000, stats.kd * 200 + stats.winRate * 5 + stats.acs * 1.2)
  );
  const clutchPercentile = Math.min(99.9, 60 + (stats.kd - 1) * 30);
  const clutchDelta = Math.round((stats.kd - 1) * 8);

  const perf = statsCalc.premium.performancePercentile;

  const kdTrend = chronoLast(matches, 10).map((m) => m.kd);
  const adrTrend = chronoLast(matches, 10).map(
    (m) => m.damagePerRound ?? stats.adr
  );
  const hsTrend = chronoLast(matches, 10).map((m) => m.headshotPct ?? stats.hsPct);
  const wrBits = chronoLast(matches, 10).map((m) => (m.won ? 1 : 0));
  const wrTrend =
    wrBits.length >= 2
      ? wrBits.map((_, i) => {
          const slice = wrBits.slice(0, i + 1);
          return (slice.filter((x) => x === 1).length / slice.length) * 100;
        })
      : [stats.winRate * 0.95, stats.winRate];

  const headlineStats: HeadlineStat[] = [
    {
      key: "kd",
      label: "K/D Ratio",
      value: stats.kd.toFixed(2),
      percentile: perf?.kd.percentile ?? 75,
      delta: 0,
      trend: kdTrend.length >= 2 ? kdTrend : [stats.kd * 0.9, stats.kd],
      trendDirection: trendDirection(kdTrend.length >= 2 ? kdTrend : [stats.kd * 0.9, stats.kd]),
    },
    {
      key: "adr",
      label: "Damage/Round",
      value: stats.adr.toFixed(1),
      percentile: perf?.adr.percentile ?? 70,
      delta: 0,
      trend: adrTrend.length >= 2 ? adrTrend : [stats.adr * 0.95, stats.adr],
      trendDirection: trendDirection(adrTrend.length >= 2 ? adrTrend : [stats.adr * 0.95, stats.adr]),
    },
    {
      key: "hs",
      label: "Headshot %",
      value: stats.hsPct.toFixed(1) + "%",
      percentile: perf?.headshotPct.percentile ?? 55,
      delta: 0,
      trend: hsTrend.length >= 2 ? hsTrend : [stats.hsPct * 0.9, stats.hsPct],
      trendDirection: trendDirection(hsTrend.length >= 2 ? hsTrend : [stats.hsPct * 0.9, stats.hsPct]),
    },
    {
      key: "winrate",
      label: "Win Rate",
      value: stats.winRate.toFixed(1) + "%",
      percentile: perf?.winRate.percentile ?? 65,
      delta: 0,
      trend: wrTrend.length >= 2 ? wrTrend : [stats.winRate * 0.95, stats.winRate],
      trendDirection: trendDirection(wrTrend.length >= 2 ? wrTrend : [stats.winRate * 0.95, stats.winRate]),
    },
  ];

  const top = payload.agents[0];
  const topAgent = top
    ? {
        name: top.agentName,
        splashUrl: top.fullPortraitV2,
        playtimeHours: Math.round(top.games * 0.65 * 10) / 10,
        matches: top.games,
      }
    : { name: "Unknown", splashUrl: "", playtimeHours: 0, matches: 0 };

  const isDemoProfile =
    payload.riotName.toLowerCase() === "cb10" &&
    payload.riotTag.toLowerCase() === "aegon";

  return {
    name: payload.riotName,
    tag: payload.riotTag,
    region: payload.region,
    countryCode: undefined,
    playerCardWideUrl: payload.cardWide,
    level: payload.accountLevel,
    currentTier: mmr.current_data.currenttierpatched || payload.currentRank.name,
    currentRR: payload.currentRank.rr,
    currentRRDelta: payload.currentRank.mmrDelta,
    leaderboardRank: isDemoProfile ? 1 : undefined,
    peakTier: payload.peakRank.patched,
    peakRR: undefined,
    peakEpisode: undefined,
    topAgent,
    clutchRating,
    clutchPercentile,
    clutchDelta,
    headlineStats,
    session: buildSession(matches),
    isOnline: false,
    isStreaming: false,
    regionFlag: payload.regionFlag,
  };
}
