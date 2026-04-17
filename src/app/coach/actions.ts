"use server";

import { runCoachingAnalysisForCurrentUser } from "@/lib/ai/coaching.server";

export type AnalyzeCoachingActionState =
  | { success: true; sessionId: string }
  | { success: false; error: string; code?: string };

export async function analyzeCoachingAction(): Promise<AnalyzeCoachingActionState> {
  const result = await runCoachingAnalysisForCurrentUser();
  if (!result.ok) {
    return { success: false, error: result.error, code: result.code };
  }
  return { success: true, sessionId: result.sessionId };
}
