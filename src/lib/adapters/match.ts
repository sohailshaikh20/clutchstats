import type { MatchRow } from "@/lib/player/build-profile-payload";
import type { GameMode, Match, MatchResult } from "@/types/profile-match-card";

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

export function matchRowsToMatches(rows: MatchRow[]): Match[] {
  return rows.map((row) => ({
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
    },
  }));
}
