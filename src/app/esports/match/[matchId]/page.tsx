import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EsportsMatchDetail } from "@/components/esports/EsportsMatchDetail";
import { VlrError } from "@/lib/vlr/client";
import { getMatchDetail } from "@/lib/vlr/matches";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: { matchId: string };
}): Promise<Metadata> {
  try {
    const match = await getMatchDetail(params.matchId);
    const title = `${match.event.name || "Match"} | ClutchStats.gg`;
    return pageMetadata({
      title,
      description: `${match.event.series || match.event.name || ""} — VCT match details on ClutchStats.gg.`,
      path: `/esports/match/${params.matchId}`,
    });
  } catch {
    return pageMetadata({
      title: "Match | ClutchStats.gg",
      description: "VCT match details — scores, maps, and stats on ClutchStats.gg.",
      path: `/esports/match/${params.matchId}`,
    });
  }
}

export default async function MatchDetailPage({
  params,
}: {
  params: { matchId: string };
}) {
  try {
    const match = await getMatchDetail(params.matchId);
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-6 pt-6 font-body text-sm text-white/45">
          <nav>
            <Link href="/esports" className="transition-colors hover:text-white">
              Esports
            </Link>
            <span className="mx-2 text-white/25">/</span>
            <span className="text-white/80">Match {params.matchId}</span>
          </nav>
        </div>
        <EsportsMatchDetail match={match} matchId={params.matchId} />
      </div>
    );
  } catch (e) {
    if (e instanceof VlrError && e.kind === "not_found") {
      notFound();
    }
    throw e;
  }
}
