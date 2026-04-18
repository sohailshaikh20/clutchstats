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
  finalScore?: string;
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
    filter: "today",
  },
  {
    id: "m2",
    league: "VCT EMEA",
    leagueKey: "emea",
    teamA: { abbr: "FNC" },
    teamB: { abbr: "KC" },
    status: "upcoming",
    timeLine: "IN 2H 14M",
    metaRight: "APR 19",
    filter: "today",
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
    league: "VCT EMEA",
    leagueKey: "emea",
    teamA: { abbr: "TH" },
    teamB: { abbr: "BBL" },
    status: "upcoming",
    timeLine: "IN 8H 22M",
    metaRight: "APR 19",
    filter: "today",
  },
  {
    id: "m6",
    league: "VCT PAC",
    leagueKey: "pac",
    teamA: { abbr: "GEN", score: 13 },
    teamB: { abbr: "T1", score: 11 },
    status: "final",
    finalScore: "13-11",
    metaRight: "APR 19",
    filter: "today",
  },
];

// TODO(backend): replace with real /api/esports/feed when available

export const TRENDING_PLAYERS = [
  "CB10#Aegon",
  "raiku#hsp",
  "BLG Zayce#2009",
  "Asuna#1337",
  "TenZ#SEN",
  "Derke#FNC",
] as const;
