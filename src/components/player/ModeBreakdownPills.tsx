"use client";

import type { ModeBreakdown } from "@/lib/stats/calculator";

const PRETTY: Record<string, string> = {
  competitive: "Competitive",
  unrated: "Unrated",
  deathmatch: "Deathmatch",
  "spike rush": "Spike Rush",
  escalation: "Escalation",
  "swift play": "Swiftplay",
  "team deathmatch": "Team DM",
};

function labelMode(key: string): string {
  return PRETTY[key] ?? key.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ModeBreakdownPills({ modes }: { modes: ModeBreakdown[] }) {
  if (!modes.length) return null;

  const top = [...modes].sort((a, b) => b.games - a.games).slice(0, 6);

  return (
    <div className="mx-auto max-w-screen-2xl px-4 pb-2 sm:px-6 lg:px-8">
      <p className="font-body text-xs font-medium uppercase tracking-wider text-text-secondary">
        Mode breakdown
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {top.map((m) => (
          <span
            key={m.mode}
            className="inline-flex items-center rounded-full border border-white/10 bg-background/40 px-3 py-1.5 font-body text-xs text-text-primary"
          >
            <span className="font-semibold text-text-secondary">{labelMode(m.mode)}:</span>
            <span className="ml-1 font-heading tabular-nums text-text-primary">{m.games} games</span>
          </span>
        ))}
      </div>
    </div>
  );
}
