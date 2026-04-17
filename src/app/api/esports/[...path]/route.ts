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

/** Per-path TTL rules (milliseconds). Evaluated against full path+querystring. */
const TTL_RULES: Array<{ pattern: RegExp; ttl: number }> = [
  { pattern: /\/match.*q=live/,     ttl: 30_000 },      // 30 s — live scores
  { pattern: /\/match.*q=upcoming/, ttl: 60_000 },      // 1 min — schedule
  { pattern: /\/match.*q=results/,  ttl: 300_000 },     // 5 min — past results
  { pattern: /\/match\/[^/?]+$/,    ttl: 3_600_000 },   // 1 h — match detail
  { pattern: /\/rankings/,          ttl: 3_600_000 },   // 1 h — rankings
  { pattern: /\/events/,            ttl: 300_000 },     // 5 min — events list
  { pattern: /\/news/,              ttl: 600_000 },     // 10 min — news feed
];

const DEFAULT_TTL = 120_000; // 2 min fallback

function getTTL(path: string, search: string): number {
  const full = `${path}${search}`;
  for (const rule of TTL_RULES) {
    if (rule.pattern.test(full)) return rule.ttl;
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
// Maps legacy vlrggapi-style paths to vlr.orlandomm.net/api/v1 paths.

function rewriteVlrPath(
  path: string,
  params: URLSearchParams
): { path: string; rewrittenSearch: string } {
  // /match  →  depends on ?q= param
  if (path === '/match' || path.startsWith('/match?')) {
    const q = params.get('q') ?? '';
    const page = params.get('page');

    if (q === 'results') {
      const ps = page ? `?page=${page}` : '';
      return { path: '/results', rewrittenSearch: ps };
    }
    // live_score and upcoming both map to /matches in the new API;
    // the component separates them by the status field in the response.
    return { path: '/matches', rewrittenSearch: '' };
  }

  // /match/:id  →  no per-match detail endpoint in new API; return empty
  if (path.startsWith('/match/')) {
    return { path: '/__no_match_detail__', rewrittenSearch: '' };
  }

  // /rankings, /events, /news  →  pass through (same paths in new API)
  const forwarded = new URLSearchParams();
  params.forEach((v, k) => { if (k !== 'q') forwarded.set(k, v); });
  const qs = forwarded.size ? `?${forwarded.toString()}` : '';
  return { path, rewrittenSearch: qs };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const rawPath = '/' + params.path.join('/');
  const search = request.nextUrl.search;

  // ── Rewrite old vlrggapi path style → vlr.orlandomm.net style ────────────
  // Components still call /match?q=results, /match?q=live_score, etc.
  // New API uses /results, /matches, /events, /rankings directly.
  const { path, rewrittenSearch } = rewriteVlrPath(rawPath, request.nextUrl.searchParams);

  const cacheKey = `${path}${rewrittenSearch}`;

  // Probabilistic cache sweep — keeps memory usage bounded without a timer
  if (Math.random() < 0.05) evictExpired();

  // ── Cache hit ──
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

  // ── Proxy to VLR API ──
  const upstreamUrl = `${VLR_BASE_URL}${path}${rewrittenSearch}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (upstream.status === 404) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
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

    const data = await upstream.json();
    const ttl = getTTL(path, search);

    cache.set(cacheKey, { data, status: upstream.status, expiresAt: Date.now() + ttl });

    return NextResponse.json(data, {
      status: upstream.status,
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
