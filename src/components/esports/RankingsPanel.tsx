"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp, ListOrdered, Minus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  fetchVlrProxy,
  unwrapSegments,
} from "@/lib/esports/vlr-client-fetch";
import { FetchErrorPanel } from "@/components/ui/FetchErrorPanel";
import type { VLRRanking, VLRRegion } from "@/types/esports";
import { TeamLogo } from "./TeamLogo";

const SUB: { id: string; label: string; region: VLRRegion }[] = [
  { id: "emea", label: "EMEA", region: "eu" },
  { id: "americas", label: "Americas", region: "na" },
  { id: "pacific", label: "Pacific", region: "ap" },
  { id: "china", label: "China", region: "cn" },
];

type RankingExt = VLRRanking & {
  rank_change?: number;
  change?: number;
  movement?: number;
};

function changeFor(row: RankingExt): number | null {
  if (typeof row.rank_change === "number") return row.rank_change;
  if (typeof row.change === "number") return row.change;
  if (typeof row.movement === "number") return row.movement;
  return null;
}

function borderForRank(rank: number): string {
  if (rank === 1) return "border-l-[#D4AF37]";
  if (rank === 2) return "border-l-[#B8C4CE]";
  if (rank === 3) return "border-l-[#A87040]";
  return "border-l-transparent";
}

export function RankingsPanel() {
  const reduced = Boolean(useReducedMotion());
  const [sub, setSub] = useState(SUB[0]);
  const [rows, setRows] = useState<VLRRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  const load = useCallback(async (region: VLRRegion) => {
    const raw = await fetchVlrProxy<unknown>(`/rankings?region=${region}`);
    return unwrapSegments<VLRRanking>(raw);
  }, []);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setErr(false);
    try {
      let list = await load(sub.region);
      if (list.length === 0 && sub.region === "cn") {
        list = await load("world");
      }
      setRows(list);
    } catch {
      setErr(true);
    } finally {
      setLoading(false);
    }
  }, [load, sub.region]);

  useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {SUB.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSub(s)}
            className={`relative pb-2 font-heading text-xs font-semibold uppercase tracking-wide transition-colors ${
              sub.id === s.id ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {s.label}
            {sub.id === s.id ? (
              reduced ? (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-red" />
              ) : (
                <motion.div
                  layoutId="rankings-sub-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-red"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )
            ) : null}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 space-y-2">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg border border-surface-light bg-surface"
            />
          ))}
        </div>
      ) : err ? (
        <div className="mt-6">
          <FetchErrorPanel
            title="Rankings unavailable"
            message={`We couldn’t load standings for ${sub.label}. Try again — feeds can be flaky during busy event days.`}
            onRetry={fetchRows}
          />
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-surface/80 px-6 py-12 text-center">
          <ListOrdered className="mx-auto size-10 text-text-secondary" aria-hidden />
          <p className="mt-4 font-heading text-sm font-bold uppercase tracking-wide text-text-primary">
            No rankings for {sub.label}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            The API didn’t return rows for this region yet. Switch regions above or retry in a few
            minutes.
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-surface-light bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-heading uppercase tracking-wider text-text-secondary">
                <th className="px-3 py-3">#</th>
                <th className="px-3 py-3">Team</th>
                <th className="px-3 py-3 text-right">Rating</th>
                <th className="px-3 py-3 text-center">Form</th>
                <th className="px-3 py-3 text-right">Δ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const ext = row as RankingExt;
                const ch = changeFor(ext);
                return (
                  <tr
                    key={row.team.id}
                    className={`border-b border-white/5 border-l-4 ${borderForRank(row.rank)}`}
                  >
                    <td className="px-3 py-3 font-heading font-bold tabular-nums text-text-secondary">
                      {row.rank}
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={
                          row.team.url?.startsWith("http")
                            ? row.team.url
                            : `https://www.vlr.gg${row.team.url || "/"}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-w-0 items-center gap-2 hover:text-accent-red"
                      >
                        <TeamLogo name={row.team.name} logoUrl={row.team.logo} size={32} />
                        <span className="min-w-0 font-heading font-semibold text-text-primary">
                          {row.team.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-right font-heading text-base font-bold tabular-nums text-text-primary">
                      {row.points}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-center gap-1">
                        {(row.last_results ?? []).slice(0, 5).map((w, i) => (
                          <span
                            key={`${row.team.id}-${i}-${w}`}
                            className={`size-2.5 rounded-full ${
                              w === "W" ? "bg-win" : "bg-loss"
                            }`}
                            title={w}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-heading text-xs font-semibold">
                      {ch == null ? (
                        <span className="inline-flex items-center justify-end gap-0.5 text-text-secondary">
                          <Minus className="size-3" aria-hidden />—
                        </span>
                      ) : ch > 0 ? (
                        <span className="inline-flex items-center justify-end gap-0.5 text-win">
                          <ArrowUp className="size-3.5" aria-hidden />
                          {ch}
                        </span>
                      ) : ch < 0 ? (
                        <span className="inline-flex items-center justify-end gap-0.5 text-loss">
                          <ArrowDown className="size-3.5" aria-hidden />
                          {Math.abs(ch)}
                        </span>
                      ) : (
                        <span className="text-text-secondary">0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
