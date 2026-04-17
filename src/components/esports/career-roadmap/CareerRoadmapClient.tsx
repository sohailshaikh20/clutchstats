"use client";

import type { RoadmapRankGroup } from "@/lib/esports/rank-roadmap-data";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { RankUpRoadmap, type RankUpAgent } from "./RankUpRoadmap";
import { VctTournamentPath } from "./VctTournamentPath";

const TABS = [
  { id: "vct" as const, label: "VCT Tournament Path" },
  { id: "rank" as const, label: "Rank-Up Roadmap" },
];

export function CareerRoadmapClient({
  rankGroups,
  agents,
  userRankGroupKey,
  riotLinked,
}: {
  rankGroups: RoadmapRankGroup[];
  agents: RankUpAgent[];
  userRankGroupKey: string | null;
  riotLinked: boolean;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("vct");

  return (
    <div>
      <nav className="relative flex flex-wrap gap-x-1 gap-y-2 border-b border-white/10">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative px-3 pb-3 pt-1 font-heading text-sm font-semibold uppercase tracking-wide transition-colors sm:text-base ${
              tab === t.id ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {t.label}
            {tab === t.id ? (
              <motion.div
                layoutId="career-roadmap-tab-underline"
                className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-accent-red"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            ) : null}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {tab === "vct" ? <VctTournamentPath /> : null}
            {tab === "rank" ? (
              <RankUpRoadmap
                rankGroups={rankGroups}
                agents={agents}
                userRankGroupKey={userRankGroupKey}
                riotLinked={riotLinked}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-12 text-center text-xs text-text-secondary">
        Back to{" "}
        <Link href="/esports" className="font-semibold text-accent-blue hover:underline">
          esports hub
        </Link>
      </p>
    </div>
  );
}
