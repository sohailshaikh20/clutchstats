import { LeaderboardPageClient } from "@/components/leaderboard/LeaderboardPageClient";
import { getAgents, getLatestCompetitiveTiers } from "@/lib/api/assets";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Leaderboard | ClutchStats.gg",
  description:
    "Valorant competitive act leaderboard by region — RR, wins, and rank icons powered by Henrik and Valorant asset data.",
  path: "/leaderboard",
});

export default async function LeaderboardPage() {
  const tierIcons: Record<string, string> = {};
  const agentIcons: Record<string, string> = {};

  try {
    const [tierSet, agents] = await Promise.all([
      getLatestCompetitiveTiers(),
      getAgents(),
    ]);
    for (const t of tierSet.tiers) {
      if (t.smallIcon) tierIcons[String(t.tier)] = t.smallIcon;
    }
    for (const a of agents) {
      agentIcons[a.uuid.toLowerCase()] = a.displayIcon;
    }
  } catch (err) {
    console.error("[leaderboard] failed to load Valorant static assets", err);
  }

  return <LeaderboardPageClient tierIcons={tierIcons} agentIcons={agentIcons} />;
}
