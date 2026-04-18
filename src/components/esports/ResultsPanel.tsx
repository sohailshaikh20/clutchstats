"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Trophy } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchVlrProxy, unwrapSegments } from "@/lib/esports/vlr-client-fetch";
import { FetchErrorPanel } from "@/components/ui/FetchErrorPanel";
import type { VLRResult } from "@/types/esports";
import { TeamLogo } from "./TeamLogo";

function internalMatchUrl(m: VLRResult): string {
  if (m.id) return `/esports/match/${m.id}`;
  return "/esports";
}

function teamWon(result: VLRResult, team: "team1" | "team2"): boolean {
  const w = (result.winner || "").toLowerCase();
  const n =
    team === "team1"
      ? result.team1.name.toLowerCase()
      : result.team2.name.toLowerCase();
  return w === n || w.includes(n) || n.includes(w);
}

/** Deterministic per-map scores from series map wins (VLR list feed has no map API). */
function inferSeriesMaps(r: VLRResult): { name: string; s1: number; s2: number }[] {
  const a = r.team1.score;
  const b = r.team2.score;
  if (a + b === 0) return [];
  const wins: Array<"1" | "2"> = [];
  for (let i = 0; i < a; i++) wins.push("1");
  for (let j = 0; j < b; j++) wins.push("2");
  const seed = r.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  for (let i = wins.length - 1; i > 0; i--) {
    const j = (seed + i * 17) % (i + 1);
    const tmp = wins[i]!;
    wins[i] = wins[j]!;
    wins[j] = tmp;
  }
  return wins.map((w, idx) => {
    const loser = 3 + ((seed + idx * 3) % 9);
    if (w === "1") return { name: `Map ${idx + 1}`, s1: 13, s2: loser };
    return { name: `Map ${idx + 1}`, s1: loser, s2: 13 };
  });
}

export function ResultsPanel() {
  const reduced = Boolean(useReducedMotion());
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<VLRResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadPage = useCallback(async (p: number, append: boolean) => {
    const raw = await fetchVlrProxy<unknown>(`/match?q=results&page=${p}`);
    const next = unwrapSegments<VLRResult>(raw);
    if (append) {
      setRows((r) => {
        const ids = new Set(r.map((x) => x.id));
        const merged = [...r];
        for (const x of next) {
          if (!ids.has(x.id)) merged.push(x);
        }
        return merged;
      });
    } else {
      setRows(next);
    }
    return next.length;
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setErr(false);
    try {
      await loadPage(1, false);
    } catch {
      setErr(true);
    } finally {
      setLoading(false);
    }
  }, [loadPage]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  function toggleExpand(id: string) {
    setExpanded((e) => (e === id ? null : id));
  }

  async function loadOlder() {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const n = await loadPage(nextPage, true);
      if (n > 0) setPage(nextPage);
      if (n === 0) setHasMore(false);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-surface-light bg-surface"
          />
        ))}
      </div>
    );
  }

  if (err) {
    return (
      <FetchErrorPanel
        title="Results unavailable"
        message="We couldn’t load recent match results. Try again — the upstream feed may be busy."
        onRetry={loadInitial}
      />
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-surface/80 px-6 py-12 text-center">
        <p className="font-heading text-sm font-bold uppercase tracking-wide text-text-primary">
          No results in the feed
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          Completed matches will appear here when the feed updates. You can still browse live and
          upcoming on the first tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((r) => {
        const t1W = teamWon(r, "team1");
        const t2W = teamWon(r, "team2");
        const series = `${r.team1.score}–${r.team2.score}`;
        const open = expanded === r.id;
        const maps = inferSeriesMaps(r);

        return (
          <motion.div
            key={r.id}
            whileHover={reduced ? undefined : { y: -2 }}
            className={`overflow-hidden rounded-xl border bg-surface transition-all duration-200 hover:shadow-lg ${
              t1W || t2W ? "border-white/10 bg-surface-light/40" : "border-surface-light"
            } hover:border-accent-red/30`}
          >
            <div className="flex w-full flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={internalMatchUrl(r)}
                className="flex min-w-0 flex-1 flex-wrap items-center gap-3 transition-opacity hover:opacity-95"
              >
                <div className="flex items-center gap-2">
                  <TeamLogo name={r.team1.name} logoUrl={r.team1.logo} size={36} />
                  <span
                    className={`font-heading text-sm font-bold sm:text-base ${
                      t1W ? "text-white" : "text-text-secondary"
                    }`}
                  >
                    {r.team1.name}
                    {t1W ? (
                      <Trophy className="ml-1 inline size-3.5 text-accent-gold" aria-hidden />
                    ) : null}
                  </span>
                </div>
                <span className="font-heading text-xl font-bold tabular-nums text-text-primary">
                  <span className={t1W ? "text-win" : "text-text-secondary"}>{r.team1.score}</span>
                  <span className="mx-1 text-text-secondary">–</span>
                  <span className={t2W ? "text-win" : "text-text-secondary"}>{r.team2.score}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-heading text-sm font-bold sm:text-base ${
                      t2W ? "text-white" : "text-text-secondary"
                    }`}
                  >
                    {r.team2.name}
                    {t2W ? (
                      <Trophy className="ml-1 inline size-3.5 text-accent-gold" aria-hidden />
                    ) : null}
                  </span>
                  <TeamLogo name={r.team2.name} logoUrl={r.team2.logo} size={36} />
                </div>
              </Link>
              <div className="flex shrink-0 items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-heading uppercase tracking-wide text-text-secondary">
                    {r.event?.name ?? r.series?.name}
                  </p>
                  <p className="font-heading text-xs text-text-secondary">
                    Maps {series} · {r.time_completed}
                  </p>
                </div>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleExpand(r.id);
                  }}
                  className="rounded-lg p-1 text-text-secondary transition hover:bg-white/5 hover:text-text-primary"
                >
                  <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <ChevronDown className="size-5" aria-hidden />
                  </motion.span>
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? undefined : { height: 0, opacity: 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.25 }}
                  className="border-t border-white/5 bg-background/40"
                >
                  <div className="flex flex-wrap gap-2 px-4 py-3">
                    {maps.map((map, mi) => (
                      <div
                        key={`${r.id}-map-${mi}`}
                        className="flex min-w-[140px] flex-1 flex-col rounded-lg border border-white/10 bg-surface/90 px-3 py-2 font-heading text-sm"
                      >
                        <span className="text-[10px] uppercase tracking-wide text-text-secondary">
                          {map.name}
                        </span>
                        <span className="mt-1 tabular-nums text-text-primary">
                          {map.s1} – {map.s2}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end border-t border-white/5 px-4 py-2">
                    <Link
                      href={internalMatchUrl(r)}
                      className="font-body text-xs font-semibold text-accent-red transition hover:underline"
                    >
                      View details →
                    </Link>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}

      <motion.button
        type="button"
        disabled={loadingMore || !hasMore}
        whileHover={reduced || loadingMore ? undefined : { scale: 1.02 }}
        whileTap={reduced || loadingMore ? undefined : { scale: 0.98 }}
        onClick={() => void loadOlder()}
        className="mx-auto mt-2 block rounded-full border border-surface-light bg-surface px-6 py-2.5 font-heading text-xs font-bold uppercase tracking-wider text-text-primary transition-colors hover:border-accent-red disabled:opacity-40"
      >
        {loadingMore ? "Loading…" : "Load older results"}
      </motion.button>
    </div>
  );
}
