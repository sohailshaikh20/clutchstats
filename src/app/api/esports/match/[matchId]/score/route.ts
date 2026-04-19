import { NextRequest, NextResponse } from "next/server";
import { getMatchDetail } from "@/lib/vlr/matches";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const id = params.matchId?.trim();
  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  try {
    const match = await getMatchDetail(id);
    return NextResponse.json(
      {
        team1Score: match.teams[0]?.score ?? 0,
        team2Score: match.teams[1]?.score ?? 0,
        status: match.status,
      },
      {
        headers: { "Cache-Control": "public, max-age=20, stale-while-revalidate=60" },
      }
    );
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
