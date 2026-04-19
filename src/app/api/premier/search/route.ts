import { NextRequest, NextResponse } from 'next/server';
import { searchPremierTeams } from '@/lib/henrikdev/premier';
import { HenrikDevError } from '@/lib/henrikdev/client';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (!q || q.length < 2) {
    return NextResponse.json({ teams: [] }, { status: 200 });
  }

  // Support "Name#Tag" style search
  const hashIdx = q.lastIndexOf('#');
  const name = hashIdx > 0 ? q.slice(0, hashIdx) : q;
  const tag = hashIdx > 0 ? q.slice(hashIdx + 1) : undefined;

  try {
    const teams = await searchPremierTeams(name, tag);
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
        default:
          return NextResponse.json({ error: err.message }, { status: 500 });
      }
    }
    console.error('[premier/search] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
