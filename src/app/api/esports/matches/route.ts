import { NextResponse } from "next/server";
import { getVLRClient } from "@/lib/api/vlr";
import type { EsportsMatchCardDTO, VLRMatch } from "@/types/esports";

function toCard(m: VLRMatch, isLive: boolean): EsportsMatchCardDTO {
  const timeLabel = isLive
    ? "LIVE"
    : m.time_until_match ||
      (m.unix_timestamp
        ? new Date(m.unix_timestamp * 1000).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "TBD");

  const vlrUrl =
    m.url ||
    (m.match_page?.startsWith("http")
      ? m.match_page
      : m.match_page
        ? `https://www.vlr.gg${m.match_page}`
        : "https://www.vlr.gg");

  return {
    id: m.id,
    team1: {
      name: m.team1.name,
      logo: m.team1.logo,
      score: m.team1.score,
    },
    team2: {
      name: m.team2.name,
      logo: m.team2.logo,
      score: m.team2.score,
    },
    eventName: m.event?.name ?? m.series?.name ?? "Tournament",
    isLive,
    timeLabel,
    unixTimestamp: m.unix_timestamp,
    vlrUrl,
  };
}

export async function GET() {
  const vlr = getVLRClient();

  const [liveRes, upcomingRes] = await Promise.allSettled([
    vlr.getLiveMatches(),
    vlr.getUpcomingMatches(),
  ]);

  const live: VLRMatch[] =
    liveRes.status === "fulfilled" && Array.isArray(liveRes.value.data)
      ? liveRes.value.data
      : [];

  const upcoming: VLRMatch[] =
    upcomingRes.status === "fulfilled" && Array.isArray(upcomingRes.value.data)
      ? upcomingRes.value.data
      : [];

  const seen = new Set<string>();
  const cards: EsportsMatchCardDTO[] = [];

  for (const m of live) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    cards.push(toCard(m, true));
  }

  for (const m of upcoming) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    cards.push(toCard(m, false));
  }

  return NextResponse.json(
    { matches: cards },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}
