import { runCoachingAnalysisForCurrentUser } from "@/lib/ai/coaching.server";
import { NextResponse } from "next/server";

function statusForCode(code: string): number {
  switch (code) {
    case "UNAUTHORIZED":
      return 401;
    case "PROFILE_NOT_FOUND":
      return 404;
    case "PREMIUM_REQUIRED":
      return 403;
    case "RIOT_NOT_LINKED":
      return 400;
    case "HENRIK_CONFIG":
      return 500;
    case "MATCH_FETCH_FAILED":
    case "MATCH_PAYLOAD":
      return 502;
    case "INSUFFICIENT_DATA":
      return 400;
    case "CLAUDE_RATE_LIMIT":
      return 429;
    case "CLAUDE_API_ERROR":
    case "PARSE_ERROR":
    case "SAVE_ERROR":
      return 502;
    default:
      return 500;
  }
}

export async function POST() {
  const result = await runCoachingAnalysisForCurrentUser();

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status: statusForCode(result.code) }
    );
  }

  return NextResponse.json({
    sessionId: result.sessionId,
    analysis: result.analysis,
    stats: result.stats,
  });
}
