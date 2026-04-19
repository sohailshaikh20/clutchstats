import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { PremierTeamProfile } from "@/components/premier/PremierTeamProfile";
import { getTeamById } from "@/lib/premier/mockData";

export async function generateMetadata({
  params,
}: {
  params: { teamId: string };
}): Promise<Metadata> {
  const team = getTeamById(params.teamId);
  if (!team) {
    return pageMetadata({
      title: "Team Not Found | ClutchStats.gg",
      description: "This Premier team could not be found.",
      path: `/premier/${params.teamId}`,
    });
  }
  return pageMetadata({
    title: `${team.name} #${team.tag} | Premier | ClutchStats.gg`,
    description: `${team.name} — ${team.division} division, ${team.region} · ${team.record.w}W-${team.record.l}L on ClutchStats.gg Premier.`,
    path: `/premier/${params.teamId}`,
  });
}

export default function PremierTeamPage({
  params,
}: {
  params: { teamId: string };
}) {
  const team = getTeamById(params.teamId);
  return <PremierTeamProfile team={team} />;
}
