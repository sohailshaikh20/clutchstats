import { NextResponse } from "next/server";
import { getLiveMatches, getUpcomingMatches } from "@/lib/vlr/matches";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [liveRes, upRes] = await Promise.all([getLiveMatches(), getUpcomingMatches()]);
    return NextResponse.json(
      {
        live: liveRes.segments ?? [],
        upcoming: upRes.segments ?? [],
      },
      {
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60" },
      }
    );
  } catch (e) {
    console.error("[api/esports/live-feed]", e);
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }
}
