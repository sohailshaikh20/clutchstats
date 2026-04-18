"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { MatchRow, QueueFilter } from "@/lib/player/build-profile-payload";
import { formatTimeAgo } from "@/lib/utils/time-ago";

function filterMatches(rows: MatchRow[], f: QueueFilter): MatchRow[] {
  if (f === "all") return rows;
  return rows.filter((r) => r.filterQueue === f);
}

function modePillClass(fq: MatchRow["filterQueue"]): string {
  if (fq === "competitive") {
    return "border-accent-blue/40 bg-accent-blue/15 text-accent-blue";
  }
  if (fq === "unrated") {
    return "border-surface-light bg-surface-light/50 text-text-primary";
  }
  if (fq === "deathmatch") {
    return "border-white/10 bg-transparent text-text-secondary";
  }
  return "border-white/10 bg-background/50 text-text-secondary";
}

function modePillLabel(m: MatchRow): string {
  if (m.filterQueue === "competitive") return "Competitive";
  if (m.filterQueue === "unrated") return "Unrated";
  if (m.filterQueue === "deathmatch") return "Deathmatch";
  return m.queueLabel.length > 18 ? `${m.queueLabel.slice(0, 16)}…` : m.queueLabel;
}

export function MatchHistory({ matches }: { matches: MatchRow[] }) {
  const reduced = Boolean(useReducedMotion());
  const [filter, setFilter] = useState<QueueFilter>("all");
  const [visible, setVisible] = useState(10);

  const filtered = useMemo(() => filterMatches(matches, filter), [matches, filter]);
  const shown = filtered.slice(0, visible);
  const canLoadMore = visible < filtered.length;

  return (
    <section className="border-t border-white/5 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Match history
          </h2>
          <label className="flex min-h-[44px] items-center gap-2 font-body text-sm text-text-secondary sm:min-h-0">
            <span className="sr-only">Mode</span>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as QueueFilter);
                setVisible(10);
              }}
              className="min-h-[44px] w-full cursor-pointer rounded-lg border border-surface-light bg-surface px-3 py-2.5 font-body text-xs font-semibold uppercase tracking-wide text-text-primary outline-none transition-colors hover:border-accent-red/40 hover:bg-surface-lighter focus:border-accent-red sm:min-h-0 sm:w-auto"
            >
              <option value="all">All</option>
              <option value="competitive">Competitive</option>
              <option value="unrated">Unrated</option>
              <option value="deathmatch">Deathmatch</option>
            </select>
          </label>
        </div>

        <div className="mt-5 sm:mt-6">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: reduced ? 0 : 0.04, delayChildren: 0.02 } },
            }}
            className="flex flex-col gap-3"
          >
            <AnimatePresence mode="popLayout">
              {shown.map((m) => {
                const kdTone =
                  m.kd > 1 ? "text-win" : m.kd < 1 ? "text-loss" : "text-text-secondary";
                const teamScoreClass = m.won ? "text-win" : "text-loss";
                const oppScoreClass = m.won ? "text-loss" : "text-win";

                return (
                  <motion.article
                    key={m.matchId}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
                      },
                    }}
                    whileHover={reduced ? undefined : { y: -2, transition: { duration: 0.2 } }}
                    className={`group relative min-h-[148px] overflow-hidden rounded-xl border border-white/10 bg-surface transition-[box-shadow,border-color] duration-300 hover:border-accent-red/30 hover:shadow-lg ${
                      m.won
                        ? "border-l-[3px] border-l-win shadow-[inset_3px_0_10px_rgba(74,227,167,0.2)]"
                        : "border-l-[3px] border-l-loss shadow-[inset_3px_0_10px_rgba(255,70,85,0.2)]"
                    }`}
                  >
                    {m.mapSplash ? (
                      <div
                        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.07] transition-opacity duration-300 group-hover:opacity-[0.12]"
                        style={{ backgroundImage: `url(${m.mapSplash})` }}
                        aria-hidden
                      />
                    ) : null}
                    <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-surface via-surface/95 to-surface/90" />

                    <div className="relative z-[2] flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:justify-between sm:gap-6 sm:p-5">
                      <div className="flex min-w-0 flex-1 gap-4">
                        <div className="flex shrink-0 flex-col items-center gap-1">
                          <div
                            className="relative overflow-hidden rounded-lg border-2 bg-surface p-0.5"
                            style={{ borderColor: m.agentRoleRing || "rgba(118,134,145,0.45)" }}
                          >
                            {m.agentIcon ? (
                              <Image
                                src={m.agentIcon}
                                alt=""
                                width={48}
                                height={48}
                                sizes="48px"
                                className="size-12 rounded-md object-cover"
                              />
                            ) : (
                              <div className="size-12 rounded-md bg-surface-lighter" />
                            )}
                          </div>
                          <span className="max-w-[4.5rem] text-center font-body text-[10px] leading-tight text-text-secondary">
                            {m.agentName}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider ${modePillClass(m.filterQueue)}`}
                            >
                              {modePillLabel(m)}
                            </span>
                          </div>
                          <p className="mt-2 font-heading text-sm font-semibold text-text-primary">
                            {m.mapName}
                          </p>
                          <p className="mt-1 font-heading text-xl font-bold tabular-nums">
                            <span className={teamScoreClass}>{m.teamRounds}</span>
                            <span className="text-text-secondary"> - </span>
                            <span className={oppScoreClass}>{m.oppRounds}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col gap-3 border-t border-white/10 pt-4 sm:max-w-md sm:border-t-0 sm:pt-0">
                        <div className="flex flex-1 flex-wrap items-start justify-between gap-4 sm:flex-nowrap">
                          <div className="min-w-0">
                            <p className="font-heading text-lg font-bold tabular-nums">
                              <span className="text-text-primary">{m.kills}</span>
                              <span className="text-text-secondary"> / </span>
                              <span className="text-loss">{m.deaths}</span>
                              <span className="text-text-secondary"> / </span>
                              <span className="text-text-secondary">{m.assists}</span>
                            </p>
                            <p className={`mt-0.5 font-heading text-xs font-semibold tabular-nums ${kdTone}`}>
                              KD {m.kd.toFixed(2)}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-heading text-[11px] tabular-nums text-text-secondary">
                              <span>
                                ACS{" "}
                                <span className="text-text-primary">{Math.round(m.combatScore)}</span>
                              </span>
                              {m.headshotPct !== null ? (
                                <span>
                                  HS%{" "}
                                  <span className="text-text-primary">{m.headshotPct.toFixed(1)}%</span>
                                </span>
                              ) : null}
                              {m.damagePerRound !== null ? (
                                <span>
                                  DMG/R{" "}
                                  <span className="text-text-primary">{Math.round(m.damagePerRound)}</span>
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <p className="ml-auto font-body text-xs text-text-secondary sm:ml-0 sm:self-start sm:pt-1">
                            {formatTimeAgo(m.gameStart)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>

        {canLoadMore ? (
          <motion.button
            type="button"
            whileHover={reduced ? undefined : { scale: 1.02 }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
            onClick={() => setVisible((v) => v + 10)}
            className="mx-auto mt-6 block min-h-[44px] rounded-full border border-surface-light bg-surface-lighter px-8 py-3 font-body text-xs font-bold uppercase tracking-wider text-text-primary transition-colors hover:border-accent-red hover:text-accent-red"
          >
            Load more
          </motion.button>
        ) : null}
      </div>
    </section>
  );
}
