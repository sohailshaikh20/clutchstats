"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crown, Flame, MapPin, Star, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { VctTournamentPath } from "@/components/esports/career-roadmap/VctTournamentPath";

// ─── VCT Historical Data ──────────────────────────────────────────────────────

type ChampionsRecord = {
  name: string;
  location: string;
  winner: string;
  runnerUp: string;
  score: string;
  prizePool: string;
  teams: number;
  mvp: string;
};

type MastersRecord = {
  name: string;
  winner: string;
  runnerUp: string;
  score: string;
  prizePool?: string;
};

type YearRecord = {
  champions: ChampionsRecord;
  masters: MastersRecord[];
};

const VCT_HISTORY: Record<string, YearRecord> = {
  "2026": {
    champions: {
      name: "VCT Champions 2026",
      location: "TBD",
      winner: "TBD",
      runnerUp: "TBD",
      score: "–",
      prizePool: "$2,000,000+",
      teams: 16,
      mvp: "TBD",
    },
    masters: [
      { name: "Masters Bangkok", winner: "TBD", runnerUp: "TBD", score: "–", prizePool: "$500,000" },
    ],
  },
  "2025": {
    champions: {
      name: "VCT Champions 2025",
      location: "London",
      winner: "Team Liquid",
      runnerUp: "Sentinels",
      score: "3-2",
      prizePool: "$2,000,000",
      teams: 16,
      mvp: "nAts",
    },
    masters: [
      { name: "Masters Bangkok", winner: "Fnatic", runnerUp: "Paper Rex", score: "3-1", prizePool: "$500,000" },
      { name: "Masters Toronto", winner: "Sentinels", runnerUp: "LOUD", score: "3-2", prizePool: "$500,000" },
    ],
  },
  "2024": {
    champions: {
      name: "VCT Champions 2024",
      location: "Seoul",
      winner: "EDward Gaming",
      runnerUp: "Team Heretics",
      score: "3-2",
      prizePool: "$1,000,000",
      teams: 16,
      mvp: "ZmjjKK",
    },
    masters: [
      { name: "Masters Shanghai", winner: "Gen.G", runnerUp: "Team Heretics", score: "3-0", prizePool: "$500,000" },
      { name: "Masters Madrid", winner: "Sentinels", runnerUp: "Gen.G", score: "3-1", prizePool: "$500,000" },
    ],
  },
  "2023": {
    champions: {
      name: "VCT Champions 2023",
      location: "Los Angeles",
      winner: "Evil Geniuses",
      runnerUp: "Paper Rex",
      score: "3-1",
      prizePool: "$1,000,000",
      teams: 16,
      mvp: "Demon1",
    },
    masters: [
      { name: "Masters Tokyo", winner: "Fnatic", runnerUp: "Paper Rex", score: "3-0" },
      { name: "LOCK//IN São Paulo", winner: "Fnatic", runnerUp: "LOUD", score: "3-1" },
    ],
  },
  "2022": {
    champions: {
      name: "VCT Champions 2022",
      location: "Istanbul",
      winner: "LOUD",
      runnerUp: "OpTic Gaming",
      score: "3-1",
      prizePool: "$1,000,000",
      teams: 16,
      mvp: "Less",
    },
    masters: [
      { name: "Masters Copenhagen", winner: "FunPlus Phoenix", runnerUp: "Paper Rex", score: "3-2" },
      { name: "Masters Reykjavík", winner: "OpTic Gaming", runnerUp: "LOUD", score: "3-0" },
    ],
  },
};

const YEARS = ["2026", "2025", "2024", "2023", "2022"] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChampionsCard({ data }: { data: ChampionsRecord }) {
  const isPast = data.winner !== "TBD";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-accent-gold/30 bg-gradient-to-br from-surface via-surface to-transparent p-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-gold/8 to-transparent" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <Crown className="size-5 text-accent-gold" aria-hidden />
          <span className="font-heading text-xs font-semibold uppercase tracking-widest text-accent-gold">
            {data.name}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          {isPast ? (
            <>
              <div>
                <p className="font-body text-xs text-text-secondary">Winner</p>
                <p className="mt-0.5 font-heading text-xl font-bold text-win">{data.winner}</p>
              </div>
              <div className="font-heading text-2xl font-bold text-text-secondary">{data.score}</div>
              <div className="opacity-60">
                <p className="font-body text-xs text-text-secondary">Runner-up</p>
                <p className="mt-0.5 font-heading text-xl font-bold text-text-primary">{data.runnerUp}</p>
              </div>
            </>
          ) : (
            <div className="rounded-full border border-white/10 bg-surface px-4 py-2 font-heading text-sm text-text-secondary">
              Season in progress — winner TBD
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {data.location}
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {data.teams} teams
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="size-3.5" />
            {data.prizePool}
          </span>
          {isPast && data.mvp !== "TBD" && (
            <span className="flex items-center gap-1">
              <Star className="size-3.5 text-accent-gold" />
              MVP: {data.mvp}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MastersGrid({ events }: { events: MastersRecord[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {events.map((e, i) => (
        <motion.div
          key={e.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.38 }}
          className="rounded-xl border border-surface-light bg-surface p-4"
        >
          <div className="flex items-center gap-2">
            <Flame className="size-4 text-accent-red" aria-hidden />
            <p className="font-heading text-xs font-bold uppercase tracking-wide text-text-primary">
              {e.name}
            </p>
          </div>
          {e.winner !== "TBD" ? (
            <div className="mt-3 flex items-center gap-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading font-semibold text-win">{e.winner}</p>
                <p className="mt-0.5 text-xs text-text-secondary">def. {e.runnerUp}</p>
              </div>
              <span className="shrink-0 font-heading text-lg font-bold tabular-nums text-text-primary">
                {e.score}
              </span>
            </div>
          ) : (
            <p className="mt-3 text-xs text-text-secondary italic">Results pending</p>
          )}
          {e.prizePool && (
            <p className="mt-2 font-heading text-xs text-accent-gold">{e.prizePool}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RoadmapPanel() {
  const [year, setYear] = useState<string>("2024");
  const data = VCT_HISTORY[year];

  return (
    <div className="space-y-8">
      {/* Year selector */}
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 pb-4">
        {YEARS.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => setYear(y)}
            className={`relative rounded-lg px-4 py-1.5 font-heading text-xs font-bold uppercase tracking-wide transition-colors ${
              year === y
                ? "bg-accent-red text-white shadow-glow-red"
                : "text-text-secondary hover:bg-surface-lighter hover:text-text-primary"
            }`}
          >
            {y}
          </button>
        ))}
        <span className="ml-auto font-body text-xs text-text-secondary/60">VCT Season History</span>
      </div>

      {/* History content */}
      <AnimatePresence mode="wait">
        <div key={year} className="space-y-6">
          <div>
            <h3 className="mb-3 font-heading text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
              Champions
            </h3>
            <ChampionsCard data={data.champions} />
          </div>

          <div>
            <h3 className="mb-3 font-heading text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
              Masters Events
            </h3>
            <MastersGrid events={data.masters} />
          </div>
        </div>
      </AnimatePresence>

      <div className="mt-10">
        <h3 className="mb-3 font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary">
          VCT tournament path
        </h3>
        <VctTournamentPath />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-8 rounded-xl border border-white/10 bg-surface/80 p-4"
      >
        <p className="font-body text-sm text-text-secondary">
          Need the full rank-up playbook?{" "}
          <Link href="/esports/roadmap" className="font-semibold text-accent-blue underline-offset-4 hover:underline">
            Open career roadmap
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
