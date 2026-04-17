"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { EventsPanel } from "./EventsPanel";
import { LiveUpcomingPanel } from "./LiveUpcomingPanel";
import { RankingsPanel } from "./RankingsPanel";
import { ResultsPanel } from "./ResultsPanel";
import { RoadmapPanel } from "./RoadmapPanel";

const TABS = [
  { id: "live", label: "Live & Upcoming" },
  { id: "results", label: "Results" },
  { id: "rankings", label: "Rankings" },
  { id: "events", label: "Events" },
  { id: "roadmap", label: "Roadmap" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function EsportsHub() {
  const reduced = Boolean(useReducedMotion());
  const [tab, setTab] = useState<TabId>("live");

  return (
    <div className="min-h-screen bg-background pb-16 pt-6 sm:pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent-red">
            Esports
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-text-primary md:text-4xl">
            VCT & competitive coverage
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            Live scores, results, regional rankings, and events — powered by VLR data, styled for
            grinders.
          </p>
        </header>

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
                reduced ? (
                  <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-accent-red" />
                ) : (
                  <motion.div
                    layoutId="esports-main-tab-underline"
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-accent-red"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )
              ) : null}
            </button>
          ))}
        </nav>

        <div className="mt-8">
          <AnimatePresence mode={reduced ? "sync" : "wait"}>
            <motion.div
              key={tab}
              initial={reduced ? false : { opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: -10 }}
              transition={reduced ? { duration: 0 } : { duration: 0.22 }}
            >
              {tab === "live" ? <LiveUpcomingPanel /> : null}
              {tab === "results" ? <ResultsPanel /> : null}
              {tab === "rankings" ? <RankingsPanel /> : null}
              {tab === "events" ? <EventsPanel /> : null}
              {tab === "roadmap" ? <RoadmapPanel /> : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
