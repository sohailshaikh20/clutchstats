import type { CompetitiveTier, CompetitiveTierSet } from "@/types/valorant";
import { henrikTierToApiTier } from "@/lib/valorant/landing-assets";

const RANK_ORDER = [
  "iron",
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
  "ascendant",
  "immortal",
  "radiant",
] as const;

export type RoadmapRankGroup = {
  key: string;
  displayName: string;
  divisionLabel: string;
  iconUrl: string | null;
  colorHex: string;
  apiTierMin: number;
  apiTierMax: number;
};

function normTierNameKey(name: string): string {
  return name.replace(/[^a-z0-9]+/gi, "").toLowerCase();
}

function titleCaseTierName(raw: string): string {
  const s = raw.replace(/_/g, " ").trim();
  if (!s) return raw;
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildRoadmapRankGroups(set: CompetitiveTierSet): RoadmapRankGroup[] {
  const playable = set.tiers.filter(
    (t) => t.tier > 0 && t.tierName && !/unused/i.test(t.tierName)
  );
  const grouped = new Map<string, CompetitiveTier[]>();
  for (const t of playable) {
    const k = normTierNameKey(t.tierName);
    const arr = grouped.get(k) ?? [];
    arr.push(t);
    grouped.set(k, arr);
  }
  for (const arr of Array.from(grouped.values())) {
    arr.sort((a: CompetitiveTier, b: CompetitiveTier) => a.tier - b.tier);
  }

  const out: RoadmapRankGroup[] = [];
  for (const ord of RANK_ORDER) {
    const arr = grouped.get(ord);
    if (!arr?.length) continue;
    const first = arr[0];
    const last = arr[arr.length - 1];
    const divFirst = (first.divisionName || first.division || "").trim() || "—";
    const divLast = (last.divisionName || last.division || "").trim() || "—";
    const divisionLabel = divFirst === divLast ? divFirst : `${divFirst}–${divLast}`;
    const iconTier = arr.find((x) => x.smallIcon) ?? first;
    const color = (first.color || "ece8e1").replace(/^#/, "");
    out.push({
      key: ord,
      displayName: titleCaseTierName(first.tierName),
      divisionLabel,
      iconUrl: iconTier.smallIcon,
      colorHex: color,
      apiTierMin: first.tier,
      apiTierMax: last.tier,
    });
  }
  return out;
}

/**
 * Returns the roadmap rank `key` (e.g. `gold`) for the signed-in user's Henrik tier, or null.
 */
export function resolveUserRankGroupKey(
  riotLinked: boolean,
  currentHenrikRank: number | null,
  groups: RoadmapRankGroup[]
): string | null {
  if (!riotLinked || currentHenrikRank == null || currentHenrikRank <= 0) return null;
  const apiTier = henrikTierToApiTier(currentHenrikRank);
  const g = groups.find((x) => apiTier >= x.apiTierMin && apiTier <= x.apiTierMax);
  return g?.key ?? null;
}
