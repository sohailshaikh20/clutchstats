import type { Metadata } from "next";
import Link from "next/link";
import { getVLRClient } from "@/lib/api/vlr";
import { pageMetadata } from "@/lib/page-metadata";
import type { VLREvent } from "@/types/esports";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return pageMetadata({
    title: `Event ${params.id} | ClutchStats.gg`,
    description: "VCT event hub on ClutchStats.gg — schedules, teams, and results.",
    path: `/esports/event/${params.id}`,
  });
}

async function findEvent(id: string): Promise<VLREvent | null> {
  const client = getVLRClient();
  const statuses = ["ongoing", "upcoming", "completed"] as const;
  for (const st of statuses) {
    try {
      const res = await client.getEvents(st);
      const hit = res.data.find((e) => e.id === id);
      if (hit) return hit;
    } catch {
      /* continue */
    }
  }
  return null;
}

export default async function EsportsEventPage({ params }: { params: { id: string } }) {
  const event = await findEvent(params.id);

  if (!event) {
    return (
      <div className="min-h-screen bg-background px-4 py-16 text-center">
        <p className="font-heading text-lg font-bold text-text-primary">Event not found</p>
        <Link href="/esports" className="mt-6 inline-block text-accent-blue hover:underline">
          ← Esports hub
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 pt-8 sm:pt-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <nav className="mb-6 font-body text-sm text-text-secondary">
          <Link href="/esports" className="hover:text-text-primary">
            Esports
          </Link>
          <span className="mx-2 text-white/25">/</span>
          <span className="text-text-primary">Event</span>
        </nav>
        <h1 className="font-heading text-3xl font-bold text-text-primary">{event.title}</h1>
        <p className="mt-2 font-body text-sm text-text-secondary">{event.dates}</p>
        {event.prizepool && event.prizepool !== "0" && event.prizepool !== "--" ? (
          <p className="mt-3 font-heading text-lg font-bold text-accent-gold">{event.prizepool}</p>
        ) : null}
        <p className="mt-6 font-body text-sm leading-relaxed text-text-secondary">
          Full brackets, participating teams, and live results will appear here as we wire the event
          feed into this page. For now, use the esports hub for schedules and match pages.
        </p>
        <Link
          href="/esports"
          className="mt-8 inline-flex rounded-lg bg-accent-red px-6 py-3 font-heading text-xs font-bold uppercase tracking-wide text-white transition hover:brightness-110"
        >
          Back to esports hub
        </Link>
      </div>
    </div>
  );
}
