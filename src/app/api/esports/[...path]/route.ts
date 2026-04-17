import { NextRequest, NextResponse } from 'next/server';

// vlrggapi.vercel.app is permanently down (DEPLOYMENT_DISABLED).
// vlr.orlandomm.net/api/v1 is the maintained replacement.
const VLR_BASE_URL = 'https://vlr.orlandomm.net/api/v1';

// ─── In-Memory Cache ──────────────────────────────────────────────────────────

interface CacheEntry {
  data: unknown;
  status: number;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

/** Per-path TTL rules (milliseconds). Evaluated against rewritten path. */
const TTL_RULES: Array<{ pattern: RegExp; ttl: number }> = [
  { pattern: /^\/matches$/,   ttl: 30_000 },    // 30 s — live + upcoming
  { pattern: /^\/results/,    ttl: 300_000 },   // 5 min — past results
  { pattern: /^\/rankings/,   ttl: 3_600_000 }, // 1 h — rankings
  { pattern: /^\/events/,     ttl: 300_000 },   // 5 min — events list
  { pattern: /^\/news/,       ttl: 600_000 },   // 10 min — news feed
];

const DEFAULT_TTL = 120_000;

function getTTL(path: string): number {
  for (const rule of TTL_RULES) {
    if (rule.pattern.test(path)) return rule.ttl;
  }
  return DEFAULT_TTL;
}

function evictExpired(): void {
  const now = Date.now();
  cache.forEach((entry, key) => {
    if (entry.expiresAt < now) cache.delete(key);
  });
}

// ─── Path Rewriter ────────────────────────────────────────────────────────────

function rewriteVlrPath(
  path: string,
  params: URLSearchParams
): { path: string; rewrittenSearch: string; statusFilter?: 'live' | 'upcoming' | null } {
  if (path === '/match' || path.startsWith('/match?')) {
    const q = params.get('q') ?? '';
    const page = params.get('page');
    if (q === 'results') {
      const ps = page ? `?page=${page}` : '';
      return { path: '/results', rewrittenSearch: ps };
    }
    // Both live_score and upcoming map to /matches; filter by status field afterward
    const statusFilter = q === 'live_score' ? 'live' : q === 'upcoming' ? 'upcoming' : null;
    return { path: '/matches', rewrittenSearch: '', statusFilter };
  }

  if (path.startsWith('/match/')) {
    return { path: '/__no_match_detail__', rewrittenSearch: '' };
  }

  const forwarded = new URLSearchParams();
  params.forEach((v, k) => { if (k !== 'q') forwarded.set(k, v); });
  const qs = forwarded.size ? `?${forwarded.toString()}` : '';
  return { path, rewrittenSearch: qs };
}

// ─── VLR Response Normalizers ─────────────────────────────────────────────────
// The vlr.orlandomm.net API uses a different shape than what our components
// expect (built for the old vlrggapi format). We normalize here so components
// need no changes.

type RawTeam = { name?: unknown; score?: unknown; country?: unknown; won?: unknown };

function safeStr(v: unknown): string {
  return typeof v === 'string' ? v : String(v ?? '');
}

function safeScore(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** /matches → VLRMatch shape the components expect */
function normalizeMatch(raw: unknown): unknown {
  const m = raw as Record<string, unknown>;
  const teams = Array.isArray(m.teams) ? (m.teams as RawTeam[]) : [];
  const t1 = teams[0] ?? {};
  const t2 = teams[1] ?? {};
  const statusRaw = safeStr(m.status).toUpperCase();

  return {
    id: safeStr(m.id),
    url: '',
    match_page: '',
    team1: {
      name: safeStr(t1.name),
      logo: '',
      score: safeScore(t1.score),
      record: '',
    },
    team2: {
      name: safeStr(t2.name),
      logo: '',
      score: safeScore(t2.score),
      record: '',
    },
    event: {
      name: safeStr(m.tournament ?? m.event),
      logo: safeStr(m.img),
    },
    series: {
      name: safeStr(m.event),
      full_name: safeStr(m.event),
    },
    time_until_match: safeStr(m.in),
    unix_timestamp: m.timestamp ? Number(m.timestamp) : null,
    status: statusRaw === 'LIVE' ? 'live' : statusRaw === 'COMPLETED' ? 'completed' : 'upcoming',
  };
}

/** /results → VLRResult shape */
function normalizeResult(raw: unknown): unknown {
  const m = raw as Record<string, unknown>;
  const teams = Array.isArray(m.teams) ? (m.teams as RawTeam[]) : [];
  const t1 = teams[0] ?? {};
  const t2 = teams[1] ?? {};
  const winner = t1.won ? safeStr(t1.name) : t2.won ? safeStr(t2.name) : '';

  return {
    id: safeStr(m.id),
    url: '',
    match_page: '',
    team1: {
      name: safeStr(t1.name),
      logo: '',
      score: Number(t1.score ?? 0),
      record: '',
    },
    team2: {
      name: safeStr(t2.name),
      logo: '',
      score: Number(t2.score ?? 0),
      record: '',
    },
    event: {
      name: safeStr(m.tournament ?? m.event),
      logo: safeStr(m.img),
    },
    series: {
      name: safeStr(m.event),
      full_name: safeStr(m.event),
    },
    time_completed: safeStr(m.ago),
    unix_timestamp: m.timestamp ? Number(m.timestamp) : 0,
    status: 'completed',
    winner,
  };
}

/** /events → VLREvent shape */
function normalizeEvent(raw: unknown): unknown {
  const e = raw as Record<string, unknown>;
  return {
    id: safeStr(e.id),
    title: safeStr(e.name),
    status: safeStr(e.status) || 'upcoming',
    prizepool: e.prizepool != null ? safeStr(e.prizepool) || null : null,
    dates: safeStr(e.dates),
    country: safeStr(e.country),
    region: '',
    logo: safeStr(e.img),
    url: '',
  };
}

/**
 * Normalizes the raw VLR API response so it matches the shape that our
 * components were written for (based on old vlrggapi format).
 */
function normalizeVlrResponse(path: string, raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const obj = raw as Record<string, unknown>;

  // Wrap status "OK" → 200 so components that check numeric status work
  const status = typeof obj.status === 'number' ? obj.status : 200;

  if (!Array.isArray(obj.data)) return { ...obj, status };

  let items: unknown[];
  if (path === '/matches') {
    items = obj.data.map(normalizeMatch);
  } else if (path === '/results') {
    items = obj.data.map(normalizeResult);
  } else if (path.startsWith('/events')) {
    items = obj.data.map(normalizeEvent);
  } else {
    items = obj.data;
  }

  return { status, data: items };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const rawPath = '/' + params.path.join('/');

  const { path, rewrittenSearch, statusFilter } = rewriteVlrPath(rawPath, request.nextUrl.searchParams);

  // Short-circuit for paths with no upstream endpoint
  if (path === '/__no_match_detail__') {
    return NextResponse.json({ status: 404, data: null }, { status: 200 });
  }

  const cacheKey = `${path}${rewrittenSearch}`;

  if (Math.random() < 0.05) evictExpired();

  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data, {
      status: cached.status,
      headers: {
        'X-Cache': 'HIT',
        'X-Cache-Expires': new Date(cached.expiresAt).toISOString(),
      },
    });
  }

  const upstreamUrl = `${VLR_BASE_URL}${path}${rewrittenSearch}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (upstream.status === 404) {
      return NextResponse.json({ status: 200, data: [] }, { status: 200 });
    }

    if (upstream.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    if (upstream.status >= 500) {
      return NextResponse.json(
        { error: 'VLR API server error', upstreamStatus: upstream.status },
        { status: 502 }
      );
    }

    const raw = await upstream.json();
    let data = normalizeVlrResponse(path, raw);

    // Filter live vs upcoming when both come from the same /matches endpoint
    if (statusFilter && data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>).data)) {
      const obj = data as Record<string, unknown>;
      obj.data = (obj.data as unknown[]).filter((item) => {
        const m = item as Record<string, unknown>;
        return m.status === statusFilter;
      });
      data = obj;
    }

    const ttl = getTTL(path);

    cache.set(cacheKey, { data, status: 200, expiresAt: Date.now() + ttl });

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'X-Cache': 'MISS',
        'X-Cache-TTL': String(ttl / 1000),
      },
    });
  } catch (err) {
    console.error('[VLR Proxy] Fetch failed:', err);
    return NextResponse.json(
      { error: 'Failed to reach VLR API — please try again' },
      { status: 503 }
    );
  }
}
