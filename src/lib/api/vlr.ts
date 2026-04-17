import { z } from 'zod';
import {
  VLRMatch,
  VLRResult,
  VLREvent,
  VLRRanking,
  VLRApiResponse,
  VLRRegion,
} from '@/types/esports';

const VLR_BASE_URL = 'https://vlr.orlandomm.net/api/v1';

// ─── Error ────────────────────────────────────────────────────────────────────

export class VLRApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'VLRApiError';
    this.status = status;
  }
}

// ─── Client ───────────────────────────────────────────────────────────────────

class VLRClient {
  private readonly baseUrl: string;

  constructor(baseUrl = VLR_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ── Core fetch ─────────────────────────────────────────────────────────────

  private async request<T>(
    endpoint: string,
    transform: (raw: unknown) => T,
    revalidate = 120
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate },
    });

    if (!res.ok) {
      throw new VLRApiError(res.status, `VLR API error on ${endpoint}: ${res.statusText}`);
    }

    const json = await res.json();

    try {
      return transform(json);
    } catch {
      console.warn('[VLRClient] Transform warning for', endpoint);
      return json as T;
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private segmentsResponse<T>(raw: unknown): VLRApiResponse<T[]> {
    const parsed = z
      .object({ status: z.number(), data: z.object({ segments: z.array(z.any()) }) })
      .parse(raw);
    return { status: parsed.status, data: parsed.data.segments as T[] };
  }

  // ── Public Methods ────────────────────────────────────────────────────────

  /** Upcoming scheduled matches. Cached 1 min. */
  async getUpcomingMatches(): Promise<VLRApiResponse<VLRMatch[]>> {
    return this.request<VLRApiResponse<VLRMatch[]>>(
      '/match?q=upcoming',
      (raw) => this.segmentsResponse<VLRMatch>(raw),
      60
    );
  }

  /** Currently live matches. Cached 30 s. */
  async getLiveMatches(): Promise<VLRApiResponse<VLRMatch[]>> {
    return this.request<VLRApiResponse<VLRMatch[]>>(
      '/match?q=live_score',
      (raw) => this.segmentsResponse<VLRMatch>(raw),
      30
    );
  }

  /** Recent match results. Cached 5 min. */
  async getResults(page = 1): Promise<VLRApiResponse<VLRResult[]>> {
    return this.request<VLRApiResponse<VLRResult[]>>(
      `/match?q=results&page=${page}`,
      (raw) => this.segmentsResponse<VLRResult>(raw),
      300
    );
  }

  /** Team rankings by region. Cached 1 h. */
  async getRankings(region: VLRRegion): Promise<VLRApiResponse<VLRRanking[]>> {
    return this.request<VLRApiResponse<VLRRanking[]>>(
      `/rankings?region=${region}`,
      (raw) => this.segmentsResponse<VLRRanking>(raw),
      3600
    );
  }

  /** Events list, optionally filtered by status. Cached 5 min. */
  async getEvents(
    status?: 'ongoing' | 'upcoming' | 'completed'
  ): Promise<VLRApiResponse<VLREvent[]>> {
    const qs = status ? `?status=${status}` : '';
    return this.request<VLRApiResponse<VLREvent[]>>(
      `/events${qs}`,
      (raw) => this.segmentsResponse<VLREvent>(raw),
      300
    );
  }

  /** Full match details by VLR match ID. Cached 1 h. */
  async getMatchDetails(matchId: string): Promise<VLRApiResponse<unknown>> {
    return this.request<VLRApiResponse<unknown>>(
      `/match/${matchId}`,
      (raw) => {
        const r = z.object({ status: z.number(), data: z.any() }).parse(raw);
        return { status: r.status, data: r.data };
      },
      3600
    );
  }

  /** Latest esports news. Cached 10 min. */
  async getNews(): Promise<VLRApiResponse<unknown>> {
    return this.request<VLRApiResponse<unknown>>(
      '/news',
      (raw) => {
        const r = z.object({ status: z.number(), data: z.any() }).parse(raw);
        return { status: r.status, data: r.data };
      },
      600
    );
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _vlrClient: VLRClient | null = null;

export function getVLRClient(): VLRClient {
  if (!_vlrClient) _vlrClient = new VLRClient();
  return _vlrClient;
}

export { VLRClient };
