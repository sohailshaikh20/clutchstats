"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crown, Flame, Globe2, Sparkles, TrendingUp, Users } from "lucide-react";
import { useMemo, useState } from "react";

export type VctStageId =
  | "game-changers"
  | "challengers-emea"
  | "challengers-americas"
  | "challengers-pacific"
  | "challengers-china"
  | "ascension"
  | "international-emea"
  | "international-americas"
  | "international-pacific"
  | "masters"
  | "champions";

type StageDetail = {
  title: string;
  teams: string;
  schedule: string;
  format: string;
  prizePool: string;
  qualified: string;
};

const STAGE_DETAILS: Record<VctStageId, StageDetail> = {
  "game-changers": {
    title: "Game Changers",
    teams: "Global GC teams & open qualifier stacks",
    schedule: "GC Series events across regions; calendar varies by split",
    format: "Open qualifiers → regional events → championship",
    prizePool: "Varies by event tier (official Riot prize tracks)",
    qualified: "Open registration + qualifier placement",
  },
  "challengers-emea": {
    title: "Challengers League — EMEA",
    teams: "Partnered & promoted EMEA Challengers orgs",
    schedule: "Regular season → playoffs across VCT splits",
    format: "Round-robin / groups into double-elim playoffs",
    prizePool: "Regional prize pool + circuit points",
    qualified: "Open qualifiers, Ascension promotions, partner slots",
  },
  "challengers-americas": {
    title: "Challengers League — Americas",
    teams: "North & LATAM Challengers representatives",
    schedule: "Regional league weeks aligned with VCT calendar",
    format: "League format into playoff bracket",
    prizePool: "Regional distribution by placement",
    qualified: "Qualifier winners + retained league slots",
  },
  "challengers-pacific": {
    title: "Challengers League — Pacific",
    teams: "APAC regional Challengers squads",
    schedule: "Pacific circuit stages through the year",
    format: "Groups and playoffs toward Ascension",
    prizePool: "Regional prize pool",
    qualified: "National/regional qualifier paths",
  },
  "challengers-china": {
    title: "Challengers — China",
    teams: "China regional competitive teams",
    schedule: "Domestic circuit aligned with publisher schedule",
    format: "Regional league + playoffs",
    prizePool: "Regional awards",
    qualified: "Domestic qualifier and promotion rules",
  },
  ascension: {
    title: "Ascension",
    teams: "Top Challengers finishers per region",
    schedule: "Post-season Ascension tournament per region",
    format: "High-stakes double-elim / bracket finals",
    prizePool: "Promotion + regional prize pool",
    qualified: "Challengers league placement thresholds",
  },
  "international-emea": {
    title: "International League — EMEA",
    teams: "Permanent partner orgs + Ascension graduate",
    schedule: "Year-long league with kickoff, mid, finals",
    format: "League into international LAN finals",
    prizePool: "Masters & Champions qualification + stipends",
    qualified: "Partnership + Ascension winner",
  },
  "international-americas": {
    title: "International League — Americas",
    teams: "Americas partnered franchises + promoted club",
    schedule: "Split-based league play into LAN finals",
    format: "League stages feeding global events",
    prizePool: "Circuit prize + event bonuses",
    qualified: "Partnership + Ascension",
  },
  "international-pacific": {
    title: "International League — Pacific",
    teams: "Pacific partnered teams + Ascension slot",
    schedule: "Regional splits culminating in finals",
    format: "League format with international crossovers",
    prizePool: "Regional and global allocations",
    qualified: "Partnership + Ascension",
  },
  masters: {
    title: "Masters",
    teams: "Top International League placements worldwide",
    schedule: "Mid-season international LAN",
    format: "Swiss / groups into elimination bracket",
    prizePool: "Major global prize pool + Champions points",
    qualified: "League stage placement & circuit points",
  },
  champions: {
    title: "Champions",
    teams: "Elite squads from every region",
    schedule: "Season-culminating world championship",
    format: "Champions bracket — highest LAN pressure",
    prizePool: "Largest seasonal prize pool on the circuit",
    qualified: "Masters results + league auto-bids + LCQ paths",
  },
};

/** Swap to any `VctStageId` to show the live “pulse” ring (wire to calendar later). */
const ACTIVE_STAGE: VctStageId = "masters";

const NODE = { r: 34 };

const REGION_LINE: Record<string, string> = {
  emea: "#818cf8",
  americas: "#3b82f6",
  pacific: "#06b6d4",
  china: "#f59e0b",
};

function StageIcon({ id }: { id: VctStageId }) {
  const cn = "size-5 text-white sm:size-6";
  if (id === "game-changers") return <Sparkles className={cn} aria-hidden />;
  if (id.startsWith("challengers")) return <Users className={cn} aria-hidden />;
  if (id === "ascension") return <TrendingUp className={cn} aria-hidden />;
  if (id.startsWith("international")) return <Globe2 className={cn} aria-hidden />;
  if (id === "masters") return <Flame className={cn} aria-hidden />;
  return <Crown className={cn} aria-hidden />;
}

function MetroNode({
  id,
  label,
  fill,
  cx,
  cy,
  onSelect,
  active,
  labelFontSize = 10,
}: {
  id: VctStageId;
  label: string;
  fill: string;
  cx: number;
  cy: number;
  onSelect: (id: VctStageId) => void;
  active: boolean;
  labelFontSize?: number;
}) {
  return (
    <g
      className="cursor-pointer"
      onClick={() => onSelect(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(id);
        }
      }}
      role="button"
      tabIndex={0}
    >
      {active ? (
        <circle
          cx={cx}
          cy={cy}
          r={NODE.r + 10}
          fill="none"
          stroke="#FF4655"
          strokeWidth={3}
          className="roadmap-node-pulse-ring pointer-events-none"
          opacity={0.85}
        />
      ) : null}
      <circle cx={cx} cy={cy} r={NODE.r + 5} fill={fill} opacity={0.25} className="pointer-events-none" />
      <circle cx={cx} cy={cy} r={NODE.r} fill="#1A2634" stroke={fill} strokeWidth={3} />
      <foreignObject x={cx - NODE.r + 8} y={cy - NODE.r + 10} width={52} height={52} className="pointer-events-none">
        <div className="flex h-full w-full items-center justify-center">
          <StageIcon id={id} />
        </div>
      </foreignObject>
      <text
        x={cx}
        y={cy + NODE.r + 18}
        textAnchor="middle"
        fill="#ECE8E1"
        fontSize={labelFontSize}
        fontWeight={700}
        className="pointer-events-none font-heading uppercase tracking-wide"
      >
        {label}
      </text>
    </g>
  );
}

function ArrowHead({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill={color} />
    </marker>
  );
}

export function VctTournamentPath() {
  const [selected, setSelected] = useState<VctStageId | null>(null);
  const detail = selected ? STAGE_DETAILS[selected] : null;

  const markerPrefix = useMemo(() => `m-${Math.random().toString(36).slice(2, 8)}`, []);

  return (
    <div className="rounded-xl border border-white/10 bg-surface p-4 sm:p-6">
      <h2 className="font-heading text-lg font-bold text-text-primary sm:text-xl">VCT tournament path</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Subway-style map of the Valorant ecosystem — tap a stage for format, schedule, and qualification
        notes.
      </p>

      <div className="relative mt-6 -mx-2 touch-pan-x overflow-x-auto overscroll-x-contain pb-6 sm:mx-0 sm:overflow-visible">
        <svg
          viewBox="0 0 1280 440"
          className="mx-auto block h-[min(420px,78vw)] w-[1280px] max-w-none sm:h-auto sm:min-h-[360px] sm:w-full"
          role="img"
          aria-label="VCT path from Game Changers through Champions"
        >
          <defs>
            <ArrowHead id={`${markerPrefix}-e`} color={REGION_LINE.emea} />
            <ArrowHead id={`${markerPrefix}-a`} color={REGION_LINE.americas} />
            <ArrowHead id={`${markerPrefix}-p`} color={REGION_LINE.pacific} />
            <ArrowHead id={`${markerPrefix}-c`} color={REGION_LINE.china} />
            <ArrowHead id={`${markerPrefix}-i`} color="#F5C542" />
            <ArrowHead id={`${markerPrefix}-r`} color="#FF4655" />
            <ArrowHead id={`${markerPrefix}-x`} color="#fde68a" />
          </defs>

          {/* Game Changers → Challengers (fan out) */}
          <path
            d="M 132 220 C 200 220, 210 220, 248 100"
            fill="none"
            stroke={REGION_LINE.emea}
            strokeWidth={2.5}
            className="roadmap-dash-animate"
            markerEnd={`url(#${markerPrefix}-e)`}
          />
          <path
            d="M 132 220 C 200 220, 210 220, 248 180"
            fill="none"
            stroke={REGION_LINE.americas}
            strokeWidth={2.5}
            className="roadmap-dash-animate"
            markerEnd={`url(#${markerPrefix}-a)`}
          />
          <path
            d="M 132 220 C 200 220, 210 220, 248 260"
            fill="none"
            stroke={REGION_LINE.pacific}
            strokeWidth={2.5}
            className="roadmap-dash-animate"
            markerEnd={`url(#${markerPrefix}-p)`}
          />
          <path
            d="M 132 220 C 200 220, 210 220, 248 340"
            fill="none"
            stroke={REGION_LINE.china}
            strokeWidth={2.5}
            className="roadmap-dash-animate"
            markerEnd={`url(#${markerPrefix}-c)`}
          />

          {/* Challengers → Ascension */}
          <path
            d="M 318 100 C 420 120, 460 200, 520 220"
            fill="none"
            stroke={REGION_LINE.emea}
            strokeWidth={2.5}
            className="roadmap-dash-animate"
            markerEnd={`url(#${markerPrefix}-e)`}
          />
          <path
            d="M 318 180 C 420 200, 460 210, 520 220"
            fill="none"
            stroke={REGION_LINE.americas}
            strokeWidth={2.5}
            className="roadmap-dash-animate"
            markerEnd={`url(#${markerPrefix}-a)`}
          />
          <path
            d="M 318 260 C 420 240, 460 230, 520 220"
            fill="none"
            stroke={REGION_LINE.pacific}
            strokeWidth={2.5}
            className="roadmap-dash-animate"
            markerEnd={`url(#${markerPrefix}-p)`}
          />
          <path
            d="M 318 340 C 420 300, 460 240, 520 220"
            fill="none"
            stroke={REGION_LINE.china}
            strokeWidth={2.5}
            className="roadmap-dash-animate"
            markerEnd={`url(#${markerPrefix}-c)`}
          />

          {/* Ascension → International (split to 3) */}
          <path
            d="M 588 220 C 660 200, 700 140, 748 120"
            fill="none"
            stroke="#F5C542"
            strokeWidth={2.5}
            className="roadmap-dash-animate"
            markerEnd={`url(#${markerPrefix}-i)`}
          />
          <path
            d="M 588 220 C 680 220, 700 220, 748 220"
            fill="none"
            stroke="#F5C542"
            strokeWidth={2.5}
            className="roadmap-dash-animate"
            markerEnd={`url(#${markerPrefix}-i)`}
          />
          <path
            d="M 588 220 C 660 240, 700 300, 748 320"
            fill="none"
            stroke="#F5C542"
            strokeWidth={2.5}
            className="roadmap-dash-animate"
            markerEnd={`url(#${markerPrefix}-i)`}
          />

          {/* China route into Pacific international emphasis */}
          <path
            d="M 318 340 C 500 380, 620 360, 748 320"
            fill="none"
            stroke={REGION_LINE.china}
            strokeWidth={1.5}
            opacity={0.35}
            className="roadmap-dash-animate"
          />

          {/* International → Masters */}
          <path
            d="M 818 120 C 880 160, 900 200, 948 220"
            fill="none"
            stroke="#FF4655"
            strokeWidth={2.5}
            className="roadmap-dash-animate"
            markerEnd={`url(#${markerPrefix}-r)`}
          />
          <path
            d="M 818 220 L 948 220"
            fill="none"
            stroke="#FF4655"
            strokeWidth={2.5}
            className="roadmap-dash-animate"
            markerEnd={`url(#${markerPrefix}-r)`}
          />
          <path
            d="M 818 320 C 880 280, 900 240, 948 220"
            fill="none"
            stroke="#FF4655"
            strokeWidth={2.5}
            className="roadmap-dash-animate"
            markerEnd={`url(#${markerPrefix}-r)`}
          />

          {/* Masters → Champions */}
          <path
            d="M 1018 220 C 1080 220, 1100 220, 1148 220"
            fill="none"
            stroke="#fde68a"
            strokeWidth={3}
            className="roadmap-dash-animate"
            markerEnd={`url(#${markerPrefix}-x)`}
          />

          <MetroNode
            id="game-changers"
            label="Game Changers"
            fill="#a855f7"
            labelFontSize={9}
            cx={90}
            cy={220}
            onSelect={setSelected}
            active={ACTIVE_STAGE === "game-changers"}
          />
          <MetroNode
            id="challengers-emea"
            label="CL · EMEA"
            fill="#3b82f6"
            cx={280}
            cy={100}
            onSelect={setSelected}
            active={ACTIVE_STAGE === "challengers-emea"}
          />
          <MetroNode
            id="challengers-americas"
            label="CL · AM"
            fill="#3b82f6"
            cx={280}
            cy={180}
            onSelect={setSelected}
            active={ACTIVE_STAGE === "challengers-americas"}
          />
          <MetroNode
            id="challengers-pacific"
            label="CL · PAC"
            fill="#3b82f6"
            cx={280}
            cy={260}
            onSelect={setSelected}
            active={ACTIVE_STAGE === "challengers-pacific"}
          />
          <MetroNode
            id="challengers-china"
            label="CL · CN"
            fill="#3b82f6"
            cx={280}
            cy={340}
            onSelect={setSelected}
            active={ACTIVE_STAGE === "challengers-china"}
          />
          <MetroNode
            id="ascension"
            label="Ascension"
            fill="#14b8a6"
            cx={550}
            cy={220}
            onSelect={setSelected}
            active={ACTIVE_STAGE === "ascension"}
          />
          <MetroNode
            id="international-emea"
            label="Intl · EMEA"
            fill="#F5C542"
            cx={780}
            cy={120}
            onSelect={setSelected}
            active={ACTIVE_STAGE === "international-emea"}
          />
          <MetroNode
            id="international-americas"
            label="Intl · AM"
            fill="#F5C542"
            cx={780}
            cy={220}
            onSelect={setSelected}
            active={ACTIVE_STAGE === "international-americas"}
          />
          <MetroNode
            id="international-pacific"
            label="Intl · PAC"
            fill="#F5C542"
            cx={780}
            cy={320}
            onSelect={setSelected}
            active={ACTIVE_STAGE === "international-pacific"}
          />
          <MetroNode
            id="masters"
            label="Masters"
            fill="#FF4655"
            cx={990}
            cy={220}
            onSelect={setSelected}
            active={ACTIVE_STAGE === "masters"}
          />
          <MetroNode
            id="champions"
            label="Champions"
            fill="#fde68a"
            cx={1180}
            cy={220}
            onSelect={setSelected}
            active={ACTIVE_STAGE === "champions"}
          />
        </svg>
      </div>

      <p className="text-xs text-text-secondary md:hidden">Swipe horizontally to see the full path.</p>

      <AnimatePresence>
        {selected && detail ? (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="mt-4 rounded-lg border border-white/10 bg-surface-light p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-base font-bold text-accent-gold">{detail.title}</h3>
                <p className="mt-1 text-xs text-text-secondary">
                  Reference summary — check official VCT announcements for live dates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="shrink-0 rounded-md border border-white/15 px-2 py-1 text-xs font-semibold text-text-secondary hover:border-accent-red hover:text-text-primary"
              >
                Close
              </button>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Teams</dt>
                <dd className="mt-0.5 text-text-primary">{detail.teams}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Schedule</dt>
                <dd className="mt-0.5 text-text-primary">{detail.schedule}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Format</dt>
                <dd className="mt-0.5 text-text-primary">{detail.format}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Prize pool</dt>
                <dd className="mt-0.5 text-text-primary">{detail.prizePool}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Qualified teams</dt>
                <dd className="mt-0.5 text-text-primary">{detail.qualified}</dd>
              </div>
            </dl>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mt-6 flex flex-wrap gap-4 border-t border-white/10 pt-4 text-xs text-text-secondary">
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-purple-500" /> Game Changers
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-blue-500" /> Challengers
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-teal-500" /> Ascension
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-accent-gold" /> International
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-accent-red" /> Masters
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-yellow-200" /> Champions
        </span>
      </div>
    </div>
  );
}
