import type { HenrikMMRResponse } from "@/types/valorant";

export function defaultMmrResponse(): HenrikMMRResponse {
  return {
    current_data: {
      currenttier: 0,
      currenttierpatched: "Unrated",
      ranking_in_tier: 0,
      mmr_change_to_last_game: 0,
      elo: 0,
      games_needed_for_rating: 0,
      old: false,
    },
    highest_rank: {
      patched_tier: "Unrated",
      tier: 0,
      season: "",
    },
    by_season: {},
  };
}
