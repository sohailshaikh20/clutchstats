"use client";

import { ChevronDown, Users } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Fragment, useMemo, useState } from "react";

export interface AgentStats {
  agent: {
    name: string;
    iconUrl: string;
    portraitUrl: string;
    role: string;
    roleIconUrl?: string;
  };
  matches: number;
  winRate: number;
  kd: number;
  adr: number;
  acs: number;
  dda?: number;
  firstBloods?: number;
  playtimeHours: number;
  bestMap?: { name: string; winRate: number; iconUrl?: string };
  mapBreakdown?: Array<{ map: string; iconUrl?: string; matches: number; winRate: number; kd: number }>;
}

export interface AgentsTableProps {
  agents: AgentStats[];
}

type SortKey = "agent" | "matches" | "winRate" | "kd" | "adr" | "acs" | "dda" | "bestMap";
type SortState = { key: SortKey; dir: "asc" | "desc" };

const SORT_LABELS: Record<SortKey, string> = {
  agent: "Agent",
  matches: "Matches",
  winRate: "Win %",
  kd: "K/D",
  adr: "ADR",
  acs: "ACS",
  dda: "DDA",
  bestMap: "Best Map",
};

const DEFAULT_SORT: SortState = { key: "matches", dir: "desc" };

function winRateClass(v: number): string {
  if (v >= 60) return "text-[#00E5D1]";
  if (v >= 50) return "text-white";
  return "text-[#FF4655]";
}

function kdClass(v: number): string {
  if (v >= 1.05) return "text-[#00E5D1]";
  if (v >= 0.9) return "text-white";
  return "text-[#FF4655]";
}

function ddaClass(v: number): string {
  if (v > 0) return "text-[#00E5D1]";
  if (v < 0) return "text-[#FF4655]";
  return "text-white/60";
}

function formatDda(v: number | undefined): string {
  if (v === undefined || Number.isNaN(v)) return "—";
  const rounded = Math.round(v);
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

function compareAgents(a: AgentStats, b: AgentStats, key: SortKey, dir: "asc" | "desc"): number {
  const mul = dir === "asc" ? 1 : -1;
  const num = (x: number | undefined, y: number | undefined, fallback = 0) =>
    mul * ((x ?? fallback) - (y ?? fallback));
  const str = (x: string, y: string) => mul * x.localeCompare(y);

  switch (key) {
    case "agent":
      return str(a.agent.name, b.agent.name);
    case "matches":
      return num(a.matches, b.matches);
    case "winRate":
      return num(a.winRate, b.winRate);
    case "kd":
      return num(a.kd, b.kd);
    case "adr":
      return num(a.adr, b.adr);
    case "acs":
      return num(a.acs, b.acs);
    case "dda": {
      const av = a.dda;
      const bv = b.dda;
      if (av === undefined && bv === undefined) return 0;
      if (av === undefined) return dir === "desc" ? 1 : -1;
      if (bv === undefined) return dir === "desc" ? -1 : 1;
      return mul * (av - bv);
    }
    case "bestMap":
      return mul * ((a.bestMap?.winRate ?? -1) - (b.bestMap?.winRate ?? -1));
    default:
      return 0;
  }
}

function sortAgents(agents: AgentStats[], sort: SortState): AgentStats[] {
  const copy = [...agents];
  if (typeof copy.toSorted === "function") {
    return copy.toSorted((a, b) => compareAgents(a, b, sort.key, sort.dir));
  }
  return copy.sort((a, b) => compareAgents(a, b, sort.key, sort.dir));
}

export function AgentsTable({ agents }: AgentsTableProps) {
  const reduced = Boolean(useReducedMotion());
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = useMemo(() => sortAgents(agents, sort), [agents, sort]);

  const onHeaderClick = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "desc" ? "asc" : "desc" } : { key, dir: "desc" }
    );
  };

  const sortIndicator = (key: SortKey) =>
    sort.key === key ? (
      <span className="ml-0.5 text-accent-red" aria-hidden>
        {sort.dir === "desc" ? "▼" : "▲"}
      </span>
    ) : null;

  const sortedByLine = `Sorted by ${SORT_LABELS[sort.key]} ${sort.dir === "desc" ? "↓" : "↑"}`;

  if (!agents.length) {
    return (
      <section id="agents" className="scroll-mt-[120px] border-t border-white/5 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-screen-2xl min-h-[120px] flex-col items-center justify-center gap-3 bg-white/[0.02] px-4 py-10">
          <Users className="size-8 text-white/10" aria-hidden />
          <p className="text-center font-mono-display text-xs text-white/40">
            No agent data yet — play some matches to see your stats
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="agents" className="scroll-mt-[120px] border-t border-white/5 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="h-px w-6 shrink-0 bg-accent-red" aria-hidden />
            <h2 className="font-mono-display text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
              AGENT // PERFORMANCE
            </h2>
          </div>
          <p className="font-mono-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            {sortedByLine}
          </p>
        </div>

        <div className="mt-6 max-h-[min(70vh,calc(100vh-10rem))] overflow-auto rounded-none border border-white/[0.06] bg-[#0D0D10]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-white/[0.08] bg-[#0D0D10] shadow-[0_1px_0_rgba(0,0,0,0.4)]">
                <th className="h-10 px-4 text-left align-middle">
                  <button
                    type="button"
                    onClick={() => onHeaderClick("agent")}
                    className="font-mono-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 transition-colors hover:text-white/70"
                  >
                    Agent
                    {sortIndicator("agent")}
                  </button>
                </th>
                <th className="h-10 px-4 text-right align-middle">
                  <button
                    type="button"
                    onClick={() => onHeaderClick("matches")}
                    className="inline-flex w-full items-center justify-end font-mono-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 transition-colors hover:text-white/70"
                  >
                    Matches
                    {sortIndicator("matches")}
                  </button>
                </th>
                <th className="h-10 px-4 text-right align-middle">
                  <button
                    type="button"
                    onClick={() => onHeaderClick("winRate")}
                    className="inline-flex w-full items-center justify-end font-mono-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 transition-colors hover:text-white/70"
                  >
                    Win %
                    {sortIndicator("winRate")}
                  </button>
                </th>
                <th className="h-10 px-4 text-right align-middle">
                  <button
                    type="button"
                    onClick={() => onHeaderClick("kd")}
                    className="inline-flex w-full items-center justify-end font-mono-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 transition-colors hover:text-white/70"
                  >
                    K/D
                    {sortIndicator("kd")}
                  </button>
                </th>
                <th className="h-10 px-4 text-right align-middle">
                  <button
                    type="button"
                    onClick={() => onHeaderClick("adr")}
                    className="inline-flex w-full items-center justify-end font-mono-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 transition-colors hover:text-white/70"
                  >
                    ADR
                    {sortIndicator("adr")}
                  </button>
                </th>
                <th className="hidden h-10 px-4 text-right align-middle md:table-cell">
                  <button
                    type="button"
                    onClick={() => onHeaderClick("acs")}
                    className="inline-flex w-full items-center justify-end font-mono-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 transition-colors hover:text-white/70"
                  >
                    ACS
                    {sortIndicator("acs")}
                  </button>
                </th>
                <th className="hidden h-10 px-4 text-right align-middle md:table-cell">
                  <button
                    type="button"
                    onClick={() => onHeaderClick("dda")}
                    className="inline-flex w-full items-center justify-end font-mono-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 transition-colors hover:text-white/70"
                  >
                    DDA
                    {sortIndicator("dda")}
                  </button>
                </th>
                <th className="hidden h-10 px-4 text-left align-middle md:table-cell">
                  <button
                    type="button"
                    onClick={() => onHeaderClick("bestMap")}
                    className="font-mono-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 transition-colors hover:text-white/70"
                  >
                    Best Map
                    {sortIndicator("bestMap")}
                  </button>
                </th>
                <th className="h-10 w-10 px-2 align-middle" aria-label="Expand" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => {
                const open = expanded === row.agent.name;
                return (
                  <Fragment key={row.agent.name}>
                    <tr
                      onClick={() => setExpanded((id) => (id === row.agent.name ? null : row.agent.name))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setExpanded((id) => (id === row.agent.name ? null : row.agent.name));
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-expanded={open}
                      className="cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="py-3 pl-4 pr-2 align-middle">
                        <div className="flex items-start gap-3">
                          <div className="relative size-8 shrink-0 overflow-hidden ring-1 ring-white/10">
                            {row.agent.iconUrl ? (
                              <Image
                                src={row.agent.iconUrl}
                                alt=""
                                width={32}
                                height={32}
                                className="size-8 object-cover"
                                sizes="32px"
                              />
                            ) : (
                              <div className="size-8 bg-white/10" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-display text-sm font-medium leading-tight text-white">{row.agent.name}</p>
                            <div className="mt-1 flex items-center gap-1">
                              {row.agent.roleIconUrl ? (
                                <Image
                                  src={row.agent.roleIconUrl}
                                  alt=""
                                  width={12}
                                  height={12}
                                  className="size-3 shrink-0 object-contain opacity-90"
                                />
                              ) : null}
                              <span className="font-mono-display text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                                {row.agent.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right align-middle font-mono-display text-sm font-medium tabular-nums text-white">
                        {row.matches}
                      </td>
                      <td
                        className={`py-3 px-4 text-right align-middle font-mono-display text-sm font-medium tabular-nums ${winRateClass(row.winRate)}`}
                      >
                        {row.winRate.toFixed(0)}%
                      </td>
                      <td
                        className={`py-3 px-4 text-right align-middle font-mono-display text-sm font-medium tabular-nums ${kdClass(row.kd)}`}
                      >
                        {row.kd.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right align-middle font-mono-display text-sm font-medium tabular-nums text-white">
                        {row.adr.toFixed(1)}
                      </td>
                      <td className="hidden py-3 px-4 text-right align-middle font-mono-display text-sm font-medium tabular-nums text-white md:table-cell">
                        {Math.round(row.acs)}
                      </td>
                      <td
                        className={`hidden py-3 px-4 text-right align-middle font-mono-display text-sm font-medium tabular-nums md:table-cell ${row.dda === undefined ? "text-white/40" : ddaClass(row.dda)}`}
                      >
                        {formatDda(row.dda)}
                      </td>
                      <td className="hidden py-3 px-4 align-middle md:table-cell">
                        {row.bestMap ? (
                          <div className="flex min-w-0 items-center gap-2">
                            {row.bestMap.iconUrl ? (
                              <Image
                                src={row.bestMap.iconUrl}
                                alt=""
                                width={20}
                                height={20}
                                className="size-5 shrink-0 object-cover"
                                sizes="20px"
                              />
                            ) : null}
                            <div className="min-w-0">
                              <p className="truncate font-display text-[13px] font-medium text-white">{row.bestMap.name}</p>
                              <p
                                className={`font-mono-display text-[11px] font-medium tabular-nums ${row.bestMap.winRate >= 60 ? "text-[#00E5D1]" : "text-white/60"}`}
                              >
                                {row.bestMap.winRate.toFixed(0)}%
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="font-mono-display text-xs text-white/35">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 align-middle text-white/40">
                        <motion.span
                          animate={{ rotate: open ? 180 : 0 }}
                          transition={{ duration: reduced ? 0 : 0.22 }}
                          className="inline-flex"
                        >
                          <ChevronDown className="size-4" aria-hidden />
                        </motion.span>
                      </td>
                    </tr>
                    <AnimatePresence initial={false}>
                      {open ? (
                        <motion.tr
                          key={`${row.agent.name}-detail`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: reduced ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] as const }}
                          className="overflow-hidden border-b border-white/[0.04]"
                        >
                          <td colSpan={9} className="p-0 align-top">
                            <div className="bg-[#0A0A0C] px-6 py-4 md:px-8">
                              <p className="font-mono-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                                MAP BREAKDOWN
                              </p>
                              {row.mapBreakdown && row.mapBreakdown.length > 0 ? (
                                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                                  {row.mapBreakdown.map((m) => (
                                    <div
                                      key={m.map}
                                      className="border border-white/[0.06] bg-white/[0.02] p-3"
                                    >
                                      <div className="flex items-start gap-2">
                                        {m.iconUrl ? (
                                          <Image
                                            src={m.iconUrl}
                                            alt=""
                                            width={20}
                                            height={20}
                                            className="size-5 shrink-0 object-cover"
                                          />
                                        ) : null}
                                        <p className="min-w-0 truncate font-display text-[13px] font-medium text-white">
                                          {m.map}
                                        </p>
                                      </div>
                                      <p className="mt-1 font-mono-display text-[10px] text-white/40">
                                        {m.matches} matches
                                      </p>
                                      <p
                                        className={`mt-2 font-mono-display text-lg font-bold tabular-nums ${winRateClass(m.winRate)}`}
                                      >
                                        {m.winRate.toFixed(0)}%
                                      </p>
                                      <p className="mt-1 font-mono-display text-[10px] text-white/60">
                                        K/D {m.kd.toFixed(2)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="mt-4 font-mono-display text-[11px] text-white/30">
                                  No map breakdown available yet — data coming soon
                                </p>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ) : null}
                    </AnimatePresence>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
