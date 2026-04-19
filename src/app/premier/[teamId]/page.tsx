import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/page-metadata";
import { PremierTeamProfile } from "@/components/premier/PremierTeamProfile";
import {
  getPremierTeamById,
  getPremierTeamHistory,
  getPremierLeaderboard,
  divisionName,
  type PremierMatchHistoryEntry,
  type PremierLeaderboardEntry,
} from "@/lib/henrikdev/premier";
import { HenrikDevError } from "@/lib/henrikdev/client";

export async function generateMetadata({
  params,
}: {
  params: { teamId: string };
}): Promise<Metadata> {
  try {
    const team = await getPremierTeamById(params.teamId);
    return pageMetadata({
      title: `${team.name} #${team.tag} | Premier | ClutchStats.gg`,
      description: `${team.name} — ${divisionName(team.division)} division, ${team.affinity.toUpperCase()} · ${team.wins ?? "?"}W-${team.losses ?? "?"}L on ClutchStats.gg Premier.`,
      path: `/premier/${params.teamId}`,
    });
  } catch {
    return pageMetadata({
      title: "Team Not Found | ClutchStats.gg",
      description: "This Premier team could not be found.",
      path: `/premier/${params.teamId}`,
    });
  }
}

export default async function PremierTeamPage({
  params,
}: {
  params: { teamId: string };
}) {
  let history: PremierMatchHistoryEntry[] = [];
  let contextTeams: PremierLeaderboardEntry[] = [];

  let team;
  try {
    team = await getPremierTeamById(params.teamId);
  } catch (err) {
    if (err instanceof HenrikDevError && err.kind === "not_found") {
      notFound();
    }
    throw err;
  }

  // Fetch history and regional leaderboard for context in parallel.
  [history, contextTeams] = await Promise.all([
    getPremierTeamHistory(params.teamId)
      .then((h) => h.league_matches)
      .catch((): PremierMatchHistoryEntry[] => []),
    getPremierLeaderboard(team.affinity).catch((): PremierLeaderboardEntry[] => []),
  ]);

  return (
    <PremierTeamProfile
      team={team}
      history={history}
      contextTeams={contextTeams}
    />
  );
}
