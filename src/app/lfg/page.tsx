import { LfgPageClient } from "@/components/lfg/LfgPageClient";
import { getAgents, getLatestCompetitiveTiers } from "@/lib/api/assets";
import { buildRankKeyVisuals } from "@/lib/lfg/rank-visuals";
import type { Agent } from "@/types/valorant";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Find Squad | ClutchStats.gg",
  description:
    "Valorant LFG board — filter by region, rank, agents, and playstyle. Post your squad or find teammates in real time.",
  path: "/lfg",
});

export default async function LfgPage() {
  let agents: Agent[] = [];
  let rankVisuals: Record<string, { icon: string; label: string }> = {};

  try {
    const [agentList, tierSet] = await Promise.all([
      getAgents(true),
      getLatestCompetitiveTiers(),
    ]);
    agents = agentList.filter((a) => a.isPlayableCharacter);
    rankVisuals = buildRankKeyVisuals(tierSet);
  } catch (err) {
    console.error("[lfg] asset load failed", err);
  }

  return <LfgPageClient agents={agents} rankVisuals={rankVisuals} />;
}
