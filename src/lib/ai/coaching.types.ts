import { z } from "zod";
import type { CoachingPromptData } from "./prompts";

// ─── Response Schema (client-safe: zod only, no server APIs) ─────────────────

const StrengthSchema = z.object({
  area: z.string(),
  detail: z.string(),
});

const WeaknessSchema = z.object({
  area: z.string(),
  detail: z.string(),
  impact: z.enum(["high", "medium", "low"]),
});

const RecommendationSchema = z.object({
  title: z.string(),
  detail: z.string(),
  priority: z.number().int().min(1).max(5),
  expectedImpact: z.string(),
});

const WeeklyGoalSchema = z.object({
  goal: z.string(),
  metric: z.string(),
  target: z.string(),
});

const AdviceValueSchema = z.object({ verdict: z.string(), reason: z.string() });

const MapAdviceSchema = z.record(z.string(), AdviceValueSchema);
const AgentAdviceSchema = z.record(z.string(), AdviceValueSchema);

export const CoachingResponseSchema = z.object({
  strengths: z.array(StrengthSchema),
  weaknesses: z.array(WeaknessSchema).min(1).max(3),
  recommendations: z.array(RecommendationSchema).min(1).max(5),
  weeklyGoals: z.array(WeeklyGoalSchema).min(1).max(3),
  mapAdvice: MapAdviceSchema,
  agentAdvice: AgentAdviceSchema,
});

export type CoachingResponse = z.infer<typeof CoachingResponseSchema>;

export class CoachingError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INSUFFICIENT_DATA"
      | "CLAUDE_RATE_LIMIT"
      | "CLAUDE_API_ERROR"
      | "PARSE_ERROR"
      | "SAVE_ERROR",
    public readonly retryAfter?: number
  ) {
    super(message);
    this.name = "CoachingError";
  }
}

export interface CoachingInsightsResult {
  sessionId: string;
  analysis: CoachingResponse;
  processedStats: CoachingPromptData;
}
