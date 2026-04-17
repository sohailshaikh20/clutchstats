import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { getHenrikClient } from "@/lib/api/henrik";
import { profileIsPremium } from "@/lib/coach/premium";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import type { HenrikMatch, MatchPlayer, ValorantRegion } from "@/types/valorant";
import {
  CoachingError,
  CoachingResponseSchema,
  type CoachingInsightsResult,
  type CoachingResponse,
} from "./coaching.types";
import {
  COACHING_SYSTEM_PROMPT,
  buildCoachingUserPrompt,
  type CoachingPromptData,
} from "./prompts";

// ─── Step 1: Pre-process Matches → Structured Stats ──────────────────────────

interface RoundTypeStat { wins: number; total: number; kills: number; deaths: number }

function getPlayer(match: HenrikMatch, puuid: string): MatchPlayer | undefined {
  return match.players.all_players.find((p) => p.puuid === puuid);
}

function safeDiv(a: number, b: number, decimals = 2): string {
  if (b === 0) return '0.00';
  return (a / b).toFixed(decimals);
}

function pct(numerator: number, denominator: number): string {
  if (denominator === 0) return '0.0%';
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function classifyRound(roundIndex: number, match: HenrikMatch): 'pistol' | 'eco' | 'force' | 'full' | null {
  const round = match.rounds[roundIndex];
  if (!round) return null;
  // Pistol rounds are always rounds 0 and 12 (half-time resets)
  if (roundIndex === 0 || roundIndex === 12) return 'pistol';

  // Use average loadout value to classify
  const allLoadouts = round.player_stats.flatMap((ps) => [ps.economy.loadout_value]);
  if (allLoadouts.length === 0) return 'full';
  const avgLoadout = allLoadouts.reduce((a, b) => a + b, 0) / allLoadouts.length;

  if (avgLoadout < 2000) return 'eco';
  if (avgLoadout < 3500) return 'force';
  return 'full';
}

function preprocessMatches(
  matches: HenrikMatch[],
  playerPuuid: string
): CoachingPromptData {
  if (matches.length === 0) {
    throw new CoachingError(
      'No matches provided for analysis',
      'INSUFFICIENT_DATA'
    );
  }

  // Per-match aggregates
  const kdPerMap: Record<string, { k: number; d: number; wins: number; games: number }> = {};
  const kdPerAgent: Record<string, { k: number; d: number; wins: number; games: number }> = {};
  const hsTrend: string[] = [];
  const acsTrend: string[] = [];
  const roundType: Record<'pistol' | 'eco' | 'force' | 'full', RoundTypeStat> = {
    pistol: { wins: 0, total: 0, kills: 0, deaths: 0 },
    eco:    { wins: 0, total: 0, kills: 0, deaths: 0 },
    force:  { wins: 0, total: 0, kills: 0, deaths: 0 },
    full:   { wins: 0, total: 0, kills: 0, deaths: 0 },
  };

  let totalKills = 0, totalDeaths = 0;
  let totalWins = 0;
  let totalScore = 0, totalRounds = 0;
  let totalHS = 0, totalShots = 0;
  let totalFirstBloods = 0, totalClutchWins = 0, totalClutchAttempts = 0;

  for (const match of matches) {
    const player = getPlayer(match, playerPuuid);
    if (!player) continue;

    const roundsPlayed = match.metadata.rounds_played;
    const playerTeam = player.team.toLowerCase() as 'red' | 'blue';
    const teamResult = match.teams[playerTeam];
    const won = teamResult?.has_won ?? false;

    // Global accumulation
    totalKills   += player.stats.kills;
    totalDeaths  += player.stats.deaths;
    totalScore   += player.stats.score;
    totalRounds  += roundsPlayed;
    totalHS      += player.stats.headshots;
    totalShots   += player.stats.headshots + player.stats.bodyshots + player.stats.legshots;
    if (won) totalWins++;

    // Per-match trends (oldest → newest; matches come newest first from Henrik)
    const matchHS = pct(player.stats.headshots,
      player.stats.headshots + player.stats.bodyshots + player.stats.legshots);
    const matchACS = roundsPlayed > 0
      ? String(Math.round(player.stats.score / roundsPlayed))
      : '0';
    hsTrend.unshift(matchHS);
    acsTrend.unshift(matchACS);

    // Per-map
    const map = match.metadata.map;
    if (!kdPerMap[map]) kdPerMap[map] = { k: 0, d: 0, wins: 0, games: 0 };
    kdPerMap[map].k     += player.stats.kills;
    kdPerMap[map].d     += player.stats.deaths;
    kdPerMap[map].games += 1;
    if (won) kdPerMap[map].wins += 1;

    // Per-agent
    const agent = player.character;
    if (!kdPerAgent[agent]) kdPerAgent[agent] = { k: 0, d: 0, wins: 0, games: 0 };
    kdPerAgent[agent].k     += player.stats.kills;
    kdPerAgent[agent].d     += player.stats.deaths;
    kdPerAgent[agent].games += 1;
    if (won) kdPerAgent[agent].wins += 1;

    // Round-type performance
    match.rounds.forEach((round, idx) => {
      const type = classifyRound(idx, match);
      if (!type) return;
      const key = type === 'force' ? 'force' : type;
      const ps = round.player_stats.find((s) => s.player_puuid === playerPuuid);
      if (!ps) return;
      const playerWonRound =
        round.winning_team.toLowerCase() === playerTeam;
      const mapped = key as keyof typeof roundType;
      roundType[mapped].total  += 1;
      roundType[mapped].kills  += ps.kills;
      roundType[mapped].deaths += ps.was_afk ? 0 : 1;
      if (playerWonRound) roundType[mapped].wins += 1;
    });

    // First blood: check if player got the first kill of any round
    match.rounds.forEach((round) => {
      if (!round.player_stats.length) return;
      const firstKillEvent = round.player_stats
        .flatMap((ps) => ps.kill_events)
        .sort((a, b) => a.kill_time_in_round - b.kill_time_in_round)[0];
      if (firstKillEvent?.killer_puuid === playerPuuid) {
        totalFirstBloods++;
      }
    });

    // Clutch: scan kills for rounds where player was last alive on their team
    // Approximated by checking kill events in rounds where team had ≤1 alive
    for (const kill of match.kills) {
      if (
        (kill as typeof kill & { round?: number }).round !== undefined &&
        kill.killer_puuid === playerPuuid
      ) {
        const r = (kill as typeof kill & { round: number }).round;
        const roundKills = match.kills.filter(
          (k) => (k as typeof k & { round?: number }).round === r
        );
        const teamAlive = match.players.all_players.filter(
          (p) =>
            p.team.toLowerCase() === playerTeam &&
            !roundKills.some((k) => k.victim_puuid === p.puuid)
        ).length;
        if (teamAlive === 1) {
          totalClutchAttempts++;
          if (won) totalClutchWins++;
        }
      }
    }
  }

  const totalMatches = matches.filter((m) => getPlayer(m, playerPuuid)).length;

  if (totalMatches < 3) {
    throw new CoachingError(
      `Only ${totalMatches} matches found for this player. Need at least 3 for a meaningful analysis.`,
      'INSUFFICIENT_DATA'
    );
  }

  // Format per-map stats
  const kdPerMapFormatted: Record<string, string> = {};
  const winRatePerMapFormatted: Record<string, string> = {};
  for (const [map, stats] of Object.entries(kdPerMap)) {
    kdPerMapFormatted[map] = safeDiv(stats.k, stats.d);
    winRatePerMapFormatted[map] = pct(stats.wins, stats.games);
  }

  // Format per-agent stats
  const kdPerAgentFormatted: Record<string, string> = {};
  const winRatePerAgentFormatted: Record<string, string> = {};
  for (const [agent, stats] of Object.entries(kdPerAgent)) {
    kdPerAgentFormatted[agent] = safeDiv(stats.k, stats.d);
    winRatePerAgentFormatted[agent] = pct(stats.wins, stats.games);
  }

  // Top agents and maps by games played
  const topAgents = Object.entries(kdPerAgent)
    .sort((a, b) => b[1].games - a[1].games)
    .slice(0, 3)
    .map(([agent]) => agent);

  const topMaps = Object.entries(kdPerMap)
    .sort((a, b) => b[1].games - a[1].games)
    .slice(0, 3)
    .map(([map]) => map);

  // Infer current rank from most recent match
  const latestPlayer = matches
    .map((m) => getPlayer(m, playerPuuid))
    .find(Boolean);
  const currentRank = latestPlayer?.currenttier_patched ?? 'Unknown';

  const trendMatches = matches.filter((m) => getPlayer(m, playerPuuid)).slice(0, 20);
  const matchTrend: Array<{ kd: number; win: number; acs: number }> = [];
  for (const match of trendMatches) {
    const player = getPlayer(match, playerPuuid);
    if (!player) continue;
    const roundsPlayed = match.metadata.rounds_played || 1;
    const kd =
      player.stats.deaths > 0 ? player.stats.kills / player.stats.deaths : player.stats.kills;
    const acs = roundsPlayed > 0 ? player.stats.score / roundsPlayed : 0;
    const playerTeam = player.team.toLowerCase() as 'red' | 'blue';
    const teamResult = match.teams[playerTeam];
    const won = teamResult?.has_won ?? false;
    matchTrend.unshift({ kd, win: won ? 1 : 0, acs });
  }

  return {
    currentRank,
    gamesAnalysed: totalMatches,
    overallKD:      safeDiv(totalKills, totalDeaths),
    overallWinRate: pct(totalWins, totalMatches),
    overallACS:     totalRounds > 0 ? String(Math.round(totalScore / totalRounds)) : '0',
    overallHSPct:   pct(totalHS, totalShots),
    kdPerMap:       kdPerMapFormatted,
    winRatePerMap:  winRatePerMapFormatted,
    kdPerAgent:     kdPerAgentFormatted,
    winRatePerAgent: winRatePerAgentFormatted,
    hsTrend:  hsTrend.slice(-10),
    acsTrend: acsTrend.slice(-10),
    roundTypePerformance: {
      pistol:   { winRate: pct(roundType.pistol.wins,  roundType.pistol.total),  kd: safeDiv(roundType.pistol.kills,  roundType.pistol.deaths) },
      eco:      { winRate: pct(roundType.eco.wins,     roundType.eco.total),     kd: safeDiv(roundType.eco.kills,     roundType.eco.deaths) },
      forceBuy: { winRate: pct(roundType.force.wins,   roundType.force.total),   kd: safeDiv(roundType.force.kills,   roundType.force.deaths) },
      fullBuy:  { winRate: pct(roundType.full.wins,    roundType.full.total),    kd: safeDiv(roundType.full.kills,    roundType.full.deaths) },
    },
    firstBloodRate: pct(totalFirstBloods, totalRounds),
    clutchRate:     pct(totalClutchWins, Math.max(totalClutchAttempts, 1)),
    mostPlayedAgents: topAgents,
    topMaps,
    matchTrend,
  };
}

// ─── Step 2 + 3: Call Claude, parse structured response ───────────────────────

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function callClaude(promptData: CoachingPromptData): Promise<CoachingResponse> {
  let rawText: string;

  try {
    const message = await anthropic.messages.create({
      model:      'claude-sonnet-4-5',
      max_tokens: 2048,
      system:     COACHING_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: buildCoachingUserPrompt(promptData) },
      ],
    });

    const block = message.content[0];
    if (!block || block.type !== 'text') {
      throw new CoachingError('Unexpected Claude response format', 'CLAUDE_API_ERROR');
    }
    rawText = block.text;
  } catch (err) {
    if (err instanceof CoachingError) throw err;

    // Anthropic SDK wraps rate-limit errors
    if (err instanceof Anthropic.RateLimitError) {
      throw new CoachingError(
        'Claude API rate limit reached — please try again in a moment',
        'CLAUDE_RATE_LIMIT',
        60
      );
    }
    if (err instanceof Anthropic.APIError) {
      throw new CoachingError(
        `Claude API error: ${err.message}`,
        'CLAUDE_API_ERROR'
      );
    }
    throw new CoachingError(
      `Unexpected error calling Claude: ${String(err)}`,
      'CLAUDE_API_ERROR'
    );
  }

  // Strip any accidental markdown fences the model may have added
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Try to extract a JSON object if the model included surrounding prose
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new CoachingError(
        'Claude returned a response that could not be parsed as JSON',
        'PARSE_ERROR'
      );
    }
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      throw new CoachingError(
        'Claude returned malformed JSON',
        'PARSE_ERROR'
      );
    }
  }

  const validated = CoachingResponseSchema.safeParse(parsed);
  if (!validated.success) {
    console.error('[Coaching] Schema validation failed:', validated.error.flatten());
    throw new CoachingError(
      'Claude response did not match the expected coaching schema',
      'PARSE_ERROR'
    );
  }

  return validated.data;
}

// ─── Step 4: Persist to Supabase ─────────────────────────────────────────────

async function saveSession(
  userId: string,
  analysis: CoachingResponse,
  promptData: CoachingPromptData
): Promise<string> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('coaching_sessions')
    .insert({
      user_id:          userId,
      analysis:         analysis as unknown as Json,
      matches_analysed: promptData.gamesAnalysed,
      insights_summary: analysis.weaknesses
        .map((w) => `${w.area}: ${w.detail}`)
        .join(' | '),
      stats_snapshot:   promptData as unknown as Json,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[Coaching] Failed to save session:', error);
    throw new CoachingError(
      `Failed to save coaching session: ${error.message}`,
      'SAVE_ERROR'
    );
  }

  const sessionId = data.id as string;

  const goalRows = analysis.weeklyGoals.map((g, idx) => ({
    user_id:     userId,
    session_id:  sessionId,
    goal_index:  idx,
    goal_text:   `${g.goal} — ${g.metric}: ${g.target}`,
    done:        false,
  }));
  if (goalRows.length > 0) {
    const { error: gErr } = await supabase.from('coaching_weekly_goal_progress').insert(goalRows);
    if (gErr) {
      console.error('[Coaching] Failed to save weekly goal rows:', gErr);
    }
  }

  return sessionId;
}

// ─── Public Entry Point ───────────────────────────────────────────────────────

/**
 * Full coaching pipeline:
 * 1. Pre-process raw Henrik matches into structured stats
 * 2. Send stats to Claude Sonnet for analysis
 * 3. Parse and validate the structured JSON response
 * 4. Persist the session to Supabase
 *
 * @param matches     Array of HenrikMatch objects (most recent first)
 * @param playerPuuid The PUUID of the player being analysed
 * @param userId      The Supabase user ID — used to save the session
 */
export async function generateCoachingInsights(
  matches: HenrikMatch[],
  playerPuuid: string,
  userId: string
): Promise<CoachingInsightsResult> {
  // Step 1 — pre-process
  const processedStats = preprocessMatches(matches, playerPuuid);

  // Step 2 + 3 — call Claude, parse
  const analysis = await callClaude(processedStats);

  // Step 4 — persist
  const sessionId = await saveSession(userId, analysis, processedStats);

  return { sessionId, analysis, processedStats };
}

function asRegionCoaching(r: string): ValorantRegion {
  const x = r.toLowerCase();
  if (x === "latam" || x === "las") return "latam";
  if (x === "br" || x === "brazil") return "br";
  if (x === "na" || x === "eu" || x === "ap" || x === "kr") return x;
  return "na";
}

export type RunCoachingAnalysisResult =
  | {
      ok: true;
      sessionId: string;
      analysis: CoachingResponse;
      stats: CoachingPromptData;
    }
  | { ok: false; error: string; code: string };

/**
 * Authenticated user: profile, Henrik matches, then full coaching pipeline.
 * Used by Server Actions and the `/api/coaching/analyse` route.
 */
export async function runCoachingAnalysisForCurrentUser(): Promise<RunCoachingAnalysisResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Unauthorised", code: "UNAUTHORIZED" };
  }

  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("is_premium, premium_until, riot_name, riot_tag, riot_puuid, region")
    .eq("id", user.id)
    .single();

  if (pErr || !profile) {
    return { ok: false, error: "Profile not found", code: "PROFILE_NOT_FOUND" };
  }

  if (!profileIsPremium(profile)) {
    return { ok: false, error: "Premium required", code: "PREMIUM_REQUIRED" };
  }

  if (!profile.riot_name || !profile.riot_tag || !profile.riot_puuid || !profile.region) {
    return { ok: false, error: "Link your Riot account first", code: "RIOT_NOT_LINKED" };
  }

  let henrik;
  try {
    henrik = getHenrikClient();
  } catch {
    return { ok: false, error: "Henrik API not configured", code: "HENRIK_CONFIG" };
  }

  const region = asRegionCoaching(profile.region);
  const res = await henrik.getMatches(region, profile.riot_name, profile.riot_tag, {
    size: 20,
  });

  if (res.status !== 200 || !res.data) {
    return {
      ok: false,
      error: typeof res.data === "string" ? res.data : "Failed to fetch matches",
      code: "MATCH_FETCH_FAILED",
    };
  }

  if (!Array.isArray(res.data)) {
    return { ok: false, error: "Unexpected match payload", code: "MATCH_PAYLOAD" };
  }

  const matches = res.data as HenrikMatch[];

  try {
    const result = await generateCoachingInsights(matches, profile.riot_puuid, user.id);
    return {
      ok: true,
      sessionId: result.sessionId,
      analysis: result.analysis,
      stats: result.processedStats,
    };
  } catch (err) {
    if (err instanceof CoachingError) {
      return { ok: false, error: err.message, code: err.code };
    }
    console.error("[coaching] runCoachingAnalysisForCurrentUser", err);
    return { ok: false, error: "Analysis failed", code: "UNKNOWN" };
  }
}
