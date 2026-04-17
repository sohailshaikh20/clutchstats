import { RANK_KEYS } from "@/lib/lfg/ranks";
import type { CompetitiveTier, CompetitiveTierSet } from "@/types/valorant";

function normTierName(name: string): string {
  return name.replace(/[^a-z0-9]+/gi, "").toLowerCase();
}

export function buildRankKeyVisuals(
  set: CompetitiveTierSet
): Record<string, { icon: string; label: string }> {
  const grouped = new Map<string, CompetitiveTier[]>();
  for (const t of set.tiers) {
    if (t.tier <= 0 || !t.tierName || /unused/i.test(t.tierName)) continue;
    const k = normTierName(t.tierName);
    const arr = grouped.get(k) ?? [];
    arr.push(t);
    grouped.set(k, arr);
  }
  for (const arr of Array.from(grouped.values())) {
    arr.sort((a: CompetitiveTier, b: CompetitiveTier) => a.tier - b.tier);
  }

  const out: Record<string, { icon: string; label: string }> = {};
  for (const key of RANK_KEYS) {
    const arr = grouped.get(key);
    const pick = arr?.[Math.floor((arr.length - 1) / 2)] ?? arr?.[0];
    if (pick?.smallIcon) {
      const label = pick.tierName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      out[key] = { icon: pick.smallIcon, label };
    }
  }
  return out;
}
