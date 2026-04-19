import { getHenrikDev } from './client';

// ─── Region type ──────────────────────────────────────────────────────────────

export type PremierApiRegion = 'na' | 'eu' | 'ap' | 'kr' | 'br' | 'latam';

// ─── Division utilities ───────────────────────────────────────────────────────
// Henrik Premier API: division is a number where 1 = Invite (best), 6 = Open (worst)

export const DIVISION_NAMES: Record<number, string> = {
  1: 'Invite',
  2: 'Contender',
  3: 'Elite',
  4: 'Advanced',
  5: 'Intermediate',
  6: 'Open',
};

export const DIVISION_COLORS: Record<number, string> = {
  1: '#FFF6A1',
  2: '#FF4655',
  3: '#FFB547',
  4: '#2FB57A',
  5: '#3A9DB8',
  6: '#8A8A95',
};

export function divisionName(n: number): string {
  return DIVISION_NAMES[n] ?? `Division ${n}`;
}

export function divisionColor(n: number): string {
  return DIVISION_COLORS[n] ?? '#8A8A95';
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PremierTeamDetails {
  id: string;
  name: string;
  tag: string;
  /** Conference key, e.g. "EU_CENTRAL_EAST" */
  conference: string;
  /** 1 = Invite (best), 6 = Open (worst) */
  division: number;
  /** Lowercase region, e.g. "eu", "na" */
  affinity: string;
  score: number;
  wins?: number;
  losses?: number;
  member_count?: number;
  enrolled_qualified?: boolean;
  division_logo?: string;
  customization?: {
    icon?: number;
    image?: string;
    primary?: string;
    secondary?: string;
    tertiary?: string;
  };
  members?: Array<{
    puuid: string;
    name?: string;
    tag?: string;
  }>;
}

export interface PremierLeaderboardEntry {
  id: string;
  name: string;
  tag: string;
  score: number;
  wins?: number;
  losses?: number;
  /** 1 = Invite (best), 6 = Open (worst) */
  division: number;
  /** Conference key, e.g. "EU_CENTRAL_EAST" */
  conference: string;
  /** Lowercase region, e.g. "eu", "na" */
  affinity: string;
  enrolled_qualified?: boolean;
  customization?: {
    icon?: number;
    image?: string;
    primary?: string;
  };
}

export interface PremierConference {
  id: string;
  name: string;
  /** Lowercase region, e.g. "eu", "na" */
  affinity: string;
  time_zone_ids?: string[];
  icon?: number;
}

export interface PremierMatchHistoryEntry {
  id: string;
  points_after_match?: number;
  points_difference?: number;
  won?: boolean;
  timestamp?: string;
}

export interface PremierMatchHistory {
  league_matches: PremierMatchHistoryEntry[];
}

export interface PremierTeamSearchResult {
  id: string;
  name: string;
  tag: string;
  conference?: string;
  division?: number;
  affinity?: string;
  score?: number;
  wins?: number;
  losses?: number;
  enrolled_qualified?: boolean;
}

export interface PremierSeason {
  id: string;
  championship_event_id?: string;
  championship_points_required?: number;
  season_id?: string;
  conference_schedules?: Record<string, unknown>;
  weeks?: Array<{ start: string; end: string }>;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

/** Search for Premier teams by name or tag. Cached 60s. */
export async function searchPremierTeams(
  name: string,
  tag?: string,
): Promise<PremierTeamSearchResult[]> {
  const params = new URLSearchParams({ name });
  if (tag) params.set('tag', tag);
  const data = await getHenrikDev<{ teams?: PremierTeamSearchResult[] } | PremierTeamSearchResult[]>(
    `/valorant/v1/premier/search?${params.toString()}`,
    { revalidate: 60 },
  );
  if (Array.isArray(data)) return data;
  return (data as { teams?: PremierTeamSearchResult[] }).teams ?? [];
}

/** Fetch full team details by Premier team ID. Cached 60s. */
export async function getPremierTeamById(teamId: string): Promise<PremierTeamDetails> {
  return getHenrikDev<PremierTeamDetails>(
    `/valorant/v1/premier/${encodeURIComponent(teamId)}`,
    { revalidate: 60 },
  );
}

/** Fetch a team's Premier match history. Cached 60s. */
export async function getPremierTeamHistory(teamId: string): Promise<PremierMatchHistory> {
  return getHenrikDev<PremierMatchHistory>(
    `/valorant/v1/premier/${encodeURIComponent(teamId)}/history`,
    { revalidate: 60 },
  );
}

/** Fetch all Premier conferences. Cached 5 min — changes rarely. */
export async function getPremierConferences(): Promise<PremierConference[]> {
  const data = await getHenrikDev<
    { conferences?: PremierConference[] } | PremierConference[]
  >('/valorant/v1/premier/conferences', { revalidate: 300 });
  if (Array.isArray(data)) return data;
  return (data as { conferences?: PremierConference[] }).conferences ?? [];
}

/** Fetch Premier seasons for a region. Cached 5 min. */
export async function getPremierSeasons(region: string): Promise<PremierSeason[]> {
  const data = await getHenrikDev<{ seasons?: PremierSeason[] } | PremierSeason[]>(
    `/valorant/v1/premier/seasons/${encodeURIComponent(region.toLowerCase())}`,
    { revalidate: 300 },
  );
  if (Array.isArray(data)) return data;
  return (data as { seasons?: PremierSeason[] }).seasons ?? [];
}

/** Fetch Premier leaderboard for a region. Cached 60s. */
export async function getPremierLeaderboard(region: string): Promise<PremierLeaderboardEntry[]> {
  const data = await getHenrikDev<
    { teams?: PremierLeaderboardEntry[] } | PremierLeaderboardEntry[]
  >(
    `/valorant/v1/premier/leaderboard/${encodeURIComponent(region.toLowerCase())}`,
    { revalidate: 60 },
  );
  if (Array.isArray(data)) return data;
  return (data as { teams?: PremierLeaderboardEntry[] }).teams ?? [];
}
