import { z } from 'zod';
import {
  HenrikAccount,
  HenrikMMRResponse,
  HenrikMatch,
  HenrikApiResponse,
  ValorantRegion,
  ValorantQueue,
} from '@/types/valorant';

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const AccountSchema = z.object({
  puuid: z.string(),
  name: z.string(),
  tag: z.string(),
  region: z.string(),
  account_level: z.number(),
  card: z.object({
    small: z.string(),
    large: z.string(),
    wide: z.string(),
    id: z.string(),
  }),
  last_update: z.string().optional(),
  last_update_raw: z.number().optional(),
});

// Loose wrappers — Henrik sometimes adds undocumented fields
const LooseResponse = z.object({ status: z.number(), data: z.any() });

// ─── Error Class ─────────────────────────────────────────────────────────────

export interface HenrikErrorPayload {
  status: number;
  message: string;
  retryAfter?: number;
}

export class HenrikApiError extends Error {
  readonly status: number;
  readonly retryAfter?: number;

  constructor({ status, message, retryAfter }: HenrikErrorPayload) {
    super(message);
    this.name = 'HenrikApiError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

// ─── Option Types ─────────────────────────────────────────────────────────────

export interface GetMatchesOptions {
  queue?: ValorantQueue;
  size?: number;
  page?: number;
}

export interface GetLeaderboardOptions {
  page?: number;
  size?: number;
  puuid?: string;
  name?: string;
  tag?: string;
}

// ─── Client ───────────────────────────────────────────────────────────────────

export class HenrikClient {
  private readonly baseUrl = 'https://api.henrikdev.xyz/valorant';
  private readonly apiKey: string;

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.HENRIK_API_KEY;
    if (!key) throw new Error('HENRIK_API_KEY is not configured');
    this.apiKey = key;
  }

  // ── Core fetch wrapper ────────────────────────────────────────────────────

  private async request<T>(
    endpoint: string,
    schema: z.ZodType<{ status: number; data: T }>,
    cacheOpts: NonNullable<RequestInit['next']> = {}
  ): Promise<HenrikApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const res = await fetch(url, {
      headers: {
        Authorization: this.apiKey,
        'Content-Type': 'application/json',
      },
      next: cacheOpts,
    });

    if (!res.ok) {
      const retryAfterHeader = res.headers.get('Retry-After');
      const body = await res.json().catch(() => ({}));
      const message: string =
        body?.message ?? body?.errors?.[0]?.message ?? res.statusText;

      switch (res.status) {
        case 429:
          throw new HenrikApiError({
            status: 429,
            message: 'Rate limit exceeded',
            retryAfter: retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60,
          });
        case 404:
          throw new HenrikApiError({ status: 404, message: `Not found: ${message}` });
        case 403:
          throw new HenrikApiError({ status: 403, message: 'Invalid or missing API key' });
        case 500:
        case 503:
          throw new HenrikApiError({
            status: res.status,
            message: `Henrik API server error: ${message}`,
          });
        default:
          throw new HenrikApiError({ status: res.status, message });
      }
    }

    const json = await res.json();
    const parsed = schema.safeParse(json);

    if (!parsed.success) {
      // Log but don't hard-fail — API may add fields between schema updates
      console.warn('[HenrikClient] Schema validation warning:', parsed.error.flatten());
      return json as HenrikApiResponse<T>;
    }

    return parsed.data as HenrikApiResponse<T>;
  }

  // ── Public Methods ────────────────────────────────────────────────────────

  /** Fetch account info by Riot name + tag. Cached 5 min. */
  async getAccount(name: string, tag: string): Promise<HenrikApiResponse<HenrikAccount>> {
    const n = encodeURIComponent(name);
    const t = encodeURIComponent(tag);
    return this.request<HenrikAccount>(
      `/v1/account/${n}/${t}`,
      z.object({ status: z.number(), data: AccountSchema }) as z.ZodType<
        HenrikApiResponse<HenrikAccount>
      >,
      { revalidate: 300 }
    );
  }

  /** Fetch MMR data. Cached 5 min. */
  async getMMR(
    region: ValorantRegion,
    name: string,
    tag: string
  ): Promise<HenrikApiResponse<HenrikMMRResponse>> {
    const n = encodeURIComponent(name);
    const t = encodeURIComponent(tag);
    return this.request<HenrikMMRResponse>(
      `/v2/mmr/${region}/${n}/${t}`,
      LooseResponse as z.ZodType<HenrikApiResponse<HenrikMMRResponse>>,
      { revalidate: 300 }
    );
  }

  /** Fetch match list. Cached 2 min. */
  async getMatches(
    region: ValorantRegion,
    name: string,
    tag: string,
    options: GetMatchesOptions = {}
  ): Promise<HenrikApiResponse<HenrikMatch[]>> {
    const n = encodeURIComponent(name);
    const t = encodeURIComponent(tag);
    const params = new URLSearchParams();
    if (options.queue) params.set('filter', options.queue);
    if (options.size !== undefined) params.set('size', String(options.size));
    if (options.page !== undefined) params.set('page', String(options.page));
    const qs = params.size ? `?${params.toString()}` : '';
    return this.request<HenrikMatch[]>(
      `/v3/matches/${region}/${n}/${t}${qs}`,
      LooseResponse as z.ZodType<HenrikApiResponse<HenrikMatch[]>>,
      { revalidate: 120 }
    );
  }

  /** Fetch a single match by ID. Cached 24 h (match data is immutable). */
  async getMatchById(matchId: string): Promise<HenrikApiResponse<HenrikMatch>> {
    return this.request<HenrikMatch>(
      `/v2/match/${matchId}`,
      LooseResponse as z.ZodType<HenrikApiResponse<HenrikMatch>>,
      { revalidate: 86400 }
    );
  }

  /** Fetch competitive leaderboard. Cached 15 min. */
  async getLeaderboard(
    region: ValorantRegion,
    options: GetLeaderboardOptions = {}
  ): Promise<HenrikApiResponse<unknown>> {
    const params = new URLSearchParams();
    if (options.page !== undefined) params.set('page', String(options.page));
    if (options.size !== undefined) params.set('size', String(options.size));
    if (options.puuid) params.set('puuid', options.puuid);
    if (options.name) params.set('name', options.name);
    if (options.tag) params.set('tag', options.tag);
    const qs = params.size ? `?${params.toString()}` : '';
    return this.request<unknown>(
      `/v1/leaderboard/${region}${qs}`,
      LooseResponse,
      { revalidate: 900 }
    );
  }

  /** Fetch MMR history. Cached 2 min. */
  async getMMRHistory(
    region: ValorantRegion,
    name: string,
    tag: string
  ): Promise<HenrikApiResponse<unknown>> {
    const n = encodeURIComponent(name);
    const t = encodeURIComponent(tag);
    return this.request<unknown>(
      `/v1/mmr-history/${region}/${n}/${t}`,
      LooseResponse,
      { revalidate: 120 }
    );
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _client: HenrikClient | null = null;

export function getHenrikClient(): HenrikClient {
  if (!_client) _client = new HenrikClient();
  return _client;
}
