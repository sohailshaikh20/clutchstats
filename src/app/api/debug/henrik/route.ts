import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.HENRIK_API_KEY;

  const keyPresent = Boolean(apiKey);
  const keyPrefix = apiKey ? apiKey.slice(0, 10) + '...' : null;

  let upstreamStatus: number | null = null;
  let upstreamBody: unknown = null;
  let fetchError: string | null = null;

  if (apiKey) {
    try {
      const res = await fetch(
        'https://api.henrikdev.xyz/valorant/v1/account/CB10/Aegon',
        {
          headers: { Authorization: apiKey },
          cache: 'no-store',
        }
      );
      upstreamStatus = res.status;
      upstreamBody = await res.json().catch(() => null);
    } catch (err) {
      fetchError = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({
    HENRIK_API_KEY_present: keyPresent,
    HENRIK_API_KEY_prefix: keyPrefix,
    upstream_status: upstreamStatus,
    upstream_body: upstreamBody,
    fetch_error: fetchError,
  });
}
