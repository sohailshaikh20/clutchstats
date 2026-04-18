import type { MatchRow } from "@/lib/player/build-profile-payload";
import { getPlayerFromMatch } from "@/lib/player/match-utils";
import type { GameMode, Match, MatchResult } from "@/types/profile-match-card";
import type { HenrikMatch } from "@/types/valorant";

function gameStartToIso(gameStart: number): string {
  const sec = gameStart > 1e11 ? gameStart / 1000 : gameStart;
  return new Date(sec * 1000).toISOString();
}

function rowToGameMode(row: MatchRow): GameMode {
  const label = row.queueLabel.toLowerCase();
  if (row.filterQueue === "competitive") return "Competitive";
  if (row.filterQueue === "deathmatch") return "Deathmatch";
  if (label.includes("swiftplay")) return "Swiftplay";
  if (label.includes("spike")) return "Spikerush";
  if (label.includes("team") && label.includes("deathmatch")) return "TeamDeathmatch";
  if (row.filterQueue === "unrated") return "Unrated";
  return "Unrated";
}

function rowToResult(row: MatchRow): MatchResult {
  if (row.filterQueue === "deathmatch") return "draw";
  if (row.teamRounds === row.oppRounds) return "draw";
  return row.won ? "win" : "loss";
}

function firstBloodsInMatch(match: HenrikMatch, puuid: string): number {
  const kills = match.kills;
  if (!kills?.length) return 0;
  type K = NonNullable<HenrikMatch["kills"]>[number];
  const byRound = new Map<number, K[]>();
  for (const k of kills) {
    const r = k.round;
    const arr = byRound.get(r) ?? [];
    arr.push(k);
    byRound.set(r, arr);
  }
  let count = 0;
  for (const roundKills of Array.from(byRound.values())) {
    const sorted = [...roundKills].sort((a, b) => a.kill_time_in_round - b.kill_time_in_round);
    const first = sorted[0];
    if (first?.killer_puuid === puuid) count += 1;
  }
  return count;
}

function ddaPerRoundForMatch(match: HenrikMatch, puuid: string): number | undefined {
  const player = getPlayerFromMatch(match, puuid);
  if (!player) return undefined;
  const rounds = match.metadata.rounds_played;
  if (!rounds || rounds < 1) return undefined;
  const delta = (player.damage_made ?? 0) - (player.damage_received ?? 0);
  return delta / rounds;
}

export function matchRowsToMatches(
  rows: MatchRow[],
  henrikMatches?: HenrikMatch[],
  puuid?: string
): Match[] {
  const byId = new Map<string, HenrikMatch>();
  if (henrikMatches?.length && puuid) {
    for (const m of henrikMatches) {
      byId.set(m.metadata.matchid, m);
    }
  }

  return rows.map((row) => {
    const hm = puuid ? byId.get(row.matchId) : undefined;
    const fb = hm && puuid ? firstBloodsInMatch(hm, puuid) : undefined;
    const dda = hm && puuid ? ddaPerRoundForMatch(hm, puuid) : undefined;

    return {
      id: row.matchId,
      playedAtISO: gameStartToIso(row.gameStart),
      mode: rowToGameMode(row),
      map: row.mapName,
      agent: { name: row.agentName, iconUrl: row.agentIcon },
      result: rowToResult(row),
      score: { own: row.teamRounds, enemy: row.oppRounds },
      stats: {
        kills: row.kills,
        deaths: row.deaths,
        assists: row.assists,
        kd: row.kd,
        acs: row.combatScore,
        hsPct: row.headshotPct ?? 0,
        damagePerRound: row.damagePerRound ?? 0,
        ddaPerRound: dda,
        firstBloods: fb,
      },
    };
  });
}
