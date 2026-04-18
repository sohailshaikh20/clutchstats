"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TrendPoint = { i: number; kd: number; acs: number | null };

export function ProfileKdTrendChart({ data }: { data: TrendPoint[] }) {
  const reduced = Boolean(useReducedMotion());
  const [showAcs, setShowAcs] = useState(false);

  const hasAcs = useMemo(
    () => data.some((d) => d.acs != null && d.acs > 0),
    [data]
  );

  if (data.length < 2) return null;

  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-white/5 bg-surface p-4"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary">
          KD trend
        </h3>
        {hasAcs ? (
          <button
            type="button"
            onClick={() => setShowAcs((v) => !v)}
            className="rounded-full border border-white/10 bg-background/40 px-3 py-1.5 font-body text-[11px] font-semibold uppercase tracking-wide text-text-secondary transition-colors hover:border-accent-red/30 hover:text-text-primary min-h-[44px] sm:min-h-0"
          >
            {showAcs ? "Hide ACS" : "Show ACS"}
          </button>
        ) : null}
      </div>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 6" stroke="#243447" vertical={false} />
            <XAxis dataKey="i" tick={{ fill: "#768691", fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis
              yAxisId="kd"
              domain={["auto", "auto"]}
              tick={{ fill: "#768691", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            {showAcs && hasAcs ? (
              <YAxis
                yAxisId="acs"
                orientation="right"
                domain={["auto", "auto"]}
                tick={{ fill: "#768691", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
            ) : null}
            <Tooltip
              cursor={{ stroke: "#243447", strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const kdEntry = payload.find((p) => p.dataKey === "kd");
                const acsEntry = payload.find((p) => p.dataKey === "acs");
                const kdVal = kdEntry?.value != null ? Number(kdEntry.value) : null;
                const acsVal = acsEntry?.value != null ? Number(acsEntry.value) : null;
                return (
                  <div className="rounded-lg border border-surface-light bg-surface px-3 py-2 text-xs shadow-lg">
                    <p className="font-heading font-semibold text-text-primary">Match {label}</p>
                    {kdVal != null && Number.isFinite(kdVal) ? (
                      <p className="mt-1 font-heading tabular-nums text-win">KD {kdVal.toFixed(2)}</p>
                    ) : null}
                    {acsVal != null && Number.isFinite(acsVal) && acsVal > 0 ? (
                      <p className="mt-0.5 font-heading tabular-nums text-accent-blue/90">
                        ACS {Math.round(acsVal)}
                      </p>
                    ) : null}
                  </div>
                );
              }}
            />
            <ReferenceLine
              yAxisId="kd"
              y={1}
              stroke="#768691"
              strokeDasharray="5 5"
              label={{
                value: "Average",
                position: "insideTopRight",
                fill: "#768691",
                fontSize: 10,
              }}
            />
            <Line
              yAxisId="kd"
              type="monotone"
              dataKey="kd"
              name="kd"
              stroke="#4AE3A7"
              strokeWidth={2.5}
              dot={{ r: 6, fill: "#4AE3A7", strokeWidth: 0 }}
              activeDot={{ r: 7 }}
              isAnimationActive={!reduced}
              animationDuration={800}
            />
            {showAcs && hasAcs ? (
              <Line
                yAxisId="acs"
                type="monotone"
                dataKey="acs"
                name="acs"
                stroke="#1FAAED"
                strokeOpacity={0.55}
                strokeWidth={2}
                dot={{ r: 4, fill: "#1FAAED", strokeWidth: 0 }}
                connectNulls={false}
                isAnimationActive={!reduced}
                animationDuration={800}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}
