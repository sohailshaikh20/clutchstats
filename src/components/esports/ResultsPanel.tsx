"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Trophy } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  fetchVlrProxy,
  unwrapSegments,
} from "@/lib/esports/vlr-client-fetch";
import { FetchErrorPanel } from "@/components/ui/FetchErrorPanel";
import type { VLRMatchDetail, VLRResult } from "@/types/esports";
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

export function ResultsPanel() {
  const reduced = Boolean(useReducedMotion());
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<VLRResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mapsById, setMapsById] = useState<
    Record<string, VLRMatchDetail["maps"] | undefined>
  >({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);

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

  async function toggleExpand(id: string) {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    if (mapsById[id]) return;
    setDetailLoading(id);
    try {
      const raw = await fetchVlrProxy<unknown>(`/match/${id}`);
      const detail = (raw as { data?: VLRMatchDetail }).data;
      const maps = detail?.maps;
      setMapsById((m) => ({ ...m, [id]: maps }));
    } catch {
      setMapsById((m) => ({ ...m, [id]: undefined }));
    } finally {
      setDetailLoading(null);
    }
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
        const maps = mapsById[r.id];

        return (
          <motion.div
            key={r.id}
            className="overflow-hidden rounded-xl border border-surface-light bg-surface transition-colors hover:border-white/12"
          >
            <button
              type="button"
              onClick={() => void toggleExpand(r.id)}
              className="flex w-full flex-col gap-3 p-4 text-left sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <TeamLogo name={r.team1.name} logoUrl={r.team1.logo} size={36} />
                  <span
                    className={`font-heading text-sm font-bold sm:text-base ${
                      t1W ? "text-text-primary" : "text-text-secondary"
                    }`}
                  >
                    {r.team1.name}
                    {t1W ? (
                      <Trophy className="ml-1 inline size-3.5 text-accent-gold" aria-hidden />
                    ) : null}
                  </span>
                </div>
                <span className="font-heading text-xl font-bold tabular-nums text-text-primary">
                  <span className={t1W ? "text-win" : ""}>{r.team1.score}</span>
                  <span className="mx-1 text-text-secondary">–</span>
                  <span className={t2W ? "text-win" : ""}>{r.team2.score}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-heading text-sm font-bold sm:text-base ${
                      t2W ? "text-text-primary" : "text-text-secondary"
                    }`}
                  >
                    {r.team2.name}
                    {t2W ? (
                      <Trophy className="ml-1 inline size-3.5 text-accent-gold" aria-hidden />
                    ) : null}
                  </span>
                  <TeamLogo name={r.team2.name} logoUrl={r.team2.logo} size={36} />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-heading uppercase tracking-wide text-text-secondary">
                    {r.event?.name ?? r.series?.name}
                  </p>
                  <p className="font-heading text-xs text-text-secondary">
                    Maps {series} · {r.time_completed}
                  </p>
                </div>
                <motion.span
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
                >
                  <ChevronDown className="size-5 text-text-secondary" aria-hidden />
                </motion.span>
              </div>
            </button>

            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? undefined : { height: 0, opacity: 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.25 }}
                  className="border-t border-white/5 bg-background/40"
                >
                  <div className="space-y-2 px-4 py-3">
                    {detailLoading === r.id ? (
                      <p className="text-xs text-text-secondary">Loading maps…</p>
                    ) : maps && maps.length > 0 ? (
                      maps.map((map) => (
                        <div
                          key={map.name}
                          className="flex items-center justify-between rounded-lg border border-white/5 bg-surface/80 px-3 py-2 font-heading text-sm"
                        >
                          <span className="text-text-secondary">{map.name}</span>
                          <span className="tabular-nums text-text-primary">
                            {map.score.team1} – {map.score.team2}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-text-secondary">
                        Map breakdown unavailable for this match.
                      </p>
                    )}
                    <Link
                      href={internalMatchUrl(r)}
                      className="inline-block pt-1 text-xs font-semibold text-accent-blue hover:underline"
                    >
                      Match details →
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
