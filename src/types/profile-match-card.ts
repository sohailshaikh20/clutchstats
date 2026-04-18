export type MatchResult = "win" | "loss" | "draw";

export type GameMode =
  | "Competitive"
  | "Unrated"
  | "Deathmatch"
  | "Swiftplay"
  | "TeamDeathmatch"
  | "Spikerush";

export interface Match {
  id: string;
  playedAtISO: string;
  mode: GameMode;
  map: string;
  mapIconUrl?: string;
  agent: { name: string; iconUrl: string };
  result: MatchResult;
  score: { own: number; enemy: number };
  stats: {
    kills: number;
    deaths: number;
    assists: number;
    kd: number;
    acs: number;
    hsPct: number;
    damagePerRound: number;
    /** Damage dealt minus absorbed, per round (Henrik). */
    ddaPerRound?: number;
    firstBloods?: number;
    multiKills?: number;
  };
  roundByRound?: Array<{ round: number; kills: number; deaths: number; result: "W" | "L" }>;
  topEnemies?: Array<{ name: string; tag: string; killsAgainst: number; deathsFrom: number }>;
}
