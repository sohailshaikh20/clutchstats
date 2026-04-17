"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function CoachTrendChart({
  matchTrend,
}: {
  matchTrend: Array<{ kd: number; win: number; acs: number }>;
}) {
  const data = matchTrend.map((m, i) => ({
    match: i + 1,
    kd: Number(m.kd.toFixed(2)),
    acs: Math.round(m.acs),
    win: m.win * 100,
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-white/10 bg-surface text-sm text-text-secondary">
        Not enough matches for a trend chart yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-surface p-4 sm:p-5">
      <h3 className="font-heading text-lg font-bold text-text-primary">Last {data.length} matches</h3>
      <p className="mt-1 text-xs text-text-secondary">
        K/D and ACS (left axis) · Win (right axis, 0% or 100% per game)
      </p>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D3F52" opacity={0.6} />
            <XAxis
              dataKey="match"
              tick={{ fill: "#768691", fontSize: 11 }}
              label={{ value: "Match # (oldest → newest)", position: "bottom", offset: 0, fill: "#768691" }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: "#768691", fontSize: 11 }}
              label={{ value: "K/D · ACS", angle: -90, position: "insideLeft", fill: "#768691", fontSize: 11 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tick={{ fill: "#768691", fontSize: 11 }}
              label={{ value: "Win", angle: 90, position: "insideRight", fill: "#768691", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A2634",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#ECE8E1" }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="kd"
              name="K/D"
              stroke="#FF4655"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="acs"
              name="ACS"
              stroke="#1FAAED"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="win"
              name="Win (%)"
              stroke="#F5C542"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
