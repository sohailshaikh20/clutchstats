/**
 * LFG post content moderation.
 *
 * BLOCKED_PATTERNS: regex patterns checked against post title + description.
 * Any match returns an error before the post is saved.
 *
 * Keep this list minimal — it blocks the worst content, not overly aggressive.
 */

// Common slurs and offensive terms (abbreviated/obfuscated forms included)
const BLOCKED_TERMS: string[] = [
  // Racial slurs (common variations)
  "nigger", "nigga", "n1gger", "n1gga",
  "chink", "sp[i1]c", "k[i1]ke", "g00k", "gook",
  "beaner", "wetback", "towelhead", "raghead",
  "cracker", "honky",
  // Homophobic slurs
  "f[a4]gg[o0]t", "f[a4]g", "dyke", "tranny",
  // Sexual harassment
  "rape", "molest",
  // Spam triggers
  "buy.*account", "account.*sell", "elo.*boost", "boosting.*service",
  "discord.*nitro.*free", "free.*gift.*card",
  // Extreme content
  "kill yourself", "kys", "suicide",
];

const BLOCKED_PATTERNS: RegExp[] = BLOCKED_TERMS.map(
  (t) => new RegExp(`\\b${t}\\b`, "i")
);

/**
 * Returns the blocked term if the content matches any moderation pattern,
 * or null if the content is clean.
 */
export function checkModeration(text: string): string | null {
  const cleaned = text.toLowerCase().replace(/\s+/g, " ").trim();
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(cleaned)) {
      return "Your post contains inappropriate content.";
    }
  }
  return null;
}

/** Maximum active LFG posts per user at one time. */
export const MAX_ACTIVE_POSTS_PER_USER = 3;

/** Auto-expiry: posts older than this are hidden from feeds. */
export const POST_EXPIRY_HOURS = 24;

/** Number of reports needed to auto-remove a post. */
export const AUTO_REMOVE_REPORT_THRESHOLD = 3;
