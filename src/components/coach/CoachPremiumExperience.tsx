"use client";

import { analyzeCoachingAction } from "@/app/coach/actions";
import { CoachingResponseSchema, type CoachingResponse } from "@/lib/ai/coaching.types";
import type { CoachingPromptData } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/client";
import type { Agent, ValorantMap } from "@/types/valorant";
import { useCallback, useEffect, useState, useTransition } from "react";
import { CoachDashboard } from "./CoachDashboard";

type SessionSummary = { id: string; created_at: string; insights_summary: string | null };

type FullSession = SessionSummary & {
  analysis: unknown;
  stats_snapshot: unknown | null;
};

function parseFullSession(row: FullSession): {
  analysis: CoachingResponse;
  stats: CoachingPromptData | null;
} | null {
  const a = CoachingResponseSchema.safeParse(row.analysis);
  if (!a.success) return null;
  const stats = row.stats_snapshot
    ? (row.stats_snapshot as CoachingPromptData)
    : null;
  return { analysis: a.data, stats };
}

export function CoachPremiumExperience({
  maps,
  agents,
  initialSummaries,
  initialLatest,
  initialProfile,
}: {
  maps: ValorantMap[];
  agents: Agent[];
  initialSummaries: SessionSummary[];
  initialLatest: FullSession | null;
  initialProfile: {
    riot_name: string | null;
    riot_tag: string | null;
    riot_puuid: string | null;
    region: string | null;
    username: string | null;
  };
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [summaries, setSummaries] = useState(initialSummaries);
  const [active, setActive] = useState<FullSession | null>(initialLatest);
  const [parsed, setParsed] = useState<ReturnType<typeof parseFullSession>>(() =>
    initialLatest ? parseFullSession(initialLatest) : null
  );

  const [riotInput, setRiotInput] = useState("");
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkErr, setLinkErr] = useState<string | null>(null);

  const [analyseMsg, setAnalyseMsg] = useState(0);
  const [analyseErr, setAnalyseErr] = useState<string | null>(null);
  const [analysePending, startAnalyseTransition] = useTransition();

  const linked = Boolean(profile.riot_puuid && profile.riot_name && profile.riot_tag && profile.region);

  const refreshAll = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: prof } = await supabase
      .from("profiles")
      .select("riot_name, riot_tag, riot_puuid, region, username")
      .eq("id", user.id)
      .single();
    if (prof) setProfile(prof);
    const { data: sess } = await supabase
      .from("coaching_sessions")
      .select("id, created_at, insights_summary, analysis, stats_snapshot")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(15);
    const list = (sess ?? []) as FullSession[];
    setSummaries(list.map(({ id, created_at, insights_summary }) => ({ id, created_at, insights_summary })));
    const latest = list[0] ?? null;
    setActive(latest);
    setParsed(latest ? parseFullSession(latest) : null);
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setInterval> | undefined;
    if (analysePending) {
      t = setInterval(() => setAnalyseMsg((m) => (m + 1) % 3), 1600);
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [analysePending]);

  const loadSession = useCallback(
    async (id: string) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("coaching_sessions")
        .select("id, created_at, insights_summary, analysis, stats_snapshot")
        .eq("id", id)
        .single();
      if (error || !data) return;
      const row = data as FullSession;
      setActive(row);
      setParsed(parseFullSession(row));
    },
    []
  );

  const linkRiot = async () => {
    setLinkBusy(true);
    setLinkErr(null);
    try {
      const res = await fetch("/api/coaching/link-riot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riotId: riotInput.trim() }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        setLinkErr(j.error ?? "Link failed");
        return;
      }
      await refreshAll();
      setRiotInput("");
    } catch {
      setLinkErr("Network error");
    } finally {
      setLinkBusy(false);
    }
  };

  const runAnalyse = () => {
    setAnalyseErr(null);
    setAnalyseMsg(0);
    startAnalyseTransition(() => {
      void analyzeCoachingAction()
        .then(async (outcome) => {
          if (!outcome.success) {
            setAnalyseErr(outcome.error);
            return;
          }
          await refreshAll();
        })
        .catch(() => setAnalyseErr("Something went wrong"));
    });
  };

  const messages = ["Fetching match data…", "Analysing patterns…", "Generating insights…"];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent-gold">
          Premium
        </p>
        <h1 className="mt-2 font-heading text-4xl font-bold text-text-primary">AI coaching</h1>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Deep dive on your last twenty matches — strengths, map/agent focus, and goals you can track
          week over week.
        </p>
      </header>

      {!linked ? (
        <section className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
          <h2 className="font-heading text-lg font-bold text-text-primary">Connect your Riot account</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Enter your Riot ID so we can pull your competitive history for analysis. Format:{" "}
            <span className="font-mono text-text-primary">Name#TAG</span>
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Riot ID
              <input
                value={riotInput}
                onChange={(e) => setRiotInput(e.target.value)}
                placeholder="PlayerName#TAG"
                className="mt-1 w-full rounded-lg border border-white/10 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-accent-red focus:outline-none"
              />
            </label>
            <button
              type="button"
              disabled={linkBusy || !riotInput.includes("#")}
              onClick={() => void linkRiot()}
              className="rounded-full bg-accent-red px-6 py-2.5 font-heading text-sm font-bold uppercase tracking-wide text-white hover:bg-accent-red/90 disabled:opacity-40"
            >
              {linkBusy ? "Linking…" : "Link account"}
            </button>
          </div>
          {linkErr ? <p className="mt-3 text-sm text-loss">{linkErr}</p> : null}
          <p className="mt-6 text-xs text-text-secondary">
            Riot Sign-On (SSO) can be wired here later — for now linking via ID uses Henrik to resolve
            your PUUID and region.
          </p>
        </section>
      ) : (
        <section className="rounded-2xl border border-white/10 bg-surface-light/40 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-text-primary">Ready to analyse</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Linked as{" "}
                <span className="font-medium text-text-primary">
                  {profile.riot_name}#{profile.riot_tag}
                </span>{" "}
                ({profile.region?.toUpperCase()})
              </p>
            </div>
            <button
              type="button"
              disabled={analysePending}
              onClick={runAnalyse}
              className="rounded-full bg-accent-red px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-glow-red transition hover:bg-accent-red/90 disabled:opacity-50"
            >
              {analysePending ? messages[analyseMsg] : "Analyse my last 20 matches"}
            </button>
          </div>
          {analysePending ? (
            <p className="mt-4 text-center text-sm text-accent-blue">{messages[analyseMsg]}</p>
          ) : null}
          {analyseErr ? <p className="mt-3 text-sm text-loss">{analyseErr}</p> : null}
        </section>
      )}

      {linked && active && parsed ? (
        <div className="mt-12">
          <CoachDashboard
            sessionId={active.id}
            analysis={parsed.analysis}
            stats={parsed.stats}
            maps={maps}
            agents={agents}
            summaries={summaries}
            onOpenSession={(id) => void loadSession(id)}
          />
        </div>
      ) : linked && !active ? (
        <p className="mt-12 text-center text-sm text-text-secondary">
          Run your first analysis to unlock the full coaching dashboard.
        </p>
      ) : null}

      {linked && active && !parsed ? (
        <p className="mt-8 text-center text-sm text-loss">
          This coaching session could not be parsed. Try generating a new analysis.
        </p>
      ) : null}
    </div>
  );
}
