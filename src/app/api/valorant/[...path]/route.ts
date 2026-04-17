import { NextRequest, NextResponse } from 'next/server';

const HENRIK_BASE_URL = 'https://api.henrikdev.xyz/valorant';

// ─── In-Memory Cache ──────────────────────────────────────────────────────────

interface CacheEntry {
  data: unknown;
  status: number;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

/** Per-path TTL rules (milliseconds). Evaluated in order — first match wins. */
const TTL_RULES: Array<{ pattern: RegExp; ttl: number }> = [
  { pattern: /\/match\/[^/?]+$/, ttl: 86_400_000 },  // single match — immutable
  { pattern: /\/leaderboard/,    ttl: 900_000 },      // 15 min
  { pattern: /\/account\//,      ttl: 300_000 },      // 5 min
  { pattern: /\/mmr\//,          ttl: 300_000 },      // 5 min
  { pattern: /\/mmr-history\//,  ttl: 120_000 },      // 2 min
  { pattern: /\/matches\//,      ttl: 120_000 },      // 2 min
];

const DEFAULT_TTL = 120_000;

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

// ─── Rate-Limit Tracker ───────────────────────────────────────────────────────

let rateLimitRemaining = 30;
let rateLimitReset = Date.now() + 60_000;

function trackRateLimit(headers: Headers): void {
  const remaining = headers.get('X-RateLimit-Remaining');
  const reset = headers.get('X-RateLimit-Reset');
  const limit = headers.get('X-RateLimit-Limit');

  if (remaining !== null) {
    rateLimitRemaining = parseInt(remaining, 10);
    if (reset) rateLimitReset = parseInt(reset, 10) * 1000;

    console.info(
      `[Henrik Proxy] rate-limit: ${remaining}/${limit ?? '?'} remaining, ` +
        `resets ${new Date(rateLimitReset).toISOString()}`
    );
  }

  if (rateLimitRemaining <= 5) {
    console.warn(
      `[Henrik Proxy] Rate limit critically low: ${rateLimitRemaining} requests remaining`
    );
  }
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const apiKey = process.env.HENRIK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Henrik API key is not configured on the server' },
      { status: 500 }
    );
  }

  const path = '/' + params.path.join('/');
  const search = request.nextUrl.search;
  const cacheKey = `${path}${search}`;

  // Probabilistic cache sweep (5 % of requests) to avoid unbounded growth
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

  // ── Proxy to Henrik ──
  const upstreamUrl = `${HENRIK_BASE_URL}${path}${search}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
    });

    trackRateLimit(upstream.headers);

    // Handle specific upstream error codes before attempting to parse body
    if (upstream.status === 429) {
      const retryAfter = upstream.headers.get('Retry-After') ?? '60';
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: parseInt(retryAfter, 10) },
        { status: 429, headers: { 'Retry-After': retryAfter } }
      );
    }

    if (upstream.status === 404) {
      return NextResponse.json(
        { error: 'Player or resource not found' },
        { status: 404 }
      );
    }

    if (upstream.status === 403) {
      return NextResponse.json(
        { error: 'Forbidden — check your Henrik API key' },
        { status: 403 }
      );
    }

    if (upstream.status >= 500) {
      return NextResponse.json(
        { error: 'Henrik API returned a server error', upstreamStatus: upstream.status },
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
    console.error('[Henrik Proxy] Fetch failed:', err);
    return NextResponse.json(
      { error: 'Failed to reach Henrik API — please try again' },
      { status: 503 }
    );
  }
}
