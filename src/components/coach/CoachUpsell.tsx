"use client";

import { motion } from "framer-motion";
import { BarChart3, Brain, Crosshair, Sparkles, Target } from "lucide-react";

const PREVIEW_CARDS = [
  {
    title: "Map performance",
    body: "Your Bind win rate is 38% — here's why your post-plant defaults are leaking rounds on A site.",
    icon: Target,
  },
  {
    title: "Round economy",
    body: "You're dying too much in pistol rounds — your first-death rate on defence is 2× your ranked average.",
    icon: Crosshair,
  },
  {
    title: "Agent fit",
    body: "Switching from Jett to Raze on Fracture could boost your win rate by 12% based on your entry timing stats.",
    icon: Sparkles,
  },
];

export function CoachUpsell() {
  const startTrial = async () => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        credentials: "include",
      });
      const j = (await res.json()) as { url?: string; error?: string };
      if (j.url) window.location.href = j.url;
    } catch {
      /* noop */
    }
  };

  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent-red">
          Premium
        </p>
        <h1 className="mt-2 font-heading text-4xl font-bold text-text-primary md:text-5xl">
          AI coaching
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-text-secondary sm:text-base">
          Match-level analysis, weekly goals, and agent & map recommendations — built for players who
          want to rank up with data, not guesswork.
        </p>
      </header>

      <div className="relative min-h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-surface">
        <div className="pointer-events-none absolute inset-0 z-0 grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
          {PREVIEW_CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
              className="flex flex-col rounded-xl border border-white/10 bg-surface-light/80 p-4 shadow-inner"
            >
              <c.icon className="size-8 text-accent-gold" aria-hidden />
              <h3 className="mt-3 font-heading text-sm font-bold uppercase tracking-wide text-text-primary">
                {c.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{c.body}</p>
              <div className="mt-4 flex gap-2">
                <span className="h-2 flex-1 rounded-full bg-accent-red/30" />
                <span className="h-2 w-12 rounded-full bg-accent-blue/30" />
              </div>
            </motion.div>
          ))}
          <div className="hidden rounded-xl border border-white/10 bg-surface-light/60 p-4 sm:block">
            <BarChart3 className="size-8 text-accent-blue" aria-hidden />
            <p className="mt-3 font-heading text-xs font-bold uppercase text-text-secondary">
              Trend snapshot
            </p>
            <div className="mt-4 flex h-28 items-end gap-1">
              {[40, 55, 48, 62, 58, 70, 65, 72, 68, 80].map((h, j) => (
                <span
                  key={j}
                  className="flex-1 rounded-t bg-gradient-to-t from-accent-red/40 to-accent-red/80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 z-10 backdrop-blur-lg">
          <div className="absolute inset-0 bg-background/55" />
        </div>

        <div className="relative z-20 flex min-h-[520px] items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="w-full max-w-md rounded-2xl border border-white/20 bg-surface/75 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-accent-red/40 bg-accent-red/15">
              <Brain className="size-8 text-accent-red" aria-hidden />
            </div>
            <h2 className="mt-5 text-center font-heading text-2xl font-bold text-text-primary">
              Unlock AI coaching
            </h2>
            <ul className="mt-6 space-y-3 text-sm text-text-secondary">
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-red" />
                Personalised match analysis from your last 20 competitive games
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-red" />
                Weekly improvement goals you can track in-dashboard
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-red" />
                Agent & map recommendations with win-rate context
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="font-heading text-3xl font-bold text-accent-gold">EUR 6.99</span>
              <span className="text-lg text-text-secondary">/month</span>
              <span className="rounded-full border border-accent-gold/50 bg-accent-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-gold">
                7-day free trial
              </span>
            </div>
            <button
              type="button"
              onClick={() => void startTrial()}
              className="mt-8 w-full rounded-full bg-accent-red py-3.5 font-heading text-base font-bold uppercase tracking-wide text-white shadow-glow-red transition hover:bg-accent-red/90"
            >
              Start free trial
            </button>
            <p className="mt-4 text-center text-xs text-text-secondary">
              Secure checkout via Stripe. Cancel anytime during trial.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
