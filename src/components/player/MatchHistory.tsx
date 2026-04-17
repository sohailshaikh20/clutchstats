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
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary">
            RECENT MATCHES
          </h2>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="sr-only">Mode</span>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as QueueFilter);
                setVisible(10);
              }}
              className="cursor-pointer rounded-lg border border-surface-light bg-surface px-3 py-2 font-heading text-xs font-semibold uppercase tracking-wide text-text-primary outline-none transition-colors hover:border-accent-red/40 focus:border-accent-red"
            >
              <option value="all">All</option>
              <option value="competitive">Competitive</option>
              <option value="unrated">Unrated</option>
            </select>
          </label>
        </div>

        <div className="mt-8 -mx-4 touch-pan-x overflow-x-auto overflow-y-visible overscroll-x-contain px-4 pb-1 [scrollbar-width:thin] sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: { staggerChildren: 0.05 },
              },
            }}
            className="flex w-max min-w-0 flex-row gap-4 sm:w-full sm:flex-col sm:gap-4"
          >
            <AnimatePresence mode="popLayout">
              {shown.map((m) => (
                <motion.article
                  key={m.matchId}
                  layout
                  variants={{
                    hidden: { opacity: 0, x: -24 },
                    show: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className={`group relative w-[min(100vw-2.5rem,380px)] shrink-0 snap-start overflow-hidden rounded-xl border border-surface-light bg-surface transition-[border-color,box-shadow] hover:border-white/25 hover:shadow-lg sm:w-full sm:shrink ${
                    m.won ? "border-l-4 border-l-win" : "border-l-4 border-l-loss"
                  }`}
                >
                {m.mapSplash ? (
                  <div
                    className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.07] transition-opacity group-hover:opacity-[0.09]"
                    style={{ backgroundImage: `url(${m.mapSplash})` }}
                  />
                ) : null}
                <div className="relative z-[1] flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1.5">
                      {m.agentIcon ? (
                        <Image
                          src={m.agentIcon}
                          alt=""
                          width={40}
                          height={40}
                          sizes="40px"
                          className="size-10 rounded-full border border-white/10 object-cover"
                        />
                      ) : (
                        <div className="size-10 rounded-full bg-surface-lighter" />
                      )}
                      <span className="max-w-[4.5rem] truncate text-center text-xs text-text-secondary">
                        {m.agentName}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-sm font-semibold text-text-primary">
                        {m.mapName}
                      </p>
                      <div className="mt-1 flex flex-wrap items-baseline gap-2">
                        <span className="font-heading text-xl font-bold tabular-nums">
                          <span className={m.won ? "text-win" : "text-loss"}>
                            {m.teamRounds}
                          </span>
                          <span className="text-text-secondary"> – </span>
                          <span className={m.won ? "text-loss" : "text-win"}>
                            {m.oppRounds}
                          </span>
                        </span>
                        <span className="rounded border border-white/10 bg-background/60 px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wide text-text-secondary">
                          {m.queueLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-wrap items-end justify-between gap-4 sm:justify-end">
                    <div>
                      <p className="font-heading text-lg font-bold">
                        <span className="text-win">{m.kills}</span>
                        <span className="text-text-secondary"> / </span>
                        <span className="text-loss">{m.deaths}</span>
                        <span className="text-text-secondary"> / </span>
                        <span className="text-text-secondary">{m.assists}</span>
                      </p>
                      <p className="mt-0.5 font-heading text-xs text-text-secondary">
                        KD {m.kd.toFixed(2)} · ACS {Math.round(m.combatScore)}
                      </p>
                    </div>
                    <p className="font-heading text-xs text-text-secondary">
                      {formatTimeAgo(m.gameStart)}
                    </p>
                  </div>
                </div>
              </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {canLoadMore ? (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setVisible((v) => v + 10)}
            className="mx-auto mt-8 block rounded-full border border-surface-light bg-surface-lighter px-6 py-2.5 font-heading text-xs font-bold uppercase tracking-wider text-text-primary transition-colors hover:border-accent-red hover:text-accent-red"
          >
            Load more
          </motion.button>
        ) : null}
      </div>
    </section>
  );
}
