import { NextResponse } from 'next/server';
import { getHenrikClient } from '@/lib/api/henrik';
import { parseHenrikLeaderboardV1 } from '@/lib/leaderboard/parse-henrik-leaderboard';

export const revalidate = 900; // 15 min

export async function GET() {
  try {
    const client = getHenrikClient();
    const res = await client.getLeaderboard('na', { size: 10 });
    const parsed = parseHenrikLeaderboardV1(res);

    if (!parsed || parsed.rows.length === 0) {
      return NextResponse.json({ rows: [], source: 'empty' }, { status: 200 });
    }

    return NextResponse.json({ rows: parsed.rows.slice(0, 10), source: 'live' }, { status: 200 });
  } catch (err) {
    console.error('[leaderboard/preview] Error:', err);
    return NextResponse.json({ rows: [], source: 'error' }, { status: 200 });
  }
}
