import { NextRequest, NextResponse } from 'next/server';
import { getPremierLeaderboard } from '@/lib/henrikdev/premier';
import { HenrikDevError } from '@/lib/henrikdev/client';

const VALID_REGIONS = new Set(['na', 'eu', 'ap', 'kr', 'br', 'latam']);

export async function GET(req: NextRequest) {
  const region = req.nextUrl.searchParams.get('region')?.toLowerCase() ?? 'na';

  if (!VALID_REGIONS.has(region)) {
    return NextResponse.json(
      { error: `Invalid region "${region}". Valid: na, eu, ap, kr, br, latam` },
      { status: 400 },
    );
  }

  try {
    const teams = await getPremierLeaderboard(region);
    return NextResponse.json({ teams }, { status: 200 });
  } catch (err) {
    if (err instanceof HenrikDevError) {
      switch (err.kind) {
        case 'rate_limited':
          return NextResponse.json({ error: err.message }, { status: 429 });
        case 'not_found':
          return NextResponse.json({ teams: [] }, { status: 200 });
        case 'forbidden':
          return NextResponse.json({ error: 'API key error' }, { status: 500 });
        case 'riot_down':
          return NextResponse.json({ error: 'Upstream service unavailable' }, { status: 503 });
        default:
          return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }
    console.error('[premier/leaderboard] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
