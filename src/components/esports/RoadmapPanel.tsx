"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const PHASES = [
  {
    phase: "Phase 1 — Live",
    items: ["Valorant player profiles & match history", "Esports hub (VLR data)", "Design system"],
  },
  {
    phase: "Phase 2 — Social",
    items: ["Rank-verified squad finder", "Bell notifications for matches", "Discord deep links"],
  },
  {
    phase: "Phase 3 — Coach",
    items: ["AI post-game reports", "Act leaderboards", "Roadmaps per agent / meta"],
  },
];

export function RoadmapPanel() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {PHASES.map((p, i) => (
          <motion.div
            key={p.phase}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-surface-light bg-surface p-5"
          >
            <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-accent-red">
              {p.phase}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
              {p.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-blue" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="rounded-xl border border-accent-red/30 bg-surface p-5 sm:p-6"
      >
        <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-accent-gold">
          Career roadmap (exclusive)
        </h3>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Explore the VCT tournament path as a metro map and a rank-by-rank climb guide — only on
          ClutchStats.gg.
        </p>
        <Link
          href="/esports/roadmap"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent-red px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-white transition hover:bg-accent-red/90"
        >
          Open career roadmap
        </Link>
      </motion.div>
    </div>
  );
}
