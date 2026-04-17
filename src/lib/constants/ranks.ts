// ─── Types ────────────────────────────────────────────────────────────────────

export interface RankTierData {
  tier: number;
  name: string;
  division: string;
  color: string;
  bgColor: string;
}

// ─── Full Tier Table ──────────────────────────────────────────────────────────
// Tier numbers match Henrik API's currenttier field exactly.

export const RANK_TIERS: RankTierData[] = [
  { tier: 0,  name: 'Unrated',     division: '',          color: '#9CA3AF', bgColor: '#1F2937' },
  { tier: 1,  name: 'Iron 1',      division: 'Iron',      color: '#7B8B9A', bgColor: '#1A2332' },
  { tier: 2,  name: 'Iron 2',      division: 'Iron',      color: '#7B8B9A', bgColor: '#1A2332' },
  { tier: 3,  name: 'Iron 3',      division: 'Iron',      color: '#7B8B9A', bgColor: '#1A2332' },
  { tier: 4,  name: 'Bronze 1',    division: 'Bronze',    color: '#CD7F32', bgColor: '#2A1A0A' },
  { tier: 5,  name: 'Bronze 2',    division: 'Bronze',    color: '#CD7F32', bgColor: '#2A1A0A' },
  { tier: 6,  name: 'Bronze 3',    division: 'Bronze',    color: '#CD7F32', bgColor: '#2A1A0A' },
  { tier: 7,  name: 'Silver 1',    division: 'Silver',    color: '#C0C0C0', bgColor: '#1E1E2E' },
  { tier: 8,  name: 'Silver 2',    division: 'Silver',    color: '#C0C0C0', bgColor: '#1E1E2E' },
  { tier: 9,  name: 'Silver 3',    division: 'Silver',    color: '#C0C0C0', bgColor: '#1E1E2E' },
  { tier: 10, name: 'Gold 1',      division: 'Gold',      color: '#FFD700', bgColor: '#2A2000' },
  { tier: 11, name: 'Gold 2',      division: 'Gold',      color: '#FFD700', bgColor: '#2A2000' },
  { tier: 12, name: 'Gold 3',      division: 'Gold',      color: '#FFD700', bgColor: '#2A2000' },
  { tier: 13, name: 'Platinum 1',  division: 'Platinum',  color: '#00B4D8', bgColor: '#001A2C' },
  { tier: 14, name: 'Platinum 2',  division: 'Platinum',  color: '#00B4D8', bgColor: '#001A2C' },
  { tier: 15, name: 'Platinum 3',  division: 'Platinum',  color: '#00B4D8', bgColor: '#001A2C' },
  { tier: 16, name: 'Diamond 1',   division: 'Diamond',   color: '#B04DC4', bgColor: '#1A001F' },
  { tier: 17, name: 'Diamond 2',   division: 'Diamond',   color: '#B04DC4', bgColor: '#1A001F' },
  { tier: 18, name: 'Diamond 3',   division: 'Diamond',   color: '#B04DC4', bgColor: '#1A001F' },
  { tier: 19, name: 'Ascendant 1', division: 'Ascendant', color: '#00C875', bgColor: '#001A0E' },
  { tier: 20, name: 'Ascendant 2', division: 'Ascendant', color: '#00C875', bgColor: '#001A0E' },
  { tier: 21, name: 'Ascendant 3', division: 'Ascendant', color: '#00C875', bgColor: '#001A0E' },
  { tier: 22, name: 'Immortal 1',  division: 'Immortal',  color: '#FF4655', bgColor: '#2A0005' },
  { tier: 23, name: 'Immortal 2',  division: 'Immortal',  color: '#FF4655', bgColor: '#2A0005' },
  { tier: 24, name: 'Immortal 3',  division: 'Immortal',  color: '#FF4655', bgColor: '#2A0005' },
  { tier: 25, name: 'Radiant',     division: 'Radiant',   color: '#FFFBBD', bgColor: '#2A2600' },
];

// ─── Division Colour Maps ─────────────────────────────────────────────────────

/** Primary (icon/text) colour per division name, lowercase. */
export const RANK_COLORS: Record<string, string> = {
  unrated:   '#9CA3AF',
  iron:      '#7B8B9A',
  bronze:    '#CD7F32',
  silver:    '#C0C0C0',
  gold:      '#FFD700',
  platinum:  '#00B4D8',
  diamond:   '#B04DC4',
  ascendant: '#00C875',
  immortal:  '#FF4655',
  radiant:   '#FFFBBD',
};

/** Background card colour per division name, lowercase. */
export const RANK_BG_COLORS: Record<string, string> = {
  unrated:   '#1F2937',
  iron:      '#1A2332',
  bronze:    '#2A1A0A',
  silver:    '#1E1E2E',
  gold:      '#2A2000',
  platinum:  '#001A2C',
  diamond:   '#1A001F',
  ascendant: '#001A0E',
  immortal:  '#2A0005',
  radiant:   '#2A2600',
};

/** Ordered list from lowest to highest, for progress calculations. */
export const RANK_ORDER: string[] = [
  'unrated',
  'iron',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
  'ascendant',
  'immortal',
  'radiant',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the full tier data for a given numeric tier (0–25). */
export function getRankByTier(tier: number): RankTierData {
  return RANK_TIERS.find((r) => r.tier === tier) ?? RANK_TIERS[0];
}

/** Returns the division name ("Gold", "Immortal", …) for a numeric tier. */
export function getDivisionFromTier(tier: number): string {
  return getRankByTier(tier).division;
}

/** Returns true if the player has a ranked tier (not Unrated / tier 0). */
export function isRanked(tier: number): boolean {
  return tier >= 1;
}

/**
 * Returns a 0–100 progress value for the in-division progress bar.
 * ranking_in_tier from Henrik is already 0–100.
 */
export function getRankProgress(rankingInTier: number): number {
  return Math.min(Math.max(rankingInTier, 0), 100);
}
