import type { AgentStatRow } from "@/lib/player/build-profile-payload";
import { getPlayerFromMatch } from "@/lib/player/match-utils";
import { resolveAgentAsset, resolveMapAsset, type AgentAsset, type MapAsset } from "@/lib/valorant/game-assets";
import type { AgentStats } from "@/components/player/AgentsTable";
import type { HenrikMatch } from "@/types/valorant";

function isDeathmatch(mode: string): boolean {
  return mode.toLowerCase().includes("deathmatch");
}

type MapAgg = { games: number; wins: number; kills: number; deaths: number };
type AgentAgg = {
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  acsSum: number;
  acsCount: number;
  adrSum: number;
  adrCount: number;
  ddaSum: number;
  ddaCount: number;
  /** Estimated play time (ms), ~100s per round. */
  roundMs: number;
  mapStats: Map<string, MapAgg>;
};

function emptyAgentAgg(): AgentAgg {
  return {
    games: 0,
    wins: 0,
    kills: 0,
    deaths: 0,
    acsSum: 0,
    acsCount: 0,
    adrSum: 0,
    adrCount: 0,
    ddaSum: 0,
    ddaCount: 0,
    roundMs: 0,
    mapStats: new Map(),
  };
}

export function buildAgentsTableData(input: {
  agentRows: AgentStatRow[];
  henrikMatches: HenrikMatch[];
  puuid: string;
  mapsByKey: Map<string, MapAsset>;
  agentsByUuid: Map<string, AgentAsset>;
  agentsByName: Map<string, AgentAsset>;
}): AgentStats[] {
  const { agentRows, henrikMatches, puuid, mapsByKey, agentsByUuid, agentsByName } = input;
  const byAgent = new Map<string, AgentAgg>();

  for (const match of henrikMatches) {
    const player = getPlayerFromMatch(match, puuid);
    if (!player) continue;
    const mode = match.metadata.mode ?? "";
    if (isDeathmatch(mode)) continue;

    const asset = resolveAgentAsset(agentsByUuid, agentsByName, player.character);
    const agentName = asset?.displayName ?? player.character;

    const rounds = Math.max(match.metadata.rounds_played ?? 1, 1);
    const teamKey = player.team.toLowerCase() as "red" | "blue";
    const team = match.teams?.[teamKey];
    const won = (team?.rounds_won ?? 0) > (team?.rounds_lost ?? 0);

    const mk = player.stats.kills ?? 0;
    const md = player.stats.deaths ?? 0;
    const score = player.stats.score ?? 0;
    const acs = rounds > 0 && score > 0 ? score / rounds : 0;
    const dmgMade = player.damage_made ?? 0;
    const dmgRecv = player.damage_received ?? 0;
    const adr = rounds > 0 && dmgMade > 0 ? dmgMade / rounds : 0;
    const ddaRound = rounds > 0 ? (dmgMade - dmgRecv) / rounds : 0;

    const mapAsset = resolveMapAsset(mapsByKey, match.metadata.map);
    const mapName = mapAsset?.displayName ?? match.metadata.map ?? "Unknown";

    const agg = byAgent.get(agentName) ?? emptyAgentAgg();
    agg.games += 1;
    if (won) agg.wins += 1;
    agg.kills += mk;
    agg.deaths += md;
    if (acs > 0) {
      agg.acsSum += acs;
      agg.acsCount += 1;
    }
    if (adr > 0) {
      agg.adrSum += adr;
      agg.adrCount += 1;
    }
    if (rounds > 0 && (dmgMade > 0 || dmgRecv > 0)) {
      agg.ddaSum += ddaRound;
      agg.ddaCount += 1;
    }
    agg.roundMs += rounds * 100_000;

    const mAgg = agg.mapStats.get(mapName) ?? { games: 0, wins: 0, kills: 0, deaths: 0 };
    mAgg.games += 1;
    if (won) mAgg.wins += 1;
    mAgg.kills += mk;
    mAgg.deaths += md;
    agg.mapStats.set(mapName, mAgg);

    byAgent.set(agentName, agg);
  }

  return agentRows.map((row): AgentStats => {
    const asset = resolveAgentAsset(agentsByUuid, agentsByName, row.agentName);
    const name = row.agentName;
    const iconUrl = asset?.displayIcon ?? "";
    const portraitUrl = row.fullPortraitV2 || asset?.fullPortraitV2 || "";
    const role = asset?.roleDisplayName?.trim() || "Unknown";
    const roleIconUrl = asset?.roleIcon || undefined;

    const agg = byAgent.get(name);
    const kd = row.kd;
    const winRate = row.winRate;
    const matches = row.games;

    const acs = agg && agg.acsCount > 0 ? agg.acsSum / agg.acsCount : 0;
    const adr = agg && agg.adrCount > 0 ? agg.adrSum / agg.adrCount : 0;
    const dda = agg && agg.ddaCount > 0 ? agg.ddaSum / agg.ddaCount : undefined;

    const playtimeHours = agg ? agg.roundMs / 3_600_000 : (matches * 33 * 60) / 3_600_000;

    let bestMap: AgentStats["bestMap"];
    let mapBreakdown: AgentStats["mapBreakdown"];

    if (agg && agg.mapStats.size > 0) {
      const breakdown: NonNullable<AgentStats["mapBreakdown"]> = [];
      for (const [map, m] of Array.from(agg.mapStats.entries())) {
        const mAsset = resolveMapAsset(mapsByKey, map);
        const wr = m.games > 0 ? (m.wins / m.games) * 100 : 0;
        const mKd = m.deaths > 0 ? m.kills / m.deaths : m.kills;
        breakdown.push({
          map,
          iconUrl: mAsset?.listViewIcon || undefined,
          matches: m.games,
          winRate: wr,
          kd: parseFloat(mKd.toFixed(2)),
        });
      }
      breakdown.sort((a, b) => b.winRate - a.winRate || b.matches - a.matches);
      mapBreakdown = breakdown;

      const top = breakdown[0];
      if (top) {
        bestMap = {
          name: top.map,
          winRate: top.winRate,
          iconUrl: top.iconUrl,
        };
      }
    }

    return {
      agent: { name, iconUrl, portraitUrl, role, roleIconUrl },
      matches,
      winRate,
      kd,
      adr: parseFloat(adr.toFixed(1)),
      acs: parseFloat(acs.toFixed(0)),
      dda: dda !== undefined ? parseFloat(dda.toFixed(1)) : undefined,
      firstBloods: undefined,
      playtimeHours: parseFloat(playtimeHours.toFixed(1)),
      bestMap,
      mapBreakdown,
    };
  });
}
