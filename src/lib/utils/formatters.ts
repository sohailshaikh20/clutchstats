import { RANK_COLORS } from '@/lib/constants/ranks';
import { AGENT_ROLE_ICONS } from '@/lib/constants/agents';

// ─── Combat Stats ─────────────────────────────────────────────────────────────

/** Returns kills/deaths/assists as "22/5/11" */
export function formatKDA(kills: number, deaths: number, assists: number): string {
  return `${kills}/${deaths}/${assists}`;
}

/** Returns K/D ratio as "4.40" with a Tailwind colour class based on performance */
export function formatKDRatio(
  kills: number,
  deaths: number
): { value: string; colorClass: string } {
  const kd = deaths === 0 ? kills : kills / deaths;
  const value = kd.toFixed(2);

  let colorClass: string;
  if (kd >= 2.0) colorClass = 'text-yellow-400';       // exceptional
  else if (kd >= 1.5) colorClass = 'text-green-400';   // great
  else if (kd >= 1.2) colorClass = 'text-emerald-500'; // good
  else if (kd >= 1.0) colorClass = 'text-slate-300';   // neutral
  else if (kd >= 0.8) colorClass = 'text-orange-400';  // below average
  else colorClass = 'text-red-500';                     // poor

  return { value, colorClass };
}

/** Returns win rate as "67.3%" */
export function formatWinRate(wins: number, total: number): string {
  if (total === 0) return '0.0%';
  return `${((wins / total) * 100).toFixed(1)}%`;
}

/** Returns headshot percentage as "34.2%" */
export function formatHeadshotPercent(
  headshots: number,
  bodyshots: number,
  legshots: number
): string {
  const total = headshots + bodyshots + legshots;
  if (total === 0) return '0.0%';
  return `${((headshots / total) * 100).toFixed(1)}%`;
}

/** Returns Average Combat Score per round as a whole number string */
export function formatACS(score: number, rounds: number): string {
  if (rounds === 0) return '0';
  return Math.round(score / rounds).toString();
}

/** Returns Average Damage per Round as "152.4" */
export function formatADR(damage: number, rounds: number): string {
  if (rounds === 0) return '0.0';
  return (damage / rounds).toFixed(1);
}

// ─── Time ─────────────────────────────────────────────────────────────────────

/**
 * Returns a human-readable relative time string.
 * e.g. "2 hours ago", "3 days ago", "just now"
 */
export function formatTimeAgo(date: Date | string | number): string {
  const now = Date.now();
  const time = new Date(date).getTime();
  const diffMs = now - time;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

/** Converts a game duration in milliseconds to "32:14" */
export function formatMatchDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ─── Rank ─────────────────────────────────────────────────────────────────────

/**
 * Returns the hex colour for a given rank tier name.
 * Accepts the full patched name ("Gold 2") or just the division ("gold").
 * Falls back to gray if the tier is not found.
 */
export function getRankColor(tierName: string): string {
  const division = tierName.toLowerCase().split(' ')[0];
  return RANK_COLORS[division] ?? '#9CA3AF';
}

// ─── Agents ───────────────────────────────────────────────────────────────────

/**
 * Returns the lucide-react icon name for an agent role.
 * e.g. "duelist" → "Sword", "sentinel" → "Shield"
 */
export function getAgentRole(roleName: string): string {
  return AGENT_ROLE_ICONS[roleName.toLowerCase()] ?? 'Shield';
}

// ─── Riot ID ─────────────────────────────────────────────────────────────────

/** Formats name + tag into "PlayerName#TAG" */
export function formatRiotId(name: string, tag: string): string {
  return `${name}#${tag}`;
}

/** Parses "PlayerName#TAG" into { name, tag }. Returns null if malformed. */
export function parseRiotId(riotId: string): { name: string; tag: string } | null {
  const idx = riotId.lastIndexOf('#');
  if (idx === -1) return null;
  const name = riotId.slice(0, idx);
  const tag = riotId.slice(idx + 1);
  if (!name || !tag) return null;
  return { name, tag };
}

// ─── Numbers ─────────────────────────────────────────────────────────────────

/** Abbreviates large numbers: 1400 → "1.4K", 2500000 → "2.5M" */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/** Clamps a number between min and max (inclusive). */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
