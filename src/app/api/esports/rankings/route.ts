import { NextResponse } from 'next/server';

const VLR_RESULTS_URL = 'https://vlr.orlandomm.net/api/v1/results';

// Map tournament name fragments → league key
const LEAGUE_MAP: Array<{ pattern: RegExp; league: string }> = [
  { pattern: /americas/i,  league: 'Americas' },
  { pattern: /emea/i,      league: 'EMEA' },
  { pattern: /pacific/i,   league: 'Pacific' },
  { pattern: /china/i,     league: 'China' },
  { pattern: /\bcn\b/i,    league: 'China' },
  { pattern: /\bna\b/i,    league: 'Americas' },
  { pattern: /\beu\b/i,    league: 'EMEA' },
  { pattern: /\bap\b/i,    league: 'Pacific' },
];

function detectLeague(tournament: string): string | null {
  for (const { pattern, league } of LEAGUE_MAP) {
    if (pattern.test(tournament)) return league;
  }
  return null;
}

type RawTeam = { name?: unknown; score?: unknown; won?: unknown; country?: unknown };
type StandingRow = {
  name: string;
  wins: number;
  losses: number;
  points: number;
  form: string[];
  league: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') ?? 'americas';

  const leagueTarget = {
    americas: 'Americas',
    na: 'Americas',
    emea: 'EMEA',
    eu: 'EMEA',
    pacific: 'Pacific',
    ap: 'Pacific',
    china: 'China',
    cn: 'China',
  }[region.toLowerCase()] ?? 'Americas';

  try {
    // Fetch 2 pages of results to compute standings
    const [p1, p2] = await Promise.all([
      fetch(`${VLR_RESULTS_URL}?page=1`, { next: { revalidate: 300 } }).then(r => r.json()).catch(() => null),
      fetch(`${VLR_RESULTS_URL}?page=2`, { next: { revalidate: 300 } }).then(r => r.json()).catch(() => null),
    ]);

    const allResults = [
      ...(Array.isArray(p1?.data) ? p1.data : []),
      ...(Array.isArray(p2?.data) ? p2.data : []),
    ] as Array<Record<string, unknown>>;

    // Filter to target league's matches only
    const leagueMatches = allResults.filter(m => {
      const t = String(m.tournament ?? m.event ?? '');
      return detectLeague(t) === leagueTarget;
    });

    // Aggregate standings per team
    const teamMap = new Map<string, StandingRow>();

    for (const m of leagueMatches) {
      const teams = Array.isArray(m.teams) ? (m.teams as RawTeam[]) : [];
      const t1 = teams[0];
      const t2 = teams[1];
      if (!t1 || !t2) continue;

      const name1 = String(t1.name ?? '');
      const name2 = String(t2.name ?? '');
      if (!name1 || !name2) continue;

      const t1Won = Boolean(t1.won);
      const t2Won = Boolean(t2.won);

      for (const [name, won] of [[name1, t1Won], [name2, t2Won]] as [string, boolean][]) {
        const prev = teamMap.get(name) ?? { name, wins: 0, losses: 0, points: 0, form: [], league: leagueTarget };
        if (won) {
          prev.wins += 1;
          prev.points += 3;
          if (prev.form.length < 10) prev.form.push('W');
        } else {
          prev.losses += 1;
          if (prev.form.length < 10) prev.form.push('L');
        }
        teamMap.set(name, prev);
      }
    }

    // Sort by points desc, then wins
    const rows = Array.from(teamMap.values())
      .filter(r => r.wins + r.losses >= 1)
      .sort((a, b) => b.points - a.points || b.wins - a.wins)
      .slice(0, 20)
      .map((r, i) => ({
        rank: i + 1,
        team: { id: r.name, name: r.name, logo: '', url: '' },
        points: r.points,
        record: `${r.wins}W–${r.losses}L`,
        last_results: r.form.slice(-5).reverse(),
        earnings: null,
        rank_change: null,
      }));

    return NextResponse.json({ rows, source: 'computed', league: leagueTarget }, { status: 200 });
  } catch (err) {
    console.error('[esports/rankings] Error:', err);
    return NextResponse.json({ rows: [], source: 'error' }, { status: 200 });
  }
}
