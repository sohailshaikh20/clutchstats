"use client";

import { RANK_KEYS, rankLabel } from "@/lib/lfg/ranks";
import Image from "next/image";

export type AgentChip = { uuid: string; displayName: string; displayIcon: string };

const REGIONS = [
  { value: "", label: "All regions" },
  { value: "eu", label: "EU" },
  { value: "na", label: "NA" },
  { value: "ap", label: "AP" },
  { value: "kr", label: "KR" },
  { value: "br", label: "BR" },
  { value: "latam", label: "LATAM" },
] as const;

const PLAYSTYLES = [
  { value: "any", label: "Any" },
  { value: "aggressive", label: "Aggressive" },
  { value: "support", label: "Support" },
  { value: "flex", label: "Flex" },
] as const;

export function LfgFilterBar({
  region,
  setRegion,
  rankMin,
  setRankMin,
  rankMax,
  setRankMax,
  agentFilter,
  setAgentFilter,
  playstyle,
  setPlaystyle,
  agents,
  onCreateClick,
}: {
  region: string;
  setRegion: (v: string) => void;
  rankMin: string;
  setRankMin: (v: string) => void;
  rankMax: string;
  setRankMax: (v: string) => void;
  agentFilter: string[];
  setAgentFilter: (v: string[]) => void;
  playstyle: string;
  setPlaystyle: (v: string) => void;
  agents: AgentChip[];
  onCreateClick: () => void;
}) {
  const toggleAgent = (name: string) => {
    const n = name.toLowerCase();
    if (agentFilter.includes(n)) {
      setAgentFilter(agentFilter.filter((x) => x !== n));
    } else {
      setAgentFilter([...agentFilter, n]);
    }
  };

  return (
    <div className="border-b border-white/10 bg-background/95 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Region
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="min-w-[140px] rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent-red focus:outline-none"
            >
              {REGIONS.map((r) => (
                <option key={r.value || "all"} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Rank min
            <select
              value={rankMin}
              onChange={(e) => setRankMin(e.target.value)}
              className="min-w-[130px] rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent-red focus:outline-none"
            >
              {RANK_KEYS.map((k) => (
                <option key={k} value={k}>
                  {rankLabel(k)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Rank max
            <select
              value={rankMax}
              onChange={(e) => setRankMax(e.target.value)}
              className="min-w-[130px] rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent-red focus:outline-none"
            >
              {RANK_KEYS.map((k) => (
                <option key={k} value={k}>
                  {rankLabel(k)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Playstyle
            <select
              value={playstyle}
              onChange={(e) => setPlaystyle(e.target.value)}
              className="min-w-[140px] rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent-red focus:outline-none"
            >
              {PLAYSTYLES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={onCreateClick}
            className="ml-auto hidden rounded-full bg-accent-red px-5 py-2.5 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-glow-red transition hover:bg-accent-red/90 sm:inline-flex"
          >
            Create post
          </button>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Agent preference
          </p>
          <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
            {agents.map((a) => {
              const on = agentFilter.includes(a.displayName.toLowerCase());
              return (
                <button
                  key={a.uuid}
                  type="button"
                  onClick={() => toggleAgent(a.displayName)}
                  title={a.displayName}
                  className={`flex w-14 flex-col items-center gap-0.5 rounded-lg border-2 py-1 transition ${
                    on ? "border-accent-red bg-surface-light" : "border-transparent bg-surface hover:border-white/20"
                  }`}
                >
                  <Image src={a.displayIcon} alt="" width={28} height={28} className="size-7 object-contain" />
                  <span className="max-w-full truncate px-0.5 text-center font-body text-[9px] leading-none text-text-secondary">
                    {a.displayName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
