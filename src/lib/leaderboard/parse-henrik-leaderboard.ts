export type LeaderboardRow = {
  leaderboardRank: number;
  name: string;
  tag: string;
  /** Valorant-API competitive tier id (Henrik v3 `tier`). */
  tier: number;
  rr: number;
  wins: number;
  topAgentUuid: string | null;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

function pickTopAgentUuid(entry: Record<string, unknown>): string | null {
  const ta = entry.top_agent ?? entry.topAgent ?? entry.agent;
  if (typeof ta === "string" && ta.length > 8) return ta.toLowerCase();
  const o = asRecord(ta);
  if (!o) return null;
  const id = o.uuid ?? o.id ?? o.agent_id ?? o.agentId ?? o.agentUUID;
  return typeof id === "string" ? id.toLowerCase() : null;
}

/**
 * Henrik v3: `/valorant/v3/leaderboard/:region/:platform?start_index=&size=`
 */
export function parseHenrikLeaderboardV3(json: unknown): {
  rows: LeaderboardRow[];
  total: number;
} | null {
  const root = asRecord(json);
  if (!root) return null;
  const data = asRecord(root.data);
  if (!data) return null;
  const players = data.players;
  if (!Array.isArray(players)) return null;

  const results = asRecord(root.results);
  const total =
    typeof results?.total === "number" ? results.total : players.length;

  const rows: LeaderboardRow[] = [];
  for (const p of players) {
    const e = asRecord(p);
    if (!e) continue;
    const rank = typeof e.leaderboard_rank === "number" ? e.leaderboard_rank : Number(e.leaderboard_rank);
    const name = typeof e.name === "string" ? e.name : "";
    const tag = typeof e.tag === "string" ? e.tag : "";
    const tier = typeof e.tier === "number" ? e.tier : Number(e.tier) || 0;
    const rr = typeof e.rr === "number" ? e.rr : Number(e.rr) || 0;
    const wins = typeof e.wins === "number" ? e.wins : Number(e.wins) || 0;
    if (!Number.isFinite(rank) || rank < 1) continue;
    rows.push({
      leaderboardRank: rank,
      name,
      tag,
      tier,
      rr,
      wins,
      topAgentUuid: pickTopAgentUuid(e),
    });
  }

  return { rows, total: Number.isFinite(total) ? total : rows.length };
}

/**
 * Henrik v1 (deprecated): `/valorant/v1/leaderboard/:region?page=&size=`
 *
 * Handles two shapes:
 *   1. Wrapped:  { data: { leaderboard: [...], total: N } }
 *   2. Flat:     { players: [...], total_players: N }   ← Henrik direct response
 */
export function parseHenrikLeaderboardV1(json: unknown): {
  rows: LeaderboardRow[];
  total: number;
} | null {
  const root = asRecord(json);
  if (!root) return null;

  // ── Resolve the player array ─────────────────────────────────────────────
  let board: unknown[] | null = null;
  let totalHint: number | null = null;

  // Shape 1: wrapped in .data.leaderboard
  const data = asRecord(root.data);
  if (data && Array.isArray(data.leaderboard)) {
    board = data.leaderboard;
    totalHint =
      typeof data.total === "number"
        ? data.total
        : typeof data.total_players === "number"
          ? data.total_players
          : null;
  }

  // Shape 2: flat root.players (Henrik direct leaderboard response)
  if (!board && Array.isArray(root.players)) {
    board = root.players;
    totalHint =
      typeof root.total_players === "number"
        ? root.total_players
        : typeof root.total === "number"
          ? root.total
          : null;
  }

  if (!board) return null;

  const rows: LeaderboardRow[] = [];
  for (const p of board) {
    const e = asRecord(p);
    if (!e) continue;
    const rank =
      typeof e.leaderboardRank === "number"
        ? e.leaderboardRank
        : typeof e.leaderboard_rank === "number"
          ? e.leaderboard_rank
          : Number(e.leaderboardRank ?? e.leaderboard_rank);
    const name =
      (typeof e.gameName === "string" && e.gameName) ||
      (typeof e.name === "string" && e.name) ||
      "";
    const tag =
      (typeof e.tagLine === "string" && e.tagLine) ||
      (typeof e.tag === "string" && e.tag) ||
      "";
    const tier =
      typeof e.competitiveTier === "number"
        ? e.competitiveTier
        : typeof e.competitive_tier === "number"
          ? e.competitive_tier
          : Number(e.competitiveTier ?? e.competitive_tier) || 0;
    const rr =
      typeof e.rankedRating === "number"
        ? e.rankedRating
        : typeof e.ranked_rating === "number"
          ? e.ranked_rating
          : Number(e.rankedRating ?? e.ranked_rating) || 0;
    const wins =
      typeof e.numberOfWins === "number"
        ? e.numberOfWins
        : typeof e.number_of_wins === "number"
          ? e.number_of_wins
          : Number(e.numberOfWins ?? e.number_of_wins) || 0;
    if (!Number.isFinite(rank) || rank < 1) continue;
    rows.push({
      leaderboardRank: rank,
      name,
      tag,
      tier,
      rr,
      wins,
      topAgentUuid: pickTopAgentUuid(e),
    });
  }

  const total = totalHint ?? rows.length;

  return { rows, total: Number.isFinite(total) ? total : rows.length };
}
