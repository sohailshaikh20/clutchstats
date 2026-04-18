"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { MatchCard } from "@/components/player/match/MatchCard";
import type { Match } from "@/types/profile-match-card";

export type { GameMode, Match, MatchResult } from "@/types/profile-match-card";

type ChipFilter = "all" | "competitive" | "unrated" | "deathmatch";

const CHIPS: { key: ChipFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "competitive", label: "Competitive" },
  { key: "unrated", label: "Unrated" },
  { key: "deathmatch", label: "Deathmatch" },
];

function passesFilter(m: Match, f: ChipFilter): boolean {
  if (f === "all") return true;
  if (f === "competitive") return m.mode === "Competitive";
  if (f === "deathmatch") return m.mode === "Deathmatch";
  if (f === "unrated") {
    return (
      m.mode === "Unrated" ||
      m.mode === "Swiftplay" ||
      m.mode === "Spikerush" ||
      m.mode === "TeamDeathmatch"
    );
  }
  return true;
}

function filterLabel(f: ChipFilter): string {
  if (f === "all") return "All";
  return CHIPS.find((c) => c.key === f)?.label ?? f;
}

const listContainerVariants = (reduced: boolean) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: reduced ? 0 : 0.04,
      delayChildren: reduced ? 0 : 0.02,
    },
  },
});

const listItem = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function MatchHistory({ matches }: { matches: Match[] }) {
  const reduced = Boolean(useReducedMotion());
  const [filter, setFilter] = useState<ChipFilter>("all");
  const [visible, setVisible] = useState(10);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => matches.filter((m) => passesFilter(m, filter)), [matches, filter]);
  const shown = filtered.slice(0, visible);
  const canLoadMore = visible < filtered.length;
  const containerVariants = useMemo(() => listContainerVariants(reduced), [reduced]);

  const setChip = (key: ChipFilter) => {
    setFilter(key);
    setVisible(10);
    setExpandedId(null);
  };

  return (
    <div className="border-t border-white/5 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="h-px w-6 shrink-0 bg-accent-red" aria-hidden />
            <h2 className="font-mono-display text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
              MATCH HISTORY
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {CHIPS.map((c) => {
              const active = filter === c.key;
              return (
                <motion.button
                  key={c.key}
                  type="button"
                  onClick={() => setChip(c.key)}
                  whileTap={reduced ? undefined : { scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 520, damping: 18 }}
                  className={`rounded-none border px-3 py-1 font-mono-display text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                    active
                      ? "border-[#FF4655] bg-[#FF4655] text-white"
                      : "border-white/[0.08] bg-white/[0.03] text-white/60 hover:bg-white/[0.06]"
                  }`}
                >
                  {c.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 flex min-h-[80px] flex-col items-center justify-center gap-3 bg-white/[0.02] px-4 py-6">
            <p className="font-mono-display text-xs text-white/40">
              {filter === "all" ? "No matches found" : `No ${filterLabel(filter)} matches found`}
            </p>
            {filter !== "all" ? (
              <button
                type="button"
                onClick={() => setChip("all")}
                className="font-mono-display text-[11px] font-bold uppercase tracking-wide text-white/50 underline-offset-4 transition-colors hover:text-white/80 hover:underline"
              >
                Clear filter
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <motion.div
              className="mt-6 flex flex-col gap-px bg-white/[0.04]"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {shown.map((m) => (
                <motion.div key={m.id} variants={listItem}>
                  <MatchCard
                    match={m}
                    expanded={expandedId === m.id}
                    onToggle={() => setExpandedId((id) => (id === m.id ? null : m.id))}
                  />
                </motion.div>
              ))}
            </motion.div>

            {canLoadMore ? (
              <button
                type="button"
                onClick={() => setVisible((v) => v + 10)}
                className="mx-auto mt-6 block border border-white/[0.08] bg-white/[0.03] px-6 py-3 font-mono-display text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 transition-colors hover:bg-white/[0.06]"
              >
                Load more matches
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
