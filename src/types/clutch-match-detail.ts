/** Rich match payload for /esports/match/[id] (synthetic depth when VLR has no box score API). */

export type ClutchMatchStatus = "live" | "upcoming" | "completed";

export type ClutchRoundOutcome =
  | "a_elim"
  | "b_elim"
  | "a_spike"
  | "b_defuse";

export type ClutchPlayerStatRow = {
  playerId: string;
  name: string;
  agentIcon: string | null;
  rating: number;
  acs: number;
  kills: number;
  deaths: number;
  assists: number;
  plusMinus: number;
  kastPct: number;
  adr: number;
  hsPct: number;
  fk: number;
  fd: number;
};

export type ClutchMatchMapDetail = {
  index: number;
  mapName: string;
  teamAScore: number;
  teamBScore: number;
  /** e.g. "(CT 7-5, T 6-3)" */
  halfSummary: string;
  rounds: Array<{ n: number; outcome: ClutchRoundOutcome; winner: "a" | "b" }>;
  economyA: number[];
  economyB: number[];
  teamAPlayers: ClutchPlayerStatRow[];
  teamBPlayers: ClutchPlayerStatRow[];
};

export type ClutchMatchDetailPayload = {
  ok: true;
  /** True when per-player / per-round data is generated for UI polish (VLR list feed has no box score). */
  demoStats: boolean;
  summary: {
    id: string;
    teamA: { name: string; score: number | null; won: boolean };
    teamB: { name: string; score: number | null; won: boolean };
    tournament: string;
    event: string;
    eventImg: string;
    status: ClutchMatchStatus;
    unixTimestamp: number | null;
    timeLabel: string;
    vodUrl: string | null;
  };
  maps: ClutchMatchMapDetail[];
};
