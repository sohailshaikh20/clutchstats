import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return pageMetadata({
    title: `Team ${params.id} | ClutchStats.gg`,
    description: "VCT team profile on ClutchStats.gg.",
    path: `/esports/team/${params.id}`,
  });
}

export default function EsportsTeamPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background px-4 py-16 text-center">
      <p className="font-heading text-2xl font-bold text-text-primary">Team hub</p>
      <p className="mx-auto mt-3 max-w-md font-body text-sm text-text-secondary">
        Roster, schedule, and match history for team ID <span className="font-mono">{params.id}</span>{" "}
        will appear here as we finish wiring the esports graph.
      </p>
      <Link href="/esports" className="mt-8 inline-block text-accent-blue hover:underline">
        ← Esports hub
      </Link>
    </div>
  );
}
