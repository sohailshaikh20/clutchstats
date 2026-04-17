"use client";

import type { CoachingResponse } from "@/lib/ai/coaching.types";
import type { CoachingPromptData } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/client";
import type { Agent, ValorantMap } from "@/types/valorant";
import { motion } from "framer-motion";
import { Flame, Lightbulb, Trophy } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { CoachTrendChart } from "./CoachTrendChart";

type GoalRow = { id: string; goal_index: number; goal_text: string; done: boolean };

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function mapSplash(maps: ValorantMap[], henrikName: string): string | null {
  const key = norm(henrikName);
  const direct = maps.find((m) => norm(m.displayName) === key);
  if (direct?.splash) return direct.splash;
  return maps.find((m) => norm(m.displayName).includes(key))?.splash ?? null;
}

function agentPortrait(agents: Agent[], henrikName: string): Agent | null {
  const key = norm(henrikName);
  return (
    agents.find((a) => norm(a.displayName) === key) ??
    agents.find((a) => a.uuid.toLowerCase() === key) ??
    null
  );
}

export function CoachDashboard({
  sessionId,
  analysis,
  stats,
  maps,
  agents,
  summaries,
  onOpenSession,
}: {
  sessionId: string;
  analysis: CoachingResponse;
  stats: CoachingPromptData | null;
  maps: ValorantMap[];
  agents: Agent[];
  summaries: { id: string; created_at: string; insights_summary: string | null }[];
  onOpenSession: (id: string) => void;
}) {
  const [goals, setGoals] = useState<GoalRow[]>([]);

  const loadGoals = useCallback(async () => {
    const supabase = createClient();
    let { data } = await supabase
      .from("coaching_weekly_goal_progress")
      .select("id, goal_index, goal_text, done")
      .eq("session_id", sessionId)
      .order("goal_index", { ascending: true });
    if (!data?.length) {
      await fetch("/api/coaching/goals/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const r2 = await supabase
        .from("coaching_weekly_goal_progress")
        .select("id, goal_index, goal_text, done")
        .eq("session_id", sessionId)
        .order("goal_index", { ascending: true });
      data = r2.data;
    }
    setGoals((data ?? []) as GoalRow[]);
  }, [sessionId]);

  useEffect(() => {
    void loadGoals();
  }, [loadGoals]);

  const toggleGoal = async (goalIndex: number, done: boolean) => {
    const res = await fetch("/api/coaching/goal", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, goalIndex, done }),
    });
    if (res.ok) void loadGoals();
  };

  const strength = analysis.strengths[0];
  const weakness = analysis.weaknesses[0];
  const quick = analysis.recommendations[0];
  const mapEntries = Object.entries(analysis.mapAdvice);
  const agentEntries = Object.entries(analysis.agentAdvice);

  return (
    <div className="space-y-12">
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-t-4 border-t-emerald-500 border-white/10 bg-surface p-5 shadow-lg shadow-emerald-500/5"
        >
          <Trophy className="size-8 text-emerald-400" aria-hidden />
          <h3 className="mt-3 font-heading text-sm font-bold uppercase tracking-wide text-text-secondary">
            Biggest strength
          </h3>
          <p className="mt-1 font-heading text-lg font-semibold text-text-primary">{strength?.area}</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{strength?.detail}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="rounded-xl border border-t-4 border-t-accent-red border-white/10 bg-surface p-5 shadow-lg shadow-accent-red/10"
        >
          <Flame className="size-8 text-accent-red" aria-hidden />
          <h3 className="mt-3 font-heading text-sm font-bold uppercase tracking-wide text-text-secondary">
            Biggest weakness
          </h3>
          <p className="mt-1 font-heading text-lg font-semibold text-text-primary">{weakness?.area}</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{weakness?.detail}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-xl border border-t-4 border-t-accent-gold border-white/10 bg-surface p-5 shadow-lg shadow-accent-gold/10"
        >
          <Lightbulb className="size-8 text-accent-gold" aria-hidden />
          <h3 className="mt-3 font-heading text-sm font-bold uppercase tracking-wide text-text-secondary">
            Quick win
          </h3>
          <p className="mt-1 font-heading text-lg font-semibold text-text-primary">{quick?.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{quick?.detail}</p>
        </motion.div>
      </div>

      <section>
        <h2 className="font-heading text-xl font-bold text-text-primary">Map advice</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Win-rate context plus focused callouts from your latest analysis.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mapEntries.map(([mapName, adv]) => {
            const splash = mapSplash(maps, mapName);
            const wr = stats?.winRatePerMap?.[mapName] ?? "—";
            return (
              <div
                key={mapName}
                className="relative overflow-hidden rounded-xl border border-white/10 bg-surface-light"
              >
                {splash ? (
                  <div className="absolute inset-0">
                    <Image src={splash} alt="" fill className="object-cover opacity-25" sizes="400px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
                  </div>
                ) : null}
                <div className="relative p-5">
                  <h3 className="font-heading text-lg font-bold text-text-primary">{mapName}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-accent-gold">
                    Win rate {wr}
                  </p>
                  <p className="mt-3 text-sm font-medium text-text-primary">{adv.verdict}</p>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{adv.reason}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-bold text-text-primary">Agent advice</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agentEntries.map(([agentName, adv]) => {
            const ag = agentPortrait(agents, agentName);
            return (
              <div
                key={agentName}
                className="flex gap-4 rounded-xl border border-white/10 bg-surface p-4"
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-background">
                  {ag?.fullPortraitV2 ? (
                    <Image
                      src={ag.fullPortraitV2}
                      alt=""
                      fill
                      className="object-cover object-top"
                      sizes="80px"
                    />
                  ) : ag?.displayIcon ? (
                    <Image src={ag.displayIcon} alt="" width={80} height={80} className="object-contain" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-xs text-text-secondary">
                      ?
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-text-primary">{agentName}</h3>
                  <p className="mt-1 text-xs font-semibold text-accent-blue">{adv.verdict}</p>
                  <p className="mt-2 line-clamp-4 text-sm text-text-secondary">{adv.reason}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-heading text-xl font-bold text-text-primary">Weekly goals</h2>
        <ul className="mt-4 space-y-3">
          {(goals.length ? goals : analysis.weeklyGoals.map((g, i) => ({ id: `f-${i}`, goal_index: i, goal_text: `${g.goal} (${g.metric}: ${g.target})`, done: false }))).map((g) => (
            <li
              key={g.id}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-surface px-4 py-3"
            >
              <input
                type="checkbox"
                checked={g.done}
                onChange={(e) => void toggleGoal(g.goal_index, e.target.checked)}
                className="mt-1 size-4 accent-accent-red"
              />
              <span className={`text-sm ${g.done ? "text-text-secondary line-through" : "text-text-primary"}`}>
                {g.goal_text}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {stats?.matchTrend?.length ? (
        <section>
          <h2 className="font-heading text-xl font-bold text-text-primary">Performance trend</h2>
          <div className="mt-4">
            <CoachTrendChart matchTrend={stats.matchTrend} />
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="font-heading text-xl font-bold text-text-primary">Session history</h2>
        <ul className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10 bg-surface">
          {summaries.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onOpenSession(s.id)}
                className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition hover:bg-surface-light ${
                  s.id === sessionId ? "border-l-2 border-l-accent-red bg-surface-light/50" : ""
                }`}
              >
                <span className="text-xs text-text-secondary">
                  {new Date(s.created_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <span className="line-clamp-2 text-sm text-text-primary">
                  {s.insights_summary ?? "Coaching session"}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-center text-xs text-text-secondary">
          Manage billing from your account settings when available.
        </p>
      </section>
    </div>
  );
}
