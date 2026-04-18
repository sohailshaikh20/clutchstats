/** Strip trailing zeros after decimal (e.g. 1.50 → "1.5", 2.00 → "2"). */
export function formatStat(value: number, format: "number" | "percent" | "integer"): string {
  if (format === "integer") return Math.round(value).toString();
  if (format === "percent") return `${value.toFixed(1)}%`;
  const s = value.toFixed(2);
  const trimmed = s.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  return trimmed === "" || trimmed === "-0" ? "0" : trimmed;
}

export function formatDelta(delta: number, opts?: { suffix?: string }): string {
  const suf = opts?.suffix ?? "";
  if (Math.abs(delta) < 1e-9) return `0${suf}`;
  const sign = delta > 0 ? "+" : "";
  const body = Number.isInteger(delta) ? String(Math.trunc(delta)) : formatStat(delta, "number");
  return `${sign}${body}${suf}`;
}

export function formatRelativeTime(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  const diff = Math.max(0, Date.now() - t);
  const sec = diff / 1000;
  if (sec < 45) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 86400 * 30) return `${Math.floor(sec / 86400)}d ago`;
  return `${Math.floor(sec / (86400 * 30))}mo ago`;
}
