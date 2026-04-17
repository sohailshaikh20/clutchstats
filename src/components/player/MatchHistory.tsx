"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { MatchRow, QueueFilter } from "@/lib/player/build-profile-payload";
import { formatTimeAgo } from "@/lib/utils/time-ago";

function filterMatches(rows: MatchRow[], f: QueueFilter): MatchRow[] {
  if (f === "all") return rows;
  return rows.filter((r) => r.filterQueue === f);
}

export function MatchHistory({ matches }: { matches: MatchRow[] }) {
  const [filter, setFilter] = useState<QueueFilter>("all");
  const [visible, setVisible] = useState(10);

  const filtered = useMemo(() => filterMatches(matches, filter), [matches, filter]);
  const shown = filtered.slice(0, visible);
  const canLoadMore = visible < filtered.length;

  return (
    <section className="border-t border-white/5 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-body text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Recent matches
          </h2>
          <label className="flex items-center gap-2 font-body text-sm text-text-secondary">
            <span className="sr-only">Mode</span>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as QueueFilter);
                setVisible(10);
              }}
              className="cursor-pointer rounded-lg border border-surface-light bg-surface px-3 py-2 font-body text-xs font-semibold uppercase tracking-wide text-text-primary outline-none transition-colors hover:border-accent-red/40 hover:bg-surface-lighter focus:border-accent-red"
            >
              <option value="all">All</option>
              <option value="competitive">Competitive</option>
              <option value="unrated">Unrated</option>
            </select>
          </label>
        </div>

        <div className="mt-6 -mx-4 touch-pan-x overflow-x-auto overflow-y-visible overscroll-x-contain px-4 pb-1 [scrollbar-width:thin] sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
            }}
            className="flex w-max min-w-0 flex-row gap-4 sm:w-full sm:flex-col sm:gap-3"
          >
            <AnimatePresence mode="popLayout">
              {shown.map((m) => {
                const kdTone =
                  m.kd > 1 ? "text-win" : m.kd < 1 ? "text-loss" : "text-text-secondary";
                const myScoreClass = m.won ? "text-win" : "text-loss";
                const oppScoreClass = m.won ? "text-loss" : "text-win";

                return (
                  <motion.article
                    key={m.matchId}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 18 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
                      },
                    }}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    className={`group relative min-h-[140px] w-[min(100vw-2.5rem,420px)] shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 bg-surface transition-shadow duration-300 hover:border-white/15 sm:w-full sm:shrink ${
                      m.won
                        ? "border-l-[3px] border-l-win shadow-[inset_3px_0_10px_rgba(74,227,167,0.32)] group-hover:shadow-[inset_3px_0_16px_rgba(74,227,167,0.48)]"
                        : "border-l-[3px] border-l-loss shadow-[inset_3px_0_10px_rgba(255,70,85,0.28)] group-hover:shadow-[inset_3px_0_16px_rgba(255,70,85,0.45)]"
                    }`}
                  >
                    {m.mapSplash ? (
                      <Image
                        src={m.mapSplash}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 90vw, 900px"
                        className="object-cover opacity-[0.06] transition-opacity duration-300 group-hover:opacity-[0.12]"
                        aria-hidden
                      />
                    ) : null}
                    <div className="pointer-events-none absolute inset-0 z-[1] bg-background/92 transition-colors duration-300 group-hover:bg-background/88" />

                    <div className="relative z-[2] flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-0 sm:p-5">
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div
                          className="relative size-12 shrink-0 rounded-full p-0.5"
                          style={{
                            boxShadow: `0 0 0 2px ${m.agentRoleRing || "rgba(118,134,145,0.5)"}`,
                          }}
                        >
                          {m.agentIcon ? (
                            <Image
                              src={m.agentIcon}
                              alt=""
                              width={48}
                              height={48}
                              sizes="48px"
                              className="size-12 rounded-full border border-black/40 object-cover"
                            />
                          ) : (
                            <div className="size-12 rounded-full bg-surface-lighter" />
                          )}
                          {m.agentRoleIcon ? (
                            <span className="absolute -bottom-0.5 -right-0.5 flex size-[18px] items-center justify-center rounded-full border border-background bg-surface p-px shadow-sm">
                              <Image
                                src={m.agentRoleIcon}
                                alt=""
                                width={16}
                                height={16}
                                className="size-4 object-contain"
                              />
                            </span>
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-body text-xs font-medium uppercase tracking-wide text-text-secondary">
                            {m.queueLabel}
                          </p>
                          <p className="mt-0.5 font-heading text-sm font-semibold text-text-primary">
                            {m.mapName}
                          </p>
                          <p className="mt-1 font-heading text-2xl font-bold tabular-nums">
                            <span className={myScoreClass}>{m.teamRounds}</span>
                            <span className="text-text-secondary"> – </span>
                            <span className={oppScoreClass}>{m.oppRounds}</span>
                          </p>
                        </div>
                      </div>

                      <div
                        className="hidden h-16 w-px shrink-0 bg-gradient-to-b from-transparent via-white/12 to-transparent sm:block"
                        aria-hidden
                      />

                      <div className="mt-1 flex flex-1 flex-col gap-3 border-t border-white/10 pt-4 sm:mt-0 sm:border-t-0 sm:pt-0 sm:flex-row sm:items-center sm:justify-end sm:gap-6 sm:pl-6">
                        <div className="min-w-0 sm:text-right">
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
                          <p className="mt-1 font-heading text-xs tabular-nums text-text-secondary">
                            ACS{" "}
                            <span className="text-text-primary">{Math.round(m.combatScore)}</span>
                          </p>
                          {m.headshotPct !== null && (
                            <p className="mt-0.5 font-heading text-xs tabular-nums text-text-secondary">
                              HS%{" "}
                              <span className="text-text-primary">{m.headshotPct.toFixed(1)}%</span>
                            </p>
                          )}
                          {m.damagePerRound !== null && (
                            <p className="mt-0.5 font-heading text-xs tabular-nums text-text-secondary">
                              DMG/R{" "}
                              <span className="text-text-primary">{Math.round(m.damagePerRound)}</span>
                            </p>
                          )}
                        </div>
                        <p className="font-body text-xs text-text-secondary sm:shrink-0 sm:self-end">
                          {formatTimeAgo(m.gameStart)}
                        </p>
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setVisible((v) => v + 10)}
            className="mx-auto mt-6 block rounded-full border border-surface-light bg-surface-lighter px-6 py-2.5 font-body text-xs font-bold uppercase tracking-wider text-text-primary transition-colors hover:border-accent-red hover:text-accent-red"
          >
            Load more
          </motion.button>
        ) : null}
      </div>
    </section>
  );
}
