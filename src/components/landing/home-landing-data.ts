export type HeroLiveRow = {
  status: "live";
  league: string;
  leagueKey: "amer" | "emea" | "pac" | "chl";
  teamA: { abbr: string; score: number };
  teamB: { abbr: string; score: number };
  map: number;
  currentScore: string;
};

export type HeroUpcomingRow = {
  status: "upcoming";
  league: string;
  leagueKey: "amer" | "emea" | "pac" | "chl";
  teamA: { abbr: string };
  teamB: { abbr: string };
  startsIn: string;
  date: string;
};

export type HeroFeedEntry = HeroLiveRow | HeroUpcomingRow;

/** Hero ticker — static until /api/esports/feed exists. */
export const ESPORTS_FEED: HeroFeedEntry[] = [
  {
    league: "VCT AMER",
    leagueKey: "amer",
    teamA: { abbr: "SEN", score: 13 },
    teamB: { abbr: "100T", score: 9 },
    status: "live",
    map: 2,
    currentScore: "13:9",
  },
  {
    league: "VCT EMEA",
    leagueKey: "emea",
    teamA: { abbr: "FNC" },
    teamB: { abbr: "KC" },
    status: "upcoming",
    startsIn: "2h 14m",
    date: "APR 19",
  },
  {
    league: "VCT PAC",
    leagueKey: "pac",
    teamA: { abbr: "DRX" },
    teamB: { abbr: "GEN" },
    status: "upcoming",
    startsIn: "5h 08m",
    date: "APR 19",
  },
];

export type ExpandedMatchCard = {
  id: string;
  league: string;
  leagueKey: "amer" | "emea" | "pac" | "chl";
  teamA: { abbr: string; score?: number };
  teamB: { abbr: string; score?: number };
  status: "live" | "upcoming" | "final";
  mapLine?: string;
  timeLine?: string;
  metaRight?: string;
  filter: "live" | "today" | "week";
};

/** Section 4 grid — static; wire to API when ready. */
export const EXPANDED_MATCH_CARDS: ExpandedMatchCard[] = [
  {
    id: "m1",
    league: "VCT AMER",
    leagueKey: "amer",
    teamA: { abbr: "SEN", score: 13 },
    teamB: { abbr: "100T", score: 9 },
    status: "live",
    mapLine: "MAP 2 · ASCENT",
    metaRight: "LIVE NOW",
    filter: "live",
  },
  {
    id: "m2",
    league: "VCT EMEA",
    leagueKey: "emea",
    teamA: { abbr: "FNC", score: 11 },
    teamB: { abbr: "TH", score: 13 },
    status: "live",
    mapLine: "MAP 3 · BIND",
    metaRight: "LIVE NOW",
    filter: "live",
  },
  {
    id: "m3",
    league: "VCT PAC",
    leagueKey: "pac",
    teamA: { abbr: "PRX" },
    teamB: { abbr: "DRX" },
    status: "upcoming",
    timeLine: "IN 2H 14M",
    metaRight: "APR 19",
    filter: "today",
  },
  {
    id: "m4",
    league: "VCT AMER",
    leagueKey: "amer",
    teamA: { abbr: "NRG" },
    teamB: { abbr: "C9" },
    status: "upcoming",
    timeLine: "IN 5H 40M",
    metaRight: "APR 19",
    filter: "today",
  },
  {
    id: "m5",
    league: "CHALLENGERS",
    leagueKey: "chl",
    teamA: { abbr: "GX", score: 2 },
    teamB: { abbr: "BBL", score: 0 },
    status: "final",
    mapLine: "BO3",
    metaRight: "APR 18",
    filter: "week",
  },
  {
    id: "m6",
    league: "VCT EMEA",
    leagueKey: "emea",
    teamA: { abbr: "KC", score: 13 },
    teamB: { abbr: "TL", score: 7 },
    status: "final",
    mapLine: "BO3 · LOTUS",
    metaRight: "APR 17",
    filter: "week",
  },
];

export const TRENDING_PLAYERS = [
  "CB10#Aegon",
  "raiku#hsp",
  "BLG Zayce#2009",
  "Asuna#1337",
  "TenZ#SEN",
  "Derke#FNC",
] as const;
