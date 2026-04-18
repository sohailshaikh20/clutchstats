import { NextResponse } from "next/server";
import { buildClutchMatchDetail } from "@/lib/esports/build-match-detail";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id?.trim();
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }

  try {
    const detail = await buildClutchMatchDetail(id);
    if (!detail) {
      return NextResponse.json({ ok: false, error: "Match not found" }, { status: 404 });
    }
    return NextResponse.json(detail, {
      status: 200,
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch (e) {
    console.error("[api/esports/match]", e);
    return NextResponse.json({ ok: false, error: "Failed to build match detail" }, { status: 500 });
  }
}
