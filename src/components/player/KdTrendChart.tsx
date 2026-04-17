"use client";

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
import type { MatchRow } from "@/lib/player/build-profile-payload";

interface ChartPoint {
  index: number;
  kd: number;
  map: string;
  result: string;
}

function buildChartData(matches: MatchRow[], limit = 20): ChartPoint[] {
  // matches are already sorted newest-first; take the N most recent, then reverse for chart
  return matches
    .slice(0, limit)
    .reverse()
    .map((m, i) => ({
      index: i + 1,
      kd: parseFloat(m.kd.toFixed(2)),
      map: m.mapName,
      result: m.won ? "W" : "L",
    }));
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-surface px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-text-primary">{d.map}</p>
      <p className="mt-0.5 text-text-secondary">
        KD{" "}
        <span
          className={
            d.kd > 1 ? "text-win" : d.kd < 1 ? "text-loss" : "text-text-secondary"
          }
        >
          {d.kd.toFixed(2)}
        </span>
        {" · "}
        <span className={d.result === "W" ? "text-win" : "text-loss"}>{d.result}</span>
      </p>
    </div>
  );
}

export function KdTrendChart({ matches }: { matches: MatchRow[] }) {
  // Only include matches with meaningful KD (exclude deathmatch by checking won field makes no sense there)
  const relevant = matches.filter((m) => m.filterQueue !== "other");
  if (relevant.length < 3) return null;

  const data = buildChartData(relevant, 20);
  const avg = data.reduce((s, d) => s + d.kd, 0) / data.length;

  return (
    <section className="border-t border-white/5 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <h2 className="mb-6 font-body text-xs font-semibold uppercase tracking-widest text-text-secondary">
          KD trend (last {data.length} matches)
        </h2>
        <div className="h-48 w-full rounded-xl border border-white/5 bg-surface p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="index"
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
              />
              <ReferenceLine
                y={1}
                stroke="rgba(255,255,255,0.15)"
                strokeDasharray="4 4"
              />
              <ReferenceLine
                y={parseFloat(avg.toFixed(2))}
                stroke="rgba(255,70,85,0.35)"
                strokeDasharray="4 4"
                label={{
                  value: `avg ${avg.toFixed(2)}`,
                  position: "insideTopRight",
                  fill: "rgba(255,70,85,0.7)",
                  fontSize: 10,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="kd"
                stroke="#FF4655"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props as { cx: number; cy: number; payload: ChartPoint };
                  const color = payload.kd > 1 ? "#4AE3A7" : payload.kd < 1 ? "#FF4655" : "#768691";
                  return (
                    <circle
                      key={`dot-${payload.index}`}
                      cx={cx}
                      cy={cy}
                      r={3}
                      fill={color}
                      stroke="transparent"
                    />
                  );
                }}
                activeDot={{ r: 5, fill: "#FF4655", stroke: "transparent" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
