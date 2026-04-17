import { CareerRoadmapClient } from "@/components/esports/career-roadmap/CareerRoadmapClient";
import {
  buildRoadmapRankGroups,
  resolveUserRankGroupKey,
  type RoadmapRankGroup,
} from "@/lib/esports/rank-roadmap-data";
import { getAgents, getLatestCompetitiveTiers } from "@/lib/api/assets";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Career Roadmap | ClutchStats.gg",
  description:
    "ClutchStats career roadmap: VCT tournament path from Game Changers to Champions, plus a rank-up guide from Iron to Radiant.",
  path: "/esports/roadmap",
});

export default async function CareerRoadmapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let rankGroups: RoadmapRankGroup[] = [];
  const agentsMin: { displayName: string; displayIcon: string }[] = [];

  try {
    const [tierSet, agents] = await Promise.all([
      getLatestCompetitiveTiers(),
      getAgents(),
    ]);
    rankGroups = buildRoadmapRankGroups(tierSet);
    for (const a of agents) {
      agentsMin.push({ displayName: a.displayName, displayIcon: a.displayIcon });
    }
  } catch (err) {
    console.error("[career-roadmap] failed to load Valorant assets", err);
    rankGroups = [];
  }

  let riotLinked = false;
  let currentHenrikRank: number | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("riot_puuid, riot_name, riot_tag, current_rank")
      .eq("id", user.id)
      .maybeSingle();
    riotLinked = Boolean(profile?.riot_puuid && profile?.riot_name && profile?.riot_tag);
    currentHenrikRank =
      typeof profile?.current_rank === "number" ? profile.current_rank : null;
  }

  const userRankGroupKey = resolveUserRankGroupKey(riotLinked, currentHenrikRank, rankGroups);

  return (
    <div className="min-h-screen bg-background pb-20 pt-6 sm:pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-text-secondary">
          <Link href="/esports" className="hover:text-text-primary">
            Esports
          </Link>
          <span className="mx-2 text-white/25">/</span>
          <span className="text-text-primary">Career roadmap</span>
        </nav>

        <header className="mb-10 max-w-3xl">
          <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent-red">
            ClutchStats exclusive
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-text-primary md:text-4xl">
            Career roadmap
          </h1>
          <p className="mt-3 text-sm text-text-secondary sm:text-base">
            Navigate the VCT pipeline like a metro map, then climb ranked with structured milestones —
            built only on ClutchStats.gg.
          </p>
        </header>

        <CareerRoadmapClient
          rankGroups={rankGroups}
          agents={agentsMin}
          userRankGroupKey={userRankGroupKey}
          riotLinked={riotLinked}
        />
      </div>
    </div>
  );
}
