// ─── Shared ───────────────────────────────────────────────────────────────────

export interface VLRApiResponse<T> {
  status: number;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total_pages: number;
    total_elements: number;
  };
}

export type VLRRegion =
  | 'na'
  | 'eu'
  | 'ap'
  | 'sa'
  | 'jp'
  | 'oce'
  | 'mn'
  | 'gc'
  | 'br'
  | 'kr'
  | 'cn'
  | 'world';

// ─── Teams ────────────────────────────────────────────────────────────────────

export interface VLRTeam {
  id: string;
  name: string;
  logo: string;
  country: string;
  region: string;
  rank: number | null;
  rating: number | null;
  record: { wins: number; losses: number } | null;
}

export interface VLRMatchTeam {
  name: string;
  logo: string;
  score: number | null;
  record: string;
}

// ─── Matches ─────────────────────────────────────────────────────────────────

export interface VLRMatch {
  id: string;
  url: string;
  match_page: string;
  team1: VLRMatchTeam;
  team2: VLRMatchTeam;
  event: {
    name: string;
    logo: string;
  };
  series: {
    name: string;
    full_name: string;
  };
  time_until_match: string;
  unix_timestamp: number | null;
  status: 'upcoming' | 'live' | 'completed';
}

export interface VLRResult {
  id: string;
  url: string;
  match_page: string;
  team1: VLRMatchTeam & { score: number };
  team2: VLRMatchTeam & { score: number };
  event: {
    name: string;
    logo: string;
  };
  series: {
    name: string;
    full_name: string;
  };
  time_completed: string;
  unix_timestamp: number;
  status: 'completed';
  winner: string;
}

export interface VLRMatchDetail {
  id: string;
  url: string;
  event: {
    name: string;
    logo: string;
    url: string;
  };
  series: {
    name: string;
    full_name: string;
  };
  date: string;
  patch: string;
  teams: Array<{
    name: string;
    logo: string;
    score: number;
    won: boolean;
    players: Array<{
      name: string;
      country: string;
      agents: string[];
      stats: {
        rating: string;
        acs: string;
        kills: string;
        deaths: string;
        assists: string;
        kd_diff: string;
        kast: string;
        adr: string;
        hs_pct: string;
        fk: string;
        fd: string;
        fk_diff: string;
      };
    }>;
  }>;
  maps: Array<{
    name: string;
    score: { team1: number; team2: number };
    winner: string;
    duration: string;
  }>;
}

// ─── Events ───────────────────────────────────────────────────────────────────

export interface VLREvent {
  id: string;
  title: string;
  status: 'ongoing' | 'upcoming' | 'completed';
  prizepool: string | null;
  dates: string;
  country: string;
  region: string;
  logo: string;
  url: string;
}

// ─── Rankings ─────────────────────────────────────────────────────────────────

/** Normalised match row for the home page esports strip (from `/api/esports/matches`). */
export interface EsportsMatchCardDTO {
  id: string;
  team1: { name: string; logo: string; score: number | null };
  team2: { name: string; logo: string; score: number | null };
  eventName: string;
  isLive: boolean;
  timeLabel: string;
  unixTimestamp: number | null;
  /** Full URL to the match on VLR.gg (when available). */
  vlrUrl: string;
}

export interface VLRRanking {
  rank: number;
  team: {
    id: string;
    name: string;
    logo: string;
    country: string;
    url: string;
  };
  points: number;
  last_played: { team: string; won: boolean } | null;
  record: { wins: number; losses: number };
  earnings: string | null;
  last_results: Array<'W' | 'L'>;
}
