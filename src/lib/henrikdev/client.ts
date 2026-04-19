// ─── HenrikDev API client ─────────────────────────────────────────────────────
// Thin wrapper over fetch for the api.henrikdev.xyz base. Uses the same
// HENRIK_API_KEY env var as the existing HenrikClient in src/lib/api/henrik.ts.
// Base URL is https://api.henrikdev.xyz (no /valorant suffix) so callers can
// pass full paths like /valorant/v1/premier/...

const BASE_URL = 'https://api.henrikdev.xyz';

// ─── Error class ─────────────────────────────────────────────────────────────

export type HenrikDevErrorKind =
  | 'rate_limited'
  | 'not_found'
  | 'forbidden'
  | 'riot_down'
  | 'api_error'
  | 'unknown';

export class HenrikDevError extends Error {
  constructor(
    public readonly kind: HenrikDevErrorKind,
    message: string,
    public readonly httpStatus: number,
  ) {
    super(message);
    this.name = 'HenrikDevError';
  }
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

export async function getHenrikDev<T>(
  path: string,
  options: { revalidate?: number; signal?: AbortSignal } = {},
): Promise<T> {
  const apiKey = process.env.HENRIK_API_KEY;
  if (!apiKey) {
    throw new HenrikDevError('forbidden', 'HENRIK_API_KEY is not configured', 403);
  }

  const url = `${BASE_URL}${path}`;

  // AbortController for 8-second timeout (matches existing HenrikClient pattern)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8_000);
  const signal = options.signal ?? controller.signal;
  const t0 = Date.now();

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      ...(options.revalidate !== undefined
        ? { next: { revalidate: options.revalidate } }
        : {}),
      signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if ((err as { name?: string }).name === 'AbortError') {
      throw new HenrikDevError('api_error', 'Henrik API request timed out (8s)', 408);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  console.debug(`[HenrikDev] ${path} → ${res.status} (${Date.now() - t0}ms)`);

  if (!res.ok) {
    const retryAfterHeader = res.headers.get('Retry-After');
    const body: { message?: string; errors?: Array<{ message?: string }> } =
      await res.json().catch(() => ({}));
    const message = body?.message ?? body?.errors?.[0]?.message ?? res.statusText;

    switch (res.status) {
      case 429:
        throw new HenrikDevError(
          'rate_limited',
          `Rate limited — retry after ${retryAfterHeader ?? '60'}s`,
          429,
        );
      case 404:
        throw new HenrikDevError('not_found', `Not found: ${message}`, 404);
      case 403:
        throw new HenrikDevError('forbidden', 'Invalid or missing API key', 403);
      case 500:
      case 503:
        throw new HenrikDevError('riot_down', `Server error: ${message}`, res.status);
      default:
        throw new HenrikDevError('unknown', message, res.status);
    }
  }

  const json: { status: number; data: T } = await res.json();
  return json.data;
}
