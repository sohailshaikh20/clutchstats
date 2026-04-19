import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { PremierLanding } from "@/components/premier/PremierLanding";
import {
  getPremierConferences,
  getPremierLeaderboard,
  searchPremierTeams,
  type PremierConference,
  type PremierLeaderboardEntry,
  type PremierTeamSearchResult,
} from "@/lib/henrikdev/premier";

export const metadata: Metadata = pageMetadata({
  title: "Premier | ClutchStats.gg",
  description:
    "Browse Valorant Premier divisions, scout opponents, and track your team's ranking across every region on ClutchStats.gg.",
  path: "/premier",
});

export default async function PremierPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() ?? "";

  // Fetch conferences and initial NA leaderboard in parallel.
  // Both fall back to empty arrays on error — the UI has empty-state handling.
  const [conferences, initialLeaderboard] = await Promise.all([
    getPremierConferences().catch((): PremierConference[] => []),
    getPremierLeaderboard("na").catch((): PremierLeaderboardEntry[] => []),
  ]);

  // If there's a search query, fetch search results server-side.
  let searchResults: PremierTeamSearchResult[] | undefined;
  if (q.length >= 2) {
    const hashIdx = q.lastIndexOf("#");
    const name = hashIdx > 0 ? q.slice(0, hashIdx) : q;
    const tag = hashIdx > 0 ? q.slice(hashIdx + 1) : undefined;
    searchResults = await searchPremierTeams(name, tag).catch((): PremierTeamSearchResult[] => []);
  }

  const totalTeams = initialLeaderboard.length || undefined;

  return (
    <PremierLanding
      conferences={conferences}
      initialLeaderboard={initialLeaderboard}
      totalTeams={totalTeams}
      searchResults={searchResults}
      searchQuery={q || undefined}
    />
  );
}
