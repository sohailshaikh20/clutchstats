"use client";

import { animate } from "framer-motion";
import { Crosshair } from "lucide-react";
import { useEffect, useState } from "react";

function useCountUp(target: number, formatter: (n: number) => string) {
  const [v, setV] = useState(0);

  useEffect(() => {
    setV(0);
    const controls = animate(0, target, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: setV,
    });
    return () => controls.stop();
  }, [target]);

  return formatter(v);
}

function WinRateRing({ pct }: { pct: number }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  const [dash, setDash] = useState(c);
  const [label, setLabel] = useState(0);

  useEffect(() => {
    const targetOffset = c * (1 - clamped / 100);
    setDash(c);
    setLabel(0);
    const a1 = animate(c, targetOffset, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: setDash,
    });
    const a2 = animate(0, clamped, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: setLabel,
    });
    return () => {
      a1.stop();
      a2.stop();
    };
  }, [pct, c, clamped]);

  return (
    <div className="relative mx-auto size-[104px]">
      <svg className="-rotate-90" viewBox="0 0 100 100" width={104} height={104}>
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-surface-lighter"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={dash}
          strokeLinecap="round"
          className="text-accent-red"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-heading text-2xl font-bold text-text-primary">
        {Math.round(label)}%
      </span>
    </div>
  );
}

export function StatsOverview({
  kdRatio,
  winRate,
  headshotPct,
  avgCombatScore,
}: {
  kdRatio: number;
  winRate: number;
  headshotPct: number;
  avgCombatScore: number;
}) {
  const kdSafe = Number.isFinite(kdRatio) ? kdRatio : 0;
  const wrSafe = Number.isFinite(winRate) ? winRate : 0;
  const hsSafe = Number.isFinite(headshotPct) ? headshotPct : 0;
  const acsSafe = Number.isFinite(avgCombatScore) ? avgCombatScore : 0;

  const kdDisplay = useCountUp(kdSafe, (n) => n.toFixed(2));
  const hsDisplay = useCountUp(hsSafe, (n) => `${n.toFixed(1)}%`);
  const acsDisplay = useCountUp(acsSafe, (n) => Math.round(n).toString());

  const kdColor =
    kdSafe > 1 ? "text-win" : kdSafe < 1 ? "text-loss" : "text-text-secondary";

  const cards = [
    {
      key: "kd",
      label: "KD ratio",
      node: <span className={`font-heading text-3xl font-bold ${kdColor}`}>{kdDisplay}</span>,
    },
    {
      key: "wr",
      label: "Win rate",
      node: <WinRateRing pct={wrSafe} />,
    },
    {
      key: "hs",
      label: "Headshot %",
      node: (
        <div className="flex items-center justify-center gap-2">
          <Crosshair className="size-7 text-text-secondary" aria-hidden />
          <span className="font-heading text-3xl font-bold text-text-primary">
            {hsDisplay}
          </span>
        </div>
      ),
    },
    {
      key: "acs",
      label: "Avg combat score",
      node: (
        <span className="font-heading text-3xl font-bold text-text-primary">
          {acsDisplay}
        </span>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.key}
          className="rounded-xl border border-surface-light bg-surface p-4 text-center transition-[border-color,box-shadow] hover:border-white/15 hover:shadow-glow-red/20"
        >
          <div className="min-h-[3.5rem]">{c.node}</div>
          <p className="mt-3 font-body text-xs font-medium uppercase tracking-wider text-text-secondary">
            {c.label}
          </p>
        </div>
      ))}
    </div>
  );
}
