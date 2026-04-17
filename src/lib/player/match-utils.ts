import type { HenrikMatch, MatchPlayer } from "@/types/valorant";

export function getPlayerFromMatch(
  match: HenrikMatch,
  puuid: string
): MatchPlayer | undefined {
  return match.players.all_players.find((p) => p.puuid === puuid);
}
