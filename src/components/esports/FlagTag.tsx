export function FlagTag({ code }: { code?: string }) {
  if (!code) return null;
  const short = code
    .replace(/^flag_/i, "")
    .replace(/_/g, "")
    .slice(0, 4)
    .toUpperCase();
  if (!short) return null;
  return (
    <span className="font-mono-display text-[10px] uppercase tracking-wide text-white/35" title={code}>
      {short}
    </span>
  );
}
