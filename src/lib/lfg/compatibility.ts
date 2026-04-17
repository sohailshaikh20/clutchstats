import { henrikTierToRankKey, normalizeRankKey, rankKeyOrdinal } from "@/lib/lfg/ranks";
import type { Agent } from "@/types/valorant";

function normalizeAgentName(s: string): string {
  return s.trim().toLowerCase();
}

function roleForAgentName(agents: Agent[], name: string): string | null {
  const n = normalizeAgentName(name);
  const a = agents.find((x) => normalizeAgentName(x.displayName) === n);
  return a?.role?.displayName?.toLowerCase() ?? null;
}

/**
 * Match % from viewer Henrik tier vs post rank bucket + role diversity / overlap
 * with agents the viewer is filtering for (if any).
 */
export function computeCompatibilityPercent(opts: {
  viewerHenrikRank: number | null | undefined;
  postRankKey: string;
  postAgents: string[];
  filterAgentNames: string[];
  allAgents: Agent[];
}): number {
  const { viewerHenrikRank, postRankKey, postAgents, filterAgentNames, allAgents } = opts;

  const postO = rankKeyOrdinal(normalizeRankKey(postRankKey));
  let rankScore = 55;
  if (viewerHenrikRank != null && viewerHenrikRank > 0) {
    const viewerO = rankKeyOrdinal(henrikTierToRankKey(viewerHenrikRank));
    const gap = Math.abs(viewerO - postO);
    rankScore = Math.max(0, 100 - gap * 18);
  }

  const roles = new Set<string>();
  for (const name of postAgents) {
    const r = roleForAgentName(allAgents, name);
    if (r) roles.add(r);
  }
  const diversity = roles.size;
  let roleScore = 40 + Math.min(60, diversity * 18);

  if (filterAgentNames.length > 0) {
    const want = new Set(filterAgentNames.map(normalizeAgentName));
    const overlap = postAgents.filter((a) => want.has(normalizeAgentName(a))).length;
    roleScore = Math.min(100, roleScore * 0.5 + (overlap > 0 ? 35 + overlap * 12 : 20));
  }

  return Math.round(Math.min(100, Math.max(0, rankScore * 0.55 + roleScore * 0.45)));
}
