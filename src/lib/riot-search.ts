/** Returns `/player/...` path when input looks like `Name#TAG`, else null. */
export function playerPathFromSearchInput(input: string): string | null {
  const q = input.trim();
  const hash = q.lastIndexOf("#");
  if (hash <= 0) return null;
  const name = encodeURIComponent(q.slice(0, hash));
  const tag = encodeURIComponent(q.slice(hash + 1));
  if (!tag) return null;
  return `/player/${name}/${tag}`;
}
