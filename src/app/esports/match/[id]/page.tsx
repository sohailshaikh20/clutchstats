import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { MatchDetailClient } from "@/components/esports/MatchDetailClient";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return pageMetadata({
    title: `Match ${params.id} | ClutchStats.gg`,
    description: "VCT match details on ClutchStats.gg — scores, teams, and tournament context.",
    path: `/esports/match/${params.id}`,
  });
}

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background pb-20 pt-6 sm:pt-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-text-secondary">
          <Link href="/esports" className="hover:text-text-primary">
            Esports
          </Link>
          <span className="mx-2 text-white/25">/</span>
          <span className="text-text-primary">Match {params.id}</span>
        </nav>
        <MatchDetailClient matchId={params.id} />
      </div>
    </div>
  );
}
