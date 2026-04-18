"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ListOrdered } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FetchErrorPanel } from "@/components/ui/FetchErrorPanel";
import type { VLRRanking, VLRRegion } from "@/types/esports";
import { TeamLogo } from "./TeamLogo";
import { TEAM_LOGOS } from "@/lib/constants/team-logos";

const SUB: { id: string; label: string; region: VLRRegion }[] = [
  { id: "americas", label: "Americas", region: "na" },
  { id: "emea", label: "EMEA", region: "eu" },
  { id: "pacific", label: "Pacific", region: "ap" },
  { id: "china", label: "China", region: "cn" },
];

function winStreakFromEnd(form: Array<"W" | "L"> | undefined): number {
  if (!form?.length) return 0;
  let c = 0;
  for (let i = form.length - 1; i >= 0; i--) {
    if (form[i] === "W") c++;
    else break;
  }
  return c;
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

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setErr(false);
    try {
      const res = await fetch(`/api/esports/rankings?region=${sub.region}`);
      if (!res.ok) throw new Error("bad status");
      const json = (await res.json()) as { rows?: VLRRanking[] };
      setRows(json.rows ?? []);
    } catch {
      setErr(true);
    } finally {
      setLoading(false);
    }
  }, [sub.region]);

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
            No data for {sub.label}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            No {sub.label} matches found in the recent results feed. Try another region or check back after the next event day.
          </p>
        </div>
      ) : (
        <div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-surface-light bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-heading uppercase tracking-wider text-text-secondary">
                <th className="px-3 py-3">Pos</th>
                <th className="px-3 py-3">Team</th>
                <th className="px-3 py-3 text-right">Rating</th>
                <th className="px-3 py-3 text-right">Record</th>
                <th className="px-3 py-3 text-right">Streak</th>
                <th className="px-3 py-3 text-center">Form</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const streak = winStreakFromEnd(row.last_results);
                const rec = row.record;
                const recStr =
                  rec && typeof rec.wins === "number"
                    ? `${rec.wins}-${rec.losses ?? 0}`
                    : "—";
                return (
                  <tr
                    key={row.team.id}
                    className={`border-b border-white/5 border-l-4 transition-colors hover:bg-surface-light/60 ${borderForRank(row.rank)}`}
                  >
                    <td className="px-3 py-3 font-heading text-xl font-bold tabular-nums text-text-secondary">
                      {row.rank}
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/esports/team/${row.team.id}`}
                        className="flex min-w-0 items-center gap-2 transition hover:opacity-90"
                      >
                        <TeamLogo
                          name={row.team.name}
                          logoUrl={TEAM_LOGOS[row.team.name] ?? row.team.logo}
                          size={32}
                        />
                        <span className="min-w-0 font-heading font-semibold text-text-primary">
                          {row.team.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-right font-heading text-base font-bold tabular-nums text-text-primary">
                      {row.points}
                    </td>
                    <td className="px-3 py-3 text-right font-heading text-sm font-semibold tabular-nums text-text-primary">
                      {recStr}
                    </td>
                    <td className="px-3 py-3 text-right font-heading text-sm font-bold tabular-nums text-win">
                      {streak > 0 ? `W${streak}` : "—"}
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-right font-body text-[10px] text-text-secondary/50">
          Standings computed from recent match results · Updated every 5 min
        </p>
        </div>
      )}
    </div>
  );
}
