"use client";

import type { Match } from "@/types/profile-match-card";

export function MatchDetailPanel({ match }: { match: Match }) {
  const rounds = match.roundByRound;
  const enemies = match.topEnemies?.slice(0, 3) ?? [];

  return (
    <div className="border-t border-white/[0.06] bg-[#0A0A0C] p-6">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
        <div>
          <h3 className="font-mono-display text-[11px] font-bold uppercase tracking-[0.25em] text-white/50">
            Round by round
          </h3>
          {rounds && rounds.length > 0 ? (
            <div className="mt-3 flex max-w-full flex-wrap gap-1 overflow-x-auto pb-1">
              {rounds.map((r) => (
                <div
                  key={r.round}
                  className={`flex h-10 w-[24px] shrink-0 flex-col items-center justify-center rounded-none border border-white/[0.06] ${
                    r.result === "W" ? "bg-[#00E5D1]/15" : "bg-[#FF4655]/15"
                  }`}
                >
                  <span className="font-mono-display text-[12px] font-bold leading-none text-white tabular-nums">
                    {r.kills}
                  </span>
                  <span className="font-mono-display text-[8px] leading-none text-white/45 tabular-nums">
                    {r.deaths}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 font-mono-display text-[10px] text-white/30">Round detail loading...</p>
          )}
        </div>

        <div>
          <h3 className="font-mono-display text-[11px] font-bold uppercase tracking-[0.25em] text-white/50">
            Top enemies
          </h3>
          {enemies.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {enemies.map((e) => {
                const ahead = e.killsAgainst > e.deathsFrom;
                return (
                  <li key={`${e.name}#${e.tag}`} className="flex items-center justify-between gap-3">
                    <span className="truncate font-mono-display text-[12px] text-white/80">
                      {e.name}#{e.tag}
                    </span>
                    <span
                      className={`shrink-0 font-mono-display text-[11px] font-bold tabular-nums ${
                        ahead ? "text-[#00E5D1]" : "text-[#FF4655]"
                      }`}
                    >
                      {e.killsAgainst}K — {e.deathsFrom}D
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 font-mono-display text-[10px] text-white/30">Enemy breakdown loading...</p>
          )}
        </div>
      </div>

      <p className="mt-8 font-mono-display text-[10px] text-white/25">Weapon breakdown not available.</p>

      <div className="mt-4 flex justify-center border-t border-white/[0.04] pt-5">
        <button
          type="button"
          className="font-mono-display text-[11px] font-bold uppercase tracking-wide text-white/40 transition-colors hover:text-white/70"
          disabled
          aria-disabled
        >
          View full match →
        </button>
      </div>
    </div>
  );
}
