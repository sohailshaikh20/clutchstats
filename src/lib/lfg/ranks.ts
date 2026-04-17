/** Ordered Valorant rank buckets stored in `lfg_posts.rank` (lowercase). */
export const RANK_KEYS = [
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

export type RankKey = (typeof RANK_KEYS)[number];

export function rankKeyOrdinal(key: string): number {
  const i = RANK_KEYS.indexOf(key.toLowerCase() as RankKey);
  return i === -1 ? 0 : i;
}

/** Henrik `current_rank` (0–25) → LFG rank bucket. */
export function henrikTierToRankKey(tier: number | null | undefined): RankKey {
  if (tier == null || tier <= 2) return "iron";
  if (tier <= 5) return "iron";
  if (tier <= 8) return "bronze";
  if (tier <= 11) return "silver";
  if (tier <= 14) return "gold";
  if (tier <= 17) return "platinum";
  if (tier <= 20) return "diamond";
  if (tier <= 22) return "ascendant";
  if (tier <= 24) return "immortal";
  return "radiant";
}

export function normalizeRankKey(raw: string): RankKey {
  const k = raw.trim().toLowerCase().replace(/\s+/g, "");
  return (RANK_KEYS.includes(k as RankKey) ? k : "gold") as RankKey;
}

export function rankLabel(key: string): string {
  const k = normalizeRankKey(key);
  return k.charAt(0).toUpperCase() + k.slice(1);
}

export function rankInRange(
  postRank: string,
  minKey: string | null,
  maxKey: string | null
): boolean {
  const o = rankKeyOrdinal(normalizeRankKey(postRank));
  const minO = minKey ? rankKeyOrdinal(minKey) : 0;
  const maxO = maxKey ? rankKeyOrdinal(maxKey) : RANK_KEYS.length - 1;
  return o >= minO && o <= maxO;
}
