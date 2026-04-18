import { NextRequest, NextResponse } from 'next/server';
import { getHenrikClient } from '@/lib/api/henrik';
import { calculatePlayerStats, RANK_BENCHMARKS } from '@/lib/stats/calculator';
import { defaultMmrResponse } from '@/lib/player/default-mmr';
import type { HenrikMatch } from '@/types/valorant';

export const dynamic = 'force-dynamic';

type Insight = {
  id: string;
  title: string;
  body: string;
  lockedAdvice: string;
};

type DemoResponse = {
  playerName: string;
  playerTag: string;
  rank: string;
  rr: number;
  kd: number;
  winRate: number;
  headshotPercent: number;
  avgCombatScore: number;
  insights: Insight[];
  totalMatches: number;
};

function rankNorm(patched: string): string {
  return patched.toLowerCase().split(' ')[0] ?? '';
}

function variance(vals: number[]): number {
  if (vals.length < 2) return 0;
  const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
  return vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name = searchParams.get('name')?.trim();
  const tag = searchParams.get('tag')?.trim();

  if (!name || !tag) {
    return NextResponse.json({ error: 'name and tag query params are required' }, { status: 400 });
  }

  let client;
  try {
    client = getHenrikClient();
  } catch {
    return NextResponse.json({ error: 'API key not configured' }, { status: 503 });
  }

  try {
    // ── Fetch account + matches ────────────────────────────────────────────
    const accountRes = await client.getAccount(name, tag);
    const account = accountRes.data;
    const region = account.region.toLowerCase() as 'na' | 'eu' | 'ap' | 'kr' | 'latam' | 'br';

    const [mmrRes, matchRes] = await Promise.all([
      client.getMMR(region, name, tag).catch(() => null),
      client.getMatches(region, name, tag, { size: 20 }).catch(() => ({ data: [] as HenrikMatch[] })),
    ]);

    const mmr = mmrRes?.data ?? defaultMmrResponse();
    const matches = Array.isArray(matchRes.data) ? matchRes.data : [];

    if (matches.length < 5) {
      return NextResponse.json({ error: 'Not enough match data (need at least 5 matches)' }, { status: 400 });
    }

    const puuid = account.puuid;
    const rankPatched = mmr.current_data?.currenttierpatched ?? '';
    const rankKey = rankNorm(rankPatched);
    const bench = RANK_BENCHMARKS[rankKey];

    const stats = calculatePlayerStats(matches, puuid, rankPatched);
    const { free } = stats;

    // ── Insight 1: Worst Map ───────────────────────────────────────────────
    const mapsWith3Plus = free.mapStats.filter(m => m.gamesPlayed >= 3);
    const worstMap = mapsWith3Plus.sort((a, b) => a.winRate - b.winRate)[0];

    let insight1: Insight;
    if (worstMap) {
      insight1 = {
        id: 'worst-map',
        title: `Your worst map: ${worstMap.map}`,
        body: `Your ${worstMap.map} win rate is ${worstMap.winRate.toFixed(0)}% (${worstMap.wins}W–${worstMap.gamesPlayed - worstMap.wins}L). Your KD on ${worstMap.map} is ${worstMap.avgKD.toFixed(2)} vs ${free.kd.toFixed(2)} overall.`,
        lockedAdvice: `🔒 Unlock: Specific positioning, rotation timing, and agent picks that top ${rankPatched || 'your rank'} players use on ${worstMap.map} to flip this result.`,
      };
    } else {
      // Not enough map data — use lowest win-rate map even with <3 games
      const fallbackMap = free.mapStats.sort((a, b) => a.winRate - b.winRate)[0];
      insight1 = {
        id: 'worst-map',
        title: fallbackMap ? `Struggling on ${fallbackMap.map}` : 'Map performance',
        body: fallbackMap
          ? `Your ${fallbackMap.map} win rate is ${fallbackMap.winRate.toFixed(0)}% — below your overall ${free.winRate.toFixed(0)}% win rate. More data needed for a reliable sample.`
          : 'Play more matches to unlock map-specific insights.',
        lockedAdvice: `🔒 Unlock: Personalised map rotation strategy for your rank and playstyle.`,
      };
    }

    // ── Insight 2: Agent Mismatch ──────────────────────────────────────────
    const agentMismatch = free.topAgents
      .filter(a => a.gamesPlayed >= 3)
      .map(a => ({ ...a, kdGap: a.kd - free.kd }))
      .sort((a, b) => a.kdGap - b.kdGap)[0]; // worst relative to overall

    let insight2: Insight;
    if (agentMismatch && agentMismatch.kdGap < -0.15) {
      insight2 = {
        id: 'agent-mismatch',
        title: `${agentMismatch.agent} is dragging your stats`,
        body: `Your ${agentMismatch.agent} KD is ${agentMismatch.kd.toFixed(2)} (${agentMismatch.gamesPlayed} games) vs your overall KD of ${free.kd.toFixed(2)}. Win rate on this agent: ${agentMismatch.winRate.toFixed(0)}%.`,
        lockedAdvice: `🔒 Unlock: Should you drop ${agentMismatch.agent}? Agent recommendations based on your mechanical profile, team comp tendencies, and current ${rankPatched || 'rank'} meta.`,
      };
    } else {
      // Find best agent as a positive angle
      const bestAgent = free.topAgents.sort((a, b) => b.winRate - a.winRate)[0];
      insight2 = {
        id: 'agent-strength',
        title: bestAgent ? `${bestAgent.agent} is your best agent` : 'Agent pool',
        body: bestAgent
          ? `Your ${bestAgent.agent} win rate is ${bestAgent.winRate.toFixed(0)}% (${bestAgent.gamesPlayed} games, ${bestAgent.kd.toFixed(2)} KD). You perform ${(bestAgent.winRate - free.winRate).toFixed(0)}% better on this agent.`
          : 'Play more games on individual agents to unlock agent-specific coaching.',
        lockedAdvice: `🔒 Unlock: Why your performance spikes on ${bestAgent?.agent ?? 'certain agents'} and how to replicate it on your other picks.`,
      };
    }

    // ── Insight 3: Consistency Pattern ────────────────────────────────────
    const recentKDs = free.recentKDTrend.map(p => p.kd);
    const kdVariance = variance(recentKDs);
    const minKD = Math.min(...recentKDs);
    const maxKD = Math.max(...recentKDs);
    const rankAvgKD = bench?.kd ?? 1.0;

    let insight3: Insight;
    if (kdVariance > 0.25) {
      insight3 = {
        id: 'consistency',
        title: 'High variance in your performance',
        body: `Your KD swings from ${minKD.toFixed(2)} to ${maxKD.toFixed(2)} across recent matches. Inconsistency is your biggest rank barrier — your ceiling is clearly higher than your floor.`,
        lockedAdvice: `🔒 Unlock: The specific mental and mechanical routines that top ${rankPatched || 'ranked'} players use to reduce variance and hit their ceiling every game.`,
      };
    } else if (free.kd < rankAvgKD * 0.95) {
      insight3 = {
        id: 'consistent-low',
        title: `Consistent but below ${rankPatched || 'rank'} average`,
        body: `You're consistent (avg KD ${free.kd.toFixed(2)}, variance: low) but below ${rankPatched || 'rank'} average KD of ${rankAvgKD.toFixed(2)}. The floor is stable — the ceiling needs work.`,
        lockedAdvice: `🔒 Unlock: Focus areas for your exact rank: ${bench ? 'aim drills, crosshair placement, trade awareness' : 'positioning and gunfight selection'} — the quickest levers for consistent KD gains.`,
      };
    } else {
      insight3 = {
        id: 'consistent-high',
        title: `Stats suggest you're ready to climb`,
        body: `Your stats (${free.kd.toFixed(2)} KD, ${free.winRate.toFixed(0)}% WR) are above ${rankPatched || 'rank'} average (${rankAvgKD.toFixed(2)} KD, ${bench?.winRate ?? 50}% WR). You're statistically above your current rank.`,
        lockedAdvice: `🔒 Unlock: Mental game, team communication patterns, and macro play analysis — the final 10% that converts good stats into actual rank gains.`,
      };
    }

    const response: DemoResponse = {
      playerName: account.name,
      playerTag: account.tag,
      rank: rankPatched || 'Unranked',
      rr: mmr.current_data?.ranking_in_tier ?? 0,
      kd: free.kd,
      winRate: free.winRate,
      headshotPercent: free.headshotPercent,
      avgCombatScore: free.avgCombatScore,
      insights: [insight1, insight2, insight3],
      totalMatches: free.totalGames,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    const status = msg.includes('404') || msg.includes('Not found') ? 404 :
                   msg.includes('403') || msg.includes('401') ? 403 :
                   msg.includes('Rate limit') ? 429 : 502;
    console.error(`[coach/demo] Error for ${name}#${tag}:`, msg);
    return NextResponse.json({ error: msg }, { status });
  }
}
