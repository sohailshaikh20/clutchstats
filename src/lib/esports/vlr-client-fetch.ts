/** Browser-side fetch to the app’s VLR proxy (`/api/esports/[...path]`). */
export async function fetchVlrProxy<T>(pathAndQuery: string): Promise<T> {
  const url = `/api/esports${pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`VLR proxy ${res.status}`);
  }
  return (await res.json()) as T;
}

export type SegmentsEnvelope<T> = { status: number; data: T[] };

export function unwrapSegments<T>(raw: unknown): T[] {
  if (
    raw &&
    typeof raw === "object" &&
    "data" in raw &&
    raw.data &&
    typeof raw.data === "object" &&
    "segments" in raw.data &&
    Array.isArray((raw.data as { segments: unknown }).segments)
  ) {
    return (raw.data as { segments: T[] }).segments;
  }
  if (raw && typeof raw === "object" && "data" in raw && Array.isArray((raw as { data: unknown }).data)) {
    return (raw as { data: T[] }).data;
  }
  return [];
}
