const VALORANT_API = "https://valorant-api.com/v1";

/** Henrik `currenttier` → Valorant-API `tier` index for the latest competitive table (Ep5+). */
export function henrikTierToApiTier(henrikTier: number): number {
  if (henrikTier <= 0) return 0;
  return henrikTier + 2;
}

type CompetitiveTierRow = {
  tier: number;
  smallIcon: string | null;
};

type CompetitiveTable = {
  uuid: string;
  tiers: CompetitiveTierRow[];
};

export async function fetchLatestRankIconByHenrikTier(): Promise<
  Map<number, string>
> {
  const map = new Map<number, string>();
  const res = await fetch(`${VALORANT_API}/competitivetiers`, {
    cache: "force-cache",
  });
  if (!res.ok) return map;

  const json = (await res.json()) as {
    data?: CompetitiveTable[];
  };
  const tables = json.data;
  if (!tables?.length) return map;

  const latest = tables[tables.length - 1];
  for (const row of latest.tiers) {
    if (row.smallIcon && row.tier >= 0) {
      map.set(row.tier, row.smallIcon);
    }
  }

  const iconByHenrik = new Map<number, string>();
  for (let h = 0; h <= 27; h++) {
    const apiTier = henrikTierToApiTier(h);
    const url = map.get(apiTier);
    if (url) iconByHenrik.set(h, url);
  }
  return iconByHenrik;
}

export type AgentIcon = { uuid: string; displayName: string; displayIcon: string };

export async function fetchPlayableAgentIcons(): Promise<AgentIcon[]> {
  const res = await fetch(`${VALORANT_API}/agents?isPlayableCharacter=true`, {
    cache: "force-cache",
  });
  if (!res.ok) return [];

  const json = (await res.json()) as {
    data?: Array<{
      uuid: string;
      displayName: string;
      displayIcon: string;
    }>;
  };

  return (json.data ?? [])
    .filter((a) => a.displayIcon)
    .map((a) => ({
      uuid: a.uuid,
      displayName: a.displayName,
      displayIcon: a.displayIcon,
    }));
}
