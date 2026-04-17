import { NextResponse } from 'next/server';
import type { EsportsMatchCardDTO } from '@/types/esports';

const VLR_MATCHES_URL = 'https://vlr.orlandomm.net/api/v1/matches';

export async function GET() {
  try {
    const res = await fetch(VLR_MATCHES_URL, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json({ matches: [] }, { status: 200 });
    }

    const json = (await res.json()) as { data?: unknown[] };
    const raw = Array.isArray(json.data) ? json.data : [];

    const matches: EsportsMatchCardDTO[] = raw.slice(0, 12).map((item) => {
      const m = item as Record<string, unknown>;
      const teams = Array.isArray(m.teams)
        ? (m.teams as Array<Record<string, unknown>>)
        : [];
      const t1 = teams[0] ?? {};
      const t2 = teams[1] ?? {};
      const statusRaw = String(m.status ?? '').toUpperCase();
      const isLive = statusRaw === 'LIVE';
      const score1 = t1.score != null && t1.score !== '' ? Number(t1.score) : null;
      const score2 = t2.score != null && t2.score !== '' ? Number(t2.score) : null;
      return {
        id: String(m.id ?? ''),
        team1: { name: String(t1.name ?? ''), logo: '', score: score1 },
        team2: { name: String(t2.name ?? ''), logo: '', score: score2 },
        eventName: String(m.tournament ?? m.event ?? ''),
        isLive,
        timeLabel: isLive ? 'LIVE' : String(m.in ?? ''),
        unixTimestamp: m.timestamp ? Number(m.timestamp) : null,
        vlrUrl: m.id ? `https://www.vlr.gg/${m.id}` : 'https://www.vlr.gg',
      };
    });

    return NextResponse.json({ matches });
  } catch (err) {
    console.error('[esports/matches] fetch failed:', err);
    return NextResponse.json({ matches: [] }, { status: 200 });
  }
}
