import { henrikTierToApiTier } from "@/lib/valorant/landing-assets";
import {
  resolveAgentAsset,
  resolveMapAsset,
  valorantColorToCss,
  type AgentAsset,
  type MapAsset,
  type TierAsset,
} from "@/lib/valorant/game-assets";
import { getRankByTier } from "@/lib/constants/ranks";
import type {
  HenrikAccount,
  HenrikMatch,
  HenrikMMRResponse,
  ValorantRegion,
} from "@/types/valorant";
import { getPlayerFromMatch } from "./match-utils";

export type QueueFilter = "competitive" | "unrated" | "all";

export type MatchRow = {
  matchId: string;
  mapName: string;
  mapSplash: string;
  agentName: string;
  agentIcon: string;
  queueLabel: string;
  filterQueue: "competitive" | "unrated" | "other";
  won: boolean;
  teamRounds: number;
  oppRounds: number;
  kills: number;
  deaths: number;
  assists: number;
  kd: number;
  combatScore: number;
  gameStart: number;
};

export type AgentStatRow = {
  agentName: string;
  fullPortraitV2: string;
  roleIcon: string;
  games: number;
  wins: number;
  winRate: number;
  kd: number;
};

export type MapStatRow = {
  mapName: string;
  listViewIcon: string;
  games: number;
  wins: number;
  winRate: number;
};

export type PlayerProfilePayload = {
  riotName: string;
  riotTag: string;
  region: ValorantRegion;
  regionFlag: string;
  accountLevel: number;
  cardWide: string;
  puuid: string;
  currentRank: {
    name: string;
    tier: number;
    rr: number;
    mmrDelta: number;
    largeIconUrl: string | null;
    glowColor: string | null;
  };
  peakRank: {
    patched: string;
    tier: number;
    largeIconUrl: string | null;
  };
  matches: MatchRow[];
  stats: {
    kdRatio: number;
    winRate: number;
    headshotPct: number;
    avgCombatScore: number;
    wins: number;
    losses: number;
    total: number;
  };
  agents: AgentStatRow[];
  maps: MapStatRow[];
};

const REGION_FLAGS: Record<string, string> = {
  na: "🌎",
  eu: "🇪🇺",
  ap: "🌏",
  kr: "🇰🇷",
  latam: "🌎",
  br: "🇧🇷",
};

function classifyQueue(queue: string): "competitive" | "unrated" | "other" {
  const q = (queue || "").toLowerCase();
  if (q === "competitive" || q.includes("competitive")) return "competitive";
  if (q === "unrated" || q.includes("unrated") || q.includes("swiftplay"))
    return "unrated";
  return "other";
}

function queueLabel(queue: string, mode: string): string {
  const q = (queue || mode || "").toLowerCase();
  if (q.includes("competitive")) return "Competitive";
  if (q.includes("unrated")) return "Unrated";
  if (q.includes("spike")) return "Spike Rush";
  if (q.includes("deathmatch")) return "Deathmatch";
  if (q.includes("escalation")) return "Escalation";
  if (q.includes("replication")) return "Replication";
  if (q.includes("swiftplay")) return "Swiftplay";
  if (q.includes("premier")) return "Premier";
  return mode || queue || "Unknown";
}

function tierLargeUrl(
  tierByApiTier: Map<number, TierAsset>,
  henrikTier: number
): string | null {
  const api = henrikTierToApiTier(henrikTier);
  return tierByApiTier.get(api)?.largeIcon ?? null;
}

function tierGlowColor(
  tierByApiTier: Map<number, TierAsset>,
  henrikTier: number
): string | null {
  const api = henrikTierToApiTier(henrikTier);
  const hex = tierByApiTier.get(api)?.color;
  return valorantColorToCss(hex);
}

export function buildPlayerProfilePayload(
  account: HenrikAccount,
  mmr: HenrikMMRResponse,
  matches: HenrikMatch[],
  assets: {
    mapsByKey: Map<string, MapAsset>;
    agentsByUuid: Map<string, AgentAsset>;
    agentsByName: Map<string, AgentAsset>;
    tierByApiTier: Map<number, TierAsset>;
  }
): PlayerProfilePayload {
  const puuid = account.puuid;
  const region = account.region.toLowerCase() as ValorantRegion;
  const regionFlag = REGION_FLAGS[region] ?? "🎮";

  const cur = mmr.current_data;
  const peak = mmr.highest_rank;

  const matchRows: MatchRow[] = [];
  let wins = 0;
  let losses = 0;
  let kills = 0;
  let deaths = 0;
  let headshots = 0;
  let shots = 0;
  let acsSum = 0;
  let acsCount = 0;

  const agentAgg = new Map<
    string,
    { games: number; wins: number; kills: number; deaths: number; asset: AgentAsset | null }
  >();
  const mapAgg = new Map<
    string,
    { games: number; wins: number; asset: MapAsset | null }
  >();

  for (const match of matches) {
    const player = getPlayerFromMatch(match, puuid);
    if (!player) continue;

    const teamKey = player.team.toLowerCase() as "red" | "blue";
    const team = match.teams[teamKey];
    const won = team?.has_won ?? false;
    const teamRounds = team?.rounds_won ?? 0;
    const oppRounds = team?.rounds_lost ?? 0;
    const rounds = match.metadata.rounds_played || 1;

    const fq = classifyQueue(match.metadata.queue);
    const useForStats = fq === "competitive" || fq === "unrated";
    const acs = rounds > 0 ? player.stats.score / rounds : 0;

    if (useForStats) {
      if (won) wins += 1;
      else losses += 1;
      kills += player.stats.kills;
      deaths += player.stats.deaths;
      headshots += player.stats.headshots;
      shots +=
        player.stats.headshots + player.stats.bodyshots + player.stats.legshots;

      if (rounds > 0) {
        acsSum += acs;
        acsCount += 1;
      }
    }

    const mapAsset = resolveMapAsset(assets.mapsByKey, match.metadata.map);
    const agentAsset = resolveAgentAsset(
      assets.agentsByUuid,
      assets.agentsByName,
      player.character
    );

    const agentName = agentAsset?.displayName ?? player.character;
    const agentIcon =
      agentAsset?.displayIcon ?? player.assets?.agent?.small ?? "";

    const mapSplash = mapAsset?.splash ?? "";
    const mapName = mapAsset?.displayName ?? match.metadata.map;

    const kd =
      player.stats.deaths > 0
        ? player.stats.kills / player.stats.deaths
        : player.stats.kills;

    matchRows.push({
      matchId: match.metadata.matchid,
      mapName,
      mapSplash,
      agentName,
      agentIcon,
      queueLabel: queueLabel(match.metadata.queue, match.metadata.mode),
      filterQueue: fq,
      won,
      teamRounds,
      oppRounds,
      kills: player.stats.kills,
      deaths: player.stats.deaths,
      assists: player.stats.assists,
      kd,
      combatScore: acs,
      gameStart: match.metadata.game_start,
    });

    if (useForStats) {
      const aKey = agentName;
      const prevA = agentAgg.get(aKey) ?? {
        games: 0,
        wins: 0,
        kills: 0,
        deaths: 0,
        asset: agentAsset,
      };
      prevA.games += 1;
      if (won) prevA.wins += 1;
      prevA.kills += player.stats.kills;
      prevA.deaths += player.stats.deaths;
      prevA.asset = prevA.asset ?? agentAsset;
      agentAgg.set(aKey, prevA);

      const mKey = mapName;
      const prevM = mapAgg.get(mKey) ?? { games: 0, wins: 0, asset: mapAsset };
      prevM.games += 1;
      if (won) prevM.wins += 1;
      prevM.asset = prevM.asset ?? mapAsset;
      mapAgg.set(mKey, prevM);
    }
  }

  const totalRanked = wins + losses;
  const kdRatio = deaths > 0 ? kills / deaths : kills;
  const winRate = totalRanked > 0 ? (wins / totalRanked) * 100 : 0;
  const headshotPct = shots > 0 ? (headshots / shots) * 100 : 0;
  const avgCombatScore = acsCount > 0 ? acsSum / acsCount : 0;

  const agents: AgentStatRow[] = Array.from(agentAgg.entries())
    .map(([agentName, v]) => {
      const kd = v.deaths > 0 ? v.kills / v.deaths : v.kills;
      return {
        agentName,
        fullPortraitV2: v.asset?.fullPortraitV2 ?? "",
        roleIcon: v.asset?.roleIcon ?? "",
        games: v.games,
        wins: v.wins,
        winRate: v.games > 0 ? (v.wins / v.games) * 100 : 0,
        kd,
      };
    })
    .filter((a) => a.games >= 2)
    .sort((a, b) => b.games - a.games);

  const maps: MapStatRow[] = Array.from(mapAgg.entries())
    .map(([mapName, v]) => ({
      mapName,
      listViewIcon: v.asset?.listViewIcon ?? "",
      games: v.games,
      wins: v.wins,
      winRate: v.games > 0 ? (v.wins / v.games) * 100 : 0,
    }))
    .sort((a, b) => b.games - a.games);

  matchRows.sort((a, b) => b.gameStart - a.gameStart);

  return {
    riotName: account.name,
    riotTag: account.tag,
    region,
    regionFlag,
    accountLevel: account.account_level,
    cardWide: account.card.wide,
    puuid,
    currentRank: {
      name: cur.currenttierpatched || getRankByTier(cur.currenttier).name,
      tier: cur.currenttier,
      rr: cur.ranking_in_tier,
      mmrDelta: cur.mmr_change_to_last_game,
      largeIconUrl: tierLargeUrl(assets.tierByApiTier, cur.currenttier),
      glowColor:
        tierGlowColor(assets.tierByApiTier, cur.currenttier) ??
        getRankByTier(cur.currenttier).color,
    },
    peakRank: {
      patched: peak.patched_tier,
      tier: peak.tier,
      largeIconUrl: tierLargeUrl(assets.tierByApiTier, peak.tier),
    },
    matches: matchRows,
    stats: {
      kdRatio,
      winRate,
      headshotPct,
      avgCombatScore,
      wins,
      losses,
      total: totalRanked,
    },
    agents,
    maps,
  };
}

export function isPrivacyHenrikError(message: string, status: number): boolean {
  if (status !== 403 && status !== 404) return false;
  const m = message.toLowerCase();
  return (
    m.includes("private") ||
    m.includes("hidden") ||
    (m.includes("riot") && m.includes("setting")) ||
    m.includes("not allowed") ||
    m.includes("collection") ||
    m.includes("forbidden")
  );
}
