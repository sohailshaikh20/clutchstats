/**
 * System and user prompt templates for the ClutchStats AI coaching pipeline.
 * Keep prompts here so they can be versioned independently of the pipeline logic.
 */

// ─── System Prompt ────────────────────────────────────────────────────────────

export const COACHING_SYSTEM_PROMPT = `You are an elite Valorant coach with deep knowledge of professional-level strategy, agent mechanics, and rank progression theory. You have coached players from Iron to Radiant and understand the specific skill gaps at every level.

Your role is to analyse quantitative match data and return specific, actionable improvement advice. Your analysis must be:

SPECIFIC: Reference exact numbers from the data. "Your headshot rate dropped from 24% to 11% over the last 5 games" is correct. "Improve your aim" is not acceptable.

PRIORITISED: Identify the changes with the highest impact on rank progression first. A player who dies to flanks every round needs positioning advice before crosshair placement advice.

PRACTICAL: Every recommendation must include a concrete drill, a specific setting to change, or a specific in-game behaviour to adopt or stop. "Watch your minimap more" is too vague. "Check your minimap at the start of every buy phase and after every kill to update your mental model of enemy positions" is correct.

HONEST: If a player's stats suggest they are playing at or above their rank, say so. If their stats reveal a single catastrophic habit dragging them down, prioritise fixing that over everything else.

STRUCTURED: You must always return valid JSON matching the exact schema requested. Do not wrap it in markdown code fences. Do not add fields not in the schema.`;

// ─── Analysis Request Template ────────────────────────────────────────────────

export interface CoachingPromptData {
  currentRank: string;
  gamesAnalysed: number;
  overallKD: string;
  overallWinRate: string;
  overallACS: string;
  overallHSPct: string;
  kdPerMap: Record<string, string>;
  winRatePerMap: Record<string, string>;
  kdPerAgent: Record<string, string>;
  winRatePerAgent: Record<string, string>;
  hsTrend: string[];          // last 10 games, e.g. ["24%","19%","22%","11%","9%",…]
  acsTrend: string[];         // last 10 games ACS
  roundTypePerformance: {
    pistol:    { winRate: string; kd: string };
    eco:       { winRate: string; kd: string };
    forceBuy:  { winRate: string; kd: string };
    fullBuy:   { winRate: string; kd: string };
  };
  firstBloodRate: string;     // "18%" = first blood in 18% of rounds played
  clutchRate: string;         // "12%" = won 12% of 1vX situations
  mostPlayedAgents: string[]; // top 3, e.g. ["Jett","Reyna","Omen"]
  topMaps: string[];          // top 3 by games played
  /** Up to 20 recent games, oldest → newest — for dashboard charts. */
  matchTrend: Array<{ kd: number; win: number; acs: number }>;
}

export function buildCoachingUserPrompt(data: CoachingPromptData): string {
  const mapKDLines = Object.entries(data.kdPerMap)
    .map(([map, kd]) => `  ${map}: K/D ${kd}, Win rate ${data.winRatePerMap[map] ?? 'N/A'}`)
    .join('\n');

  const agentLines = Object.entries(data.kdPerAgent)
    .map(([agent, kd]) => `  ${agent}: K/D ${kd}, Win rate ${data.winRatePerAgent[agent] ?? 'N/A'}`)
    .join('\n');

  return `Analyse the following Valorant player stats and return a JSON coaching report.

PLAYER SNAPSHOT
===============
Current rank: ${data.currentRank}
Games analysed: ${data.gamesAnalysed}
Overall K/D: ${data.overallKD}
Overall win rate: ${data.overallWinRate}
Average combat score: ${data.overallACS}
Headshot %: ${data.overallHSPct}
First blood rate: ${data.firstBloodRate}
Clutch rate (1vX wins): ${data.clutchRate}

PERFORMANCE BY MAP
==================
${mapKDLines}

PERFORMANCE BY AGENT
====================
${agentLines}

TRENDS (last 10 games, oldest → newest)
========================================
Headshot %: ${data.hsTrend.join(' → ')}
ACS:        ${data.acsTrend.join(' → ')}

ROUND ECONOMY PERFORMANCE
==========================
Pistol rounds:   Win rate ${data.roundTypePerformance.pistol.winRate},   K/D ${data.roundTypePerformance.pistol.kd}
Eco rounds:      Win rate ${data.roundTypePerformance.eco.winRate},      K/D ${data.roundTypePerformance.eco.kd}
Force-buy rounds: Win rate ${data.roundTypePerformance.forceBuy.winRate}, K/D ${data.roundTypePerformance.forceBuy.kd}
Full-buy rounds: Win rate ${data.roundTypePerformance.fullBuy.winRate},  K/D ${data.roundTypePerformance.fullBuy.kd}

AGENT POOL
==========
Most played: ${data.mostPlayedAgents.join(', ')}

Return ONLY valid JSON with this exact schema — no markdown fences, no extra fields:

{
  "strengths": [
    { "area": "string", "detail": "string citing exact numbers" }
  ],
  "weaknesses": [
    { "area": "string", "detail": "string citing exact numbers", "impact": "high|medium|low" }
  ],
  "recommendations": [
    {
      "title": "string (≤8 words)",
      "detail": "string — specific drill or behaviour change",
      "priority": 1,
      "expectedImpact": "string"
    }
  ],
  "weeklyGoals": [
    { "goal": "string — measurable target", "metric": "string — how to verify", "target": "string — e.g. '>22% HS rate'" }
  ],
  "mapAdvice": {
    "<MapName>": { "verdict": "play more|play less|avoid", "reason": "string" }
  },
  "agentAdvice": {
    "<AgentName>": { "verdict": "main|situational|drop", "reason": "string" }
  }
}

The weaknesses array must have exactly 3 entries ordered by impact (highest first).
The recommendations array must have exactly 5 entries ordered by priority (1 = highest).
The weeklyGoals array must have exactly 3 entries.`;
}

// ─── Response Schema (for Zod validation) ────────────────────────────────────

export const COACHING_RESPONSE_SCHEMA_DESCRIPTION = `
Expected JSON shape from Claude:
{
  strengths:       Array<{ area: string; detail: string }>
  weaknesses:      Array<{ area: string; detail: string; impact: 'high'|'medium'|'low' }> (3 items)
  recommendations: Array<{ title: string; detail: string; priority: number; expectedImpact: string }> (5 items)
  weeklyGoals:     Array<{ goal: string; metric: string; target: string }> (3 items)
  mapAdvice:       Record<string, { verdict: string; reason: string }>
  agentAdvice:     Record<string, { verdict: string; reason: string }>
}
`;
