const BASE_URL = "https://vlrggapi.vercel.app";

export type FetchOpts = { revalidate?: number; signal?: AbortSignal };

export class VlrError extends Error {
  constructor(
    public kind: "not_found" | "api_error" | "rate_limited",
    msg: string,
    public httpStatus: number
  ) {
    super(msg);
    this.name = "VlrError";
  }
}

export async function vlrFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    next: opts.revalidate !== undefined ? { revalidate: opts.revalidate } : undefined,
    signal: opts.signal,
  });

  if (res.status === 429) {
    throw new VlrError("rate_limited", "Too many requests", 429);
  }

  if (!res.ok) {
    throw new VlrError(
      res.status === 404 ? "not_found" : "api_error",
      `HTTP ${res.status}`,
      res.status
    );
  }

  const json = (await res.json()) as Record<string, unknown>;

  if (json.status === "error" || json.status === "fail") {
    throw new VlrError(
      "api_error",
      typeof json.message === "string" ? json.message : "API error",
      500
    );
  }

  // vlrggapi v2 envelope: { status: 'success', data: {...} }
  if ("data" in json && json.data !== undefined && json.data !== null) {
    return json.data as T;
  }

  return json as unknown as T;
}
