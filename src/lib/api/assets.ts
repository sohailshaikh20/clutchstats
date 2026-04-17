import { z } from 'zod';
import { Agent, ValorantMap, CompetitiveTierSet, Weapon } from '@/types/valorant';

const ASSETS_BASE_URL = 'https://valorant-api.com/v1';
const CACHE_SECONDS = 86400; // 24 hours — asset UUIDs and icons rarely change

// ─── Error ────────────────────────────────────────────────────────────────────

export class AssetsApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AssetsApiError';
    this.status = status;
  }
}

// ─── Core Fetcher ─────────────────────────────────────────────────────────────

async function fetchAsset<T>(endpoint: string): Promise<{ status: number; data: T }> {
  const res = await fetch(`${ASSETS_BASE_URL}${endpoint}`, {
    next: { revalidate: CACHE_SECONDS },
  });

  if (!res.ok) {
    throw new AssetsApiError(
      res.status,
      `Assets API error on ${endpoint}: ${res.statusText}`
    );
  }

  const json = await res.json();

  // Validate top-level shape only — inner data can be cast by callers
  const parsed = z.object({ status: z.number(), data: z.any() }).safeParse(json);
  if (!parsed.success) {
    console.warn('[AssetsClient] Unexpected shape on', endpoint, parsed.error.flatten());
    return json as { status: number; data: T };
  }

  return parsed.data as { status: number; data: T };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns all playable agents (non-playable test agents excluded by default).
 * Cached 24 h.
 */
export async function getAgents(isPlayableCharacter = true): Promise<Agent[]> {
  const qs = isPlayableCharacter ? '?isPlayableCharacter=true' : '';
  const res = await fetchAsset<Agent[]>(`/agents${qs}`);
  return res.data;
}

/**
 * Returns a single agent by UUID.
 * Cached 24 h.
 */
export async function getAgentByUuid(uuid: string): Promise<Agent> {
  const res = await fetchAsset<Agent>(`/agents/${uuid}`);
  return res.data;
}

/**
 * Returns all maps (includes non-competitive maps like the range).
 * Cached 24 h.
 */
export async function getMaps(): Promise<ValorantMap[]> {
  const res = await fetchAsset<ValorantMap[]>('/maps');
  return res.data;
}

/**
 * Returns a single map by UUID.
 * Cached 24 h.
 */
export async function getMapByUuid(uuid: string): Promise<ValorantMap> {
  const res = await fetchAsset<ValorantMap>(`/maps/${uuid}`);
  return res.data;
}

/**
 * Returns all competitive tier sets (one per episode/act).
 * Use getLatestCompetitiveTiers() for the current season.
 * Cached 24 h.
 */
export async function getCompetitiveTiers(): Promise<CompetitiveTierSet[]> {
  const res = await fetchAsset<CompetitiveTierSet[]>('/competitivetiers');
  return res.data;
}

/**
 * Returns the most recent competitive tier set (current season).
 * Cached 24 h.
 */
export async function getLatestCompetitiveTiers(): Promise<CompetitiveTierSet> {
  const all = await getCompetitiveTiers();
  if (all.length === 0) throw new AssetsApiError(404, 'No competitive tier sets returned');
  return all[all.length - 1];
}

/**
 * Returns all weapons with full stats, damage ranges, and skins.
 * Cached 24 h.
 */
export async function getWeapons(): Promise<Weapon[]> {
  const res = await fetchAsset<Weapon[]>('/weapons');
  return res.data;
}

/**
 * Returns a single weapon by UUID.
 * Cached 24 h.
 */
export async function getWeaponByUuid(uuid: string): Promise<Weapon> {
  const res = await fetchAsset<Weapon>(`/weapons/${uuid}`);
  return res.data;
}
