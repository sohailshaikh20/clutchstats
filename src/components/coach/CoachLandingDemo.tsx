"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Brain,
  Check,
  Crosshair,
  Loader2,
  Map as MapIcon,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useState } from "react";

type DemoInsight = {
  id: string;
  title: string;
  body: string;
  lockedAdvice: string;
};

type DemoResponse = {
  playerName: string;
  playerTag: string;
  rank: string;
  insights: DemoInsight[];
};

const FEATURES = [
  {
    title: "Map-by-map deep analysis",
    body: "Win conditions, site defaults, and where you leak rounds.",
    icon: MapIcon,
  },
  {
    title: "Agent recommendations",
    body: "Picks that fit your mechanics and current meta.",
    icon: Sparkles,
  },
  {
    title: "Economy patterns",
    body: "How you spend and when you force — round by round.",
    icon: BarChart3,
  },
  {
    title: "Weekly goals",
    body: "Trackable targets with measurable progress.",
    icon: Check,
  },
  {
    title: "Performance trends",
    body: "ACS, first bloods, and consistency over time.",
    icon: BarChart3,
  },
  {
    title: "Practice routines",
    body: "Aim and vod habits tailored to your gaps.",
    icon: Crosshair,
  },
] as const;

function parseSearch(raw: string): { name: string; tag: string } | null {
  const t = raw.trim();
  const hash = t.indexOf("#");
  if (hash <= 0) return null;
  return { name: t.slice(0, hash).trim(), tag: t.slice(hash + 1).trim() };
}

export function CoachLandingDemo() {
  const reduced = Boolean(useReducedMotion());
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<DemoResponse | null>(null);

  const runDemo = useCallback(async (name: string, tag: string) => {
    setLoading(true);
    setErr(null);
    setData(null);
    const msgs = ["Fetching match data…", "Analysing patterns…", "Generating insights…"];
    let step = 0;
    const iv = setInterval(() => {
      step = Math.min(msgs.length - 1, step + 1);
      setPhase(step);
    }, 900);
    try {
      const res = await fetch(
        `/api/coach/demo?name=${encodeURIComponent(name)}&tag=${encodeURIComponent(tag)}`
      );
      const j = (await res.json()) as DemoResponse & { error?: string };
      if (!res.ok) {
        setErr(j.error ?? "Could not run demo");
        return;
      }
      setData(j);
    } catch {
      setErr("Network error — try again.");
    } finally {
      clearInterval(iv);
      setLoading(false);
      setPhase(0);
    }
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const p = parseSearch(q);
    if (!p) {
      setErr("Use the format Name#TAG (e.g. CB10#Aegon)");
      return;
    }
    void runDemo(p.name, p.tag);
  }

  const startTrial = async () => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        credentials: "include",
      });
      const j = (await res.json()) as { url?: string };
      if (j.url) window.location.href = j.url;
    } catch {
      /* noop */
    }
  };

  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
          See what AI coaching looks like
        </h1>
        <p className="mx-auto mt-3 max-w-2xl font-body text-sm text-text-secondary sm:text-base">
          Enter any player name to get a free taste of our analysis — powered by your real ranked
          history when the account is public.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row sm:items-stretch"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Enter Name#TAG"
          className="h-12 flex-1 rounded-xl border-2 border-accent-red/60 bg-surface px-4 font-heading text-base text-text-primary outline-none transition placeholder:text-text-secondary/60 focus:border-accent-red focus:shadow-glow-red"
        />
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={reduced || loading ? undefined : { scale: 1.02 }}
          whileTap={reduced || loading ? undefined : { scale: 0.98 }}
          className="h-12 shrink-0 rounded-xl bg-accent-red px-6 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-glow-red transition hover:brightness-110 disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Analysing
            </span>
          ) : (
            "Run demo"
          )}
        </motion.button>
      </form>
      {err ? <p className="mt-3 text-center font-body text-sm text-loss">{err}</p> : null}

      {loading ? (
        <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border border-surface-light bg-surface p-6"
            />
          ))}
          <p className="col-span-full text-center font-body text-sm text-text-secondary">
            {["Fetching match data…", "Analysing patterns…", "Generating insights…"][phase]}
          </p>
        </div>
      ) : null}

      {data ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 space-y-10"
        >
          <p className="text-center font-body text-sm text-text-secondary">
            Demo for{" "}
            <span className="font-heading font-bold text-text-primary">
              {data.playerName}#{data.playerTag}
            </span>{" "}
            · <span className="text-accent-gold">{data.rank}</span>
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {data.insights.map((ins, i) => {
              const Icon = i === 0 ? MapIcon : i === 1 ? Sparkles : BarChart3;
              const label =
                i === 0 ? "Map weakness" : i === 1 ? "Agent mismatch" : "Consistency pattern";
              return (
                <motion.div
                  key={ins.id}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduced ? 0 : i * 0.08 }}
                  className="flex flex-col rounded-xl border border-white/10 bg-surface p-6 shadow-lg"
                >
                  <Icon className="size-8 text-accent-red" aria-hidden />
                  <p className="mt-3 font-body text-[10px] font-semibold uppercase tracking-widest text-accent-blue">
                    {label}
                  </p>
                  <h3 className="mt-1 font-heading text-lg font-bold text-text-primary">{ins.title}</h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-text-primary">{ins.body}</p>
                  <div className="relative mt-4 overflow-hidden rounded-lg border border-white/10 bg-background/40 p-4">
                    <p className="select-none font-body text-sm leading-relaxed text-transparent blur-sm">
                      {ins.lockedAdvice}
                    </p>
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/55 backdrop-blur-md">
                      <span className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wide text-text-secondary">
                        <span aria-hidden>🔒</span> Advice locked
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div>
            <p className="text-center font-heading text-sm font-bold text-text-primary">
              This is just a taste. Full coaching analyses 20 matches and covers:
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex gap-3 rounded-xl border border-surface-light bg-surface/80 p-4"
                >
                  <f.icon className="mt-0.5 size-5 shrink-0 text-accent-gold" aria-hidden />
                  <div>
                    <p className="font-heading text-sm font-bold text-text-primary">{f.title}</p>
                    <p className="mt-1 font-body text-xs text-text-secondary">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-accent-red/25 bg-gradient-to-br from-surface to-surface-light p-8">
            <h2 className="text-center font-heading text-2xl font-bold text-text-primary">
              Ready for the full analysis?
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-background/40 p-5">
                <p className="font-heading text-sm font-bold uppercase tracking-wide text-text-secondary">
                  Free demo
                </p>
                <ul className="mt-4 space-y-2 font-body text-sm text-text-secondary">
                  <li className="flex gap-2">
                    <Check className="size-4 shrink-0 text-win" />3 quick insights
                  </li>
                  <li className="flex gap-2">
                    <Check className="size-4 shrink-0 text-win" />
                    Basic findings
                  </li>
                  <li className="flex gap-2">
                    <X className="size-4 shrink-0 text-loss" />
                    No specific advice
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-accent-gold/30 bg-accent-gold/5 p-5">
                <p className="font-heading text-sm font-bold uppercase tracking-wide text-accent-gold">
                  Pro coaching
                </p>
                <ul className="mt-4 space-y-2 font-body text-sm text-text-primary">
                  <li className="flex gap-2">
                    <Check className="size-4 shrink-0 text-win" />
                    20-match deep analysis
                  </li>
                  <li className="flex gap-2">
                    <Check className="size-4 shrink-0 text-win" />
                    Actionable advice &amp; weekly goals
                  </li>
                  <li className="flex gap-2">
                    <Check className="size-4 shrink-0 text-win" />
                    Session history
                  </li>
                </ul>
                <p className="mt-4 font-heading text-3xl font-bold text-accent-gold">
                  EUR 6.99<span className="text-lg font-normal text-text-secondary">/mo</span>
                </p>
                <p className="font-body text-xs text-text-secondary">7-day free trial · Cancel anytime</p>
              </div>
            </div>
            <div className="mt-8 flex flex-col items-center gap-3">
              <motion.button
                type="button"
                onClick={() => void startTrial()}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full max-w-md rounded-xl bg-accent-red py-4 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-glow-red transition hover:brightness-110"
              >
                Start free trial
              </motion.button>
              <p className="font-body text-xs text-text-secondary">
                Secure checkout via Stripe. Cancel anytime.
              </p>
              <Link href="/pricing" className="font-body text-sm text-accent-blue hover:underline">
                View pricing →
              </Link>
            </div>
          </div>
        </motion.div>
      ) : null}

      {!data && !loading ? (
        <div className="mx-auto mt-16 max-w-2xl rounded-xl border border-white/10 bg-surface/60 p-6 text-center">
          <Brain className="mx-auto size-10 text-accent-red" />
          <p className="mt-3 font-body text-sm text-text-secondary">
            Tip: try a public ranked account with 5+ recent games for the richest demo output.
          </p>
        </div>
      ) : null}
    </div>
  );
}
