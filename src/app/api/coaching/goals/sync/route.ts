import { CoachingResponseSchema } from "@/lib/ai/coaching.types";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  sessionId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { data: session, error: sErr } = await supabase
    .from("coaching_sessions")
    .select("id, user_id, analysis")
    .eq("id", body.sessionId)
    .eq("user_id", user.id)
    .single();

  if (sErr || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { count } = await supabase
    .from("coaching_weekly_goal_progress")
    .select("*", { count: "exact", head: true })
    .eq("session_id", body.sessionId);

  if (count && count > 0) {
    return NextResponse.json({ ok: true, inserted: 0 });
  }

  const parsed = CoachingResponseSchema.safeParse(session.analysis);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid session analysis" }, { status: 500 });
  }

  const rows = parsed.data.weeklyGoals.map((g, idx) => ({
    user_id: user.id,
    session_id: body.sessionId,
    goal_index: idx,
    goal_text: `${g.goal} — ${g.metric}: ${g.target}`,
    done: false,
  }));

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, inserted: 0 });
  }

  const { error: iErr } = await supabase.from("coaching_weekly_goal_progress").insert(rows);
  if (iErr) {
    return NextResponse.json({ error: iErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, inserted: rows.length });
}
