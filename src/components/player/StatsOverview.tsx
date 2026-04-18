"use client";

import { animate, motion } from "framer-motion";
import { Crosshair } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
          strokeWidth="4"
          className="text-surface-light"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={c}
          strokeDashoffset={dash}
          strokeLinecap="round"
          className="text-win"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-heading text-3xl font-bold tabular-nums text-text-primary">
        {Math.round(label)}%
      </span>
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function StatsOverview({
  kdRatio,
  winRate,
  headshotPct,
  avgCombatScore,
  kdHistory,
}: {
  kdRatio: number;
  winRate: number;
  headshotPct: number;
  avgCombatScore: number;
  /** Oldest → newest KD per match (last ~15) for sparkline */
  kdHistory?: number[];
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

  const kdChartData = useMemo(
    () => (kdHistory ?? []).map((kd, i) => ({ i: i + 1, kd })),
    [kdHistory]
  );

  const cards = [
    {
      key: "kd",
      label: "KD ratio",
      node: (
        <div className="flex w-full flex-col items-center gap-2">
          {kdChartData.length > 1 ? (
            <div className="h-16 w-full max-w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kdChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="i" hide />
                  <YAxis domain={["auto", "auto"]} hide />
                  <Tooltip
                    contentStyle={{ background: "#1A2634", border: "1px solid #243447", borderRadius: 8 }}
                    formatter={(v) => [`${Number(v).toFixed(2)}`, "KD"]}
                    labelFormatter={(l) => `Match ${l}`}
                  />
                  <ReferenceLine
                    y={1}
                    stroke="#768691"
                    strokeDasharray="4 4"
                    label={{ value: "Avg", fill: "#768691", fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="kd"
                    stroke="#4AE3A7"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={kdChartData.length < 40}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : null}
          <span className={`font-heading text-4xl font-bold tabular-nums ${kdColor}`}>{kdDisplay}</span>
        </div>
      ),
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
          <Crosshair className="size-8 text-text-secondary" aria-hidden />
          <span className="font-heading text-4xl font-bold tabular-nums text-text-primary">
            {hsDisplay}
          </span>
        </div>
      ),
    },
    {
      key: "acs",
      label: "Avg combat score",
      node: (
        <span className="font-heading text-4xl font-bold tabular-nums text-text-primary">
          {acsDisplay}
        </span>
      ),
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((c, i) => (
        <motion.div
          key={c.key}
          custom={i}
          variants={cardVariants}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="rounded-xl bg-gradient-to-br from-surface-light/70 via-surface-light/20 to-transparent p-px transition-shadow hover:shadow-lg hover:shadow-black/20"
        >
          <div className="flex h-full flex-col rounded-[11px] bg-surface px-4 py-5 text-center transition-[border-color] hover:border-white/10">
            <div className="flex min-h-[4.5rem] flex-col items-center justify-center">{c.node}</div>
            <p className="mt-3 font-body text-xs font-medium uppercase tracking-wider text-text-secondary">
              {c.label}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
