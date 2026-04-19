import { vlrFetch } from "./client";
import { coerceMatchDetail } from "./coerce-match-detail";

export interface LiveMatchSegment {
  team1: string;
  team2: string;
  flag1: string;
  flag2: string;
  team1_logo?: string;
  team2_logo?: string;
  score1: string;
  score2: string;
  team1_round_ct?: string;
  team1_round_t?: string;
  team2_round_ct?: string;
  team2_round_t?: string;
  map_number: string;
  current_map?: string;
  time_until_match: string;
  match_event: string;
  match_series: string;
  unix_timestamp: string;
  match_page: string;
}

export interface UpcomingMatchSegment {
  team1: string;
  team2: string;
  flag1: string;
  flag2: string;
  team1_logo?: string;
  team2_logo?: string;
  score1: string;
  score2: string;
  time_until_match: string;
  round_info: string;
  tournament_name: string;
  tournament_icon?: string;
  unix_timestamp: string;
  match_page: string;
}

export interface ResultMatchSegment {
  team1: string;
  team2: string;
  flag1: string;
  flag2: string;
  team1_logo?: string;
  team2_logo?: string;
  score1: string;
  score2: string;
  time_completed: string;
  round_info: string;
  tournament_name: string;
  tournament_icon?: string;
  match_page: string;
}

export interface MatchDetailPlayer {
  team: string;
  player: string;
  agent?: string;
  rating?: string;
  acs?: string;
  kills?: string;
  deaths?: string;
  assists?: string;
  kast?: string;
  adr?: string;
  hs_pct?: string;
  fk?: string;
  fd?: string;
}

export interface MatchDetailMap {
  map_name: string;
  picked_by?: string;
  duration?: string;
  score: {
    team1: { total: number; ct: number; t: number };
    team2: { total: number; ct: number; t: number };
  };
  players: MatchDetailPlayer[];
}

export interface MatchDetailRound {
  round_number: number;
  team1_win: boolean;
  team2_win: boolean;
  team1_side: "ct" | "t";
  team2_side: "ct" | "t";
}

export interface MatchDetailStream {
  name: string;
  link: string;
}

export interface MatchDetail {
  event: { name: string; series: string };
  teams: Array<{ name: string; score: number; logo?: string; flag?: string }>;
  maps: MatchDetailMap[];
  rounds: MatchDetailRound[];
  head_to_head: Array<{ event: string; match: string; score: string }>;
  streams: MatchDetailStream[];
  match_id?: string;
  status?: "live" | "upcoming" | "completed";
}

export function getLiveMatches() {
  return vlrFetch<{ segments: LiveMatchSegment[] }>("/v2/match?q=live_score", { revalidate: 30 });
}

export function getUpcomingMatches() {
  return vlrFetch<{ segments: UpcomingMatchSegment[] }>("/v2/match?q=upcoming", { revalidate: 300 });
}

export function getResults() {
  return vlrFetch<{ segments: ResultMatchSegment[] }>("/v2/match?q=results", { revalidate: 300 });
}

export async function getMatchDetail(matchId: string): Promise<MatchDetail> {
  const raw = await vlrFetch<unknown>(`/v2/match/${encodeURIComponent(matchId)}`, {
    revalidate: 30,
  });
  return coerceMatchDetail(raw);
}

export function extractMatchId(matchPage: string): string | null {
  if (!matchPage) return null;
  const match = matchPage.match(/\/(\d+)\//);
  return match?.[1] ?? null;
}

export function normalizeLogoUrl(url: string | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http")) return url;
  return null;
}
