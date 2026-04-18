"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Bell, CalendarOff } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  fetchVlrProxy,
  unwrapSegments,
} from "@/lib/esports/vlr-client-fetch";
import { FetchErrorPanel } from "@/components/ui/FetchErrorPanel";
import type { VLRMatch } from "@/types/esports";
import { MatchCountdown } from "./MatchCountdown";
import { TeamLogo } from "./TeamLogo";

function formatLocal(unix: number | null): string {
  if (unix == null) return "TBD";
  const ms = unix > 1e11 ? unix : unix * 1000;
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(ms));
}

function internalMatchUrl(m: VLRMatch): string {
  if (m.id) return `/esports/match/${m.id}`;
  return "/esports";
}

export function LiveUpcomingPanel() {
  const reduced = Boolean(useReducedMotion());
  const [live, setLive] = useState<VLRMatch[]>([]);
  const [upcoming, setUpcoming] = useState<VLRMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(false);
    try {
      const [rawLive, rawUp] = await Promise.all([
        fetchVlrProxy<unknown>("/match?q=live_score"),
        fetchVlrProxy<unknown>("/match?q=upcoming"),
      ]);
      setLive(unwrapSegments<VLRMatch>(rawLive));
      setUpcoming(unwrapSegments<VLRMatch>(rawUp));
    } catch {
      setErr(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-xl border border-surface-light bg-surface" />
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-xl border border-surface-light bg-surface"
            />
          ))}
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <FetchErrorPanel
        title="Matches unavailable"
        message="We couldn’t reach the match feed. This is usually temporary — try again in a moment."
        onRetry={load}
      />
    );
  }

  const liveIds = new Set(live.map((m) => m.id));
  const upcomingOnly = upcoming.filter((m) => !liveIds.has(m.id));
  const featured = live[0];
  const completelyEmpty = live.length === 0 && upcomingOnly.length === 0;

  if (completelyEmpty) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-surface/80 px-6 py-14 text-center">
        <CalendarOff className="mx-auto size-10 text-text-secondary" aria-hidden />
        <p className="mt-4 font-heading text-sm font-bold uppercase tracking-wide text-text-primary">
          No matches scheduled
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          There’s nothing live or on the calendar right now. Check back after announcements — new
          fixtures appear here automatically.
        </p>
        <Link
          href="/esports"
          className="mt-6 inline-flex font-semibold text-accent-blue underline-offset-4 hover:underline"
        >
          Back to Esports Hub →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {featured ? (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl border border-accent-red/30 border-l-[3px] border-l-accent-red bg-surface p-6 shadow-glow-red/20"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-red/10 to-transparent" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <motion.span
                className="inline-flex items-center gap-2 rounded-full bg-accent-red/20 px-3 py-1 font-heading text-xs font-bold uppercase tracking-widest text-accent-red"
                animate={reduced ? { opacity: 1 } : { opacity: [1, 0.55, 1] }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
                }
              >
                <span className="size-2 rounded-full bg-accent-red" aria-hidden />
                Live
              </motion.span>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <TeamLogo name={featured.team1.name} logoUrl={featured.team1.logo} size={36} />
                  <span className="min-w-0 font-heading text-2xl font-bold text-text-primary">
                    {featured.team1.name}
                  </span>
                </div>
                <span className="font-heading text-xl text-text-secondary">vs</span>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="min-w-0 font-heading text-2xl font-bold text-text-primary">
                    {featured.team2.name}
                  </span>
                  <TeamLogo name={featured.team2.name} logoUrl={featured.team2.logo} size={36} />
                </div>
              </div>
              <p className="mt-2 text-xs text-text-secondary">
                {featured.event?.name ?? featured.series?.name}
              </p>
            </div>
            {(featured.team1.score != null && featured.team2.score != null) ||
            featured.status === "live" ? (
              <div className="font-heading text-4xl font-bold tabular-nums text-text-primary">
                <span className="text-win">{featured.team1.score ?? "–"}</span>
                <span className="mx-2 text-text-secondary">:</span>
                <span className="text-accent-blue">{featured.team2.score ?? "–"}</span>
              </div>
            ) : null}
          </div>
          <Link
            href={internalMatchUrl(featured)}
            className="relative mt-4 inline-block text-xs font-semibold text-accent-blue hover:underline"
          >
            Match details →
          </Link>
        </motion.div>
      ) : null}

      <div>
        <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Upcoming
        </h3>
        {upcomingOnly.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-surface px-5 py-10 text-center">
            <p className="font-heading text-sm font-semibold text-text-primary">
              {live.length > 0 ? "No other upcoming matches" : "Calendar is quiet"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
              {live.length > 0
                ? "Everything else on the feed is either live or not listed yet."
                : "When organisers publish fixtures, they’ll show up here automatically."}
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {upcomingOnly.map((m, i) => (
              <motion.div
                key={m.id}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduced ? { duration: 0 } : { delay: i * 0.04 }}
              >
                <div className="flex rounded-xl border border-surface-light bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-red/30 hover:shadow-lg">
                  <Link
                    href={internalMatchUrl(m)}
                    className="min-w-0 flex-1 space-y-3"
                  >
                    <span className="inline-block max-w-full truncate rounded-full border border-white/10 bg-background/60 px-2 py-0.5 text-[10px] font-heading font-semibold uppercase tracking-wide text-text-secondary">
                      {m.event?.name ?? m.series?.name ?? "Tournament"}
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <TeamLogo name={m.team1.name} logoUrl={m.team1.logo} size={36} />
                        <span className="truncate font-heading text-sm font-bold text-text-primary">
                          {m.team1.name}
                        </span>
                      </div>
                      <span className="text-text-secondary">vs</span>
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate font-heading text-sm font-bold text-text-primary">
                          {m.team2.name}
                        </span>
                        <TeamLogo name={m.team2.name} logoUrl={m.team2.logo} size={36} />
                      </div>
                    </div>
                    <p className="font-body text-xs text-text-secondary">{formatLocal(m.unix_timestamp)}</p>
                    {m.unix_timestamp ? <MatchCountdown unixSeconds={m.unix_timestamp} /> : null}
                  </Link>
                  <button
                    type="button"
                    title="Coming soon"
                    className="ml-2 shrink-0 self-start rounded-full border border-white/10 p-2 text-text-secondary transition-colors hover:border-accent-red/40 hover:text-accent-red"
                  >
                    <Bell className="size-4" aria-hidden />
                    <span className="sr-only">Notify me — coming soon</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
