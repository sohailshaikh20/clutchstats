const VALORANT_API = "https://valorant-api.com/v1";

export type MapAsset = {
  displayName: string;
  splash: string;
  listViewIcon: string;
};

export type AgentAsset = {
  uuid: string;
  displayName: string;
  displayIcon: string;
  fullPortraitV2: string;
  roleIcon: string;
  /** e.g. Duelist, Controller — used for role-coloured UI rings */
  roleDisplayName: string;
};

export type TierAsset = {
  tier: number;
  smallIcon: string | null;
  largeIcon: string | null;
  /** Hex colour from API e.g. `ff4655ff` */
  color: string | null;
};

function normalizeKey(s: string): string {
  return s.trim().toLowerCase();
}

/** Hex `RRGGBBAA` → CSS `rgba(...)`. */
export function valorantColorToCss(hex: string | null | undefined): string | null {
  if (!hex || hex.length < 8) return null;
  const raw = hex.replace(/^#/, "");
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  const a = parseInt(raw.slice(6, 8), 16) / 255;
  if ([r, g, b, a].some((n) => Number.isNaN(n))) return null;
  return `rgba(${r},${g},${b},${a})`;
}

export async function fetchValorantGameAssets(): Promise<{
  mapsByKey: Map<string, MapAsset>;
  agentsByUuid: Map<string, AgentAsset>;
  agentsByName: Map<string, AgentAsset>;
  tierByApiTier: Map<number, TierAsset>;
}> {
  const mapsByKey = new Map<string, MapAsset>();
  const agentsByUuid = new Map<string, AgentAsset>();
  const agentsByName = new Map<string, AgentAsset>();
  const tierByApiTier = new Map<number, TierAsset>();

  const [mapsRes, agentsRes, tiersRes] = await Promise.all([
    fetch(`${VALORANT_API}/maps`, { next: { revalidate: 86_400 } }),
    fetch(`${VALORANT_API}/agents?isPlayableCharacter=true`, {
      next: { revalidate: 86_400 },
    }),
    fetch(`${VALORANT_API}/competitivetiers`, { next: { revalidate: 86_400 } }),
  ]);

  if (mapsRes.ok) {
    const j = (await mapsRes.json()) as {
      data?: Array<{
        displayName: string;
        splash: string;
        listViewIcon: string;
      }>;
    };
    for (const m of j.data ?? []) {
      const key = normalizeKey(m.displayName);
      mapsByKey.set(key, {
        displayName: m.displayName,
        splash: m.splash,
        listViewIcon: m.listViewIcon,
      });
    }
  }

  if (agentsRes.ok) {
    const j = (await agentsRes.json()) as {
      data?: Array<{
        uuid: string;
        displayName: string;
        displayIcon: string;
        fullPortraitV2: string;
        role: { displayIcon: string; displayName?: string };
      }>;
    };
    for (const a of j.data ?? []) {
      const asset: AgentAsset = {
        uuid: a.uuid,
        displayName: a.displayName,
        displayIcon: a.displayIcon,
        fullPortraitV2: a.fullPortraitV2,
        roleIcon: a.role?.displayIcon ?? "",
        roleDisplayName: a.role?.displayName ?? "",
      };
      agentsByUuid.set(a.uuid.toLowerCase(), asset);
      agentsByName.set(normalizeKey(a.displayName), asset);
    }
  }

  if (tiersRes.ok) {
    const j = (await tiersRes.json()) as {
      data?: Array<{
        tiers: Array<{
          tier: number;
          smallIcon: string | null;
          largeIcon: string | null;
          color: string;
        }>;
      }>;
    };
    const tables = j.data;
    const latest = tables?.[tables.length - 1];
    for (const t of latest?.tiers ?? []) {
      tierByApiTier.set(t.tier, {
        tier: t.tier,
        smallIcon: t.smallIcon,
        largeIcon: t.largeIcon,
        color: t.color ?? null,
      });
    }
  }

  return { mapsByKey, agentsByUuid, agentsByName, tierByApiTier };
}

export function resolveMapAsset(
  mapsByKey: Map<string, MapAsset>,
  henrikMapName: string
): MapAsset | null {
  const direct = mapsByKey.get(normalizeKey(henrikMapName));
  if (direct) return direct;
  for (const m of Array.from(mapsByKey.values())) {
    if (henrikMapName && m.displayName.toLowerCase().includes(henrikMapName.toLowerCase()))
      return m;
  }
  return null;
}

export function resolveAgentAsset(
  agentsByUuid: Map<string, AgentAsset>,
  agentsByName: Map<string, AgentAsset>,
  henrikCharacter: string
): AgentAsset | null {
  const c = henrikCharacter.trim();
  if (c.includes("-") && c.length >= 32) {
    const byUuid = agentsByUuid.get(c.toLowerCase());
    if (byUuid) return byUuid;
  }
  return agentsByName.get(normalizeKey(c)) ?? null;
}
