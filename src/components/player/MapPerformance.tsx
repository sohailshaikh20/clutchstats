"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { MapStatRow } from "@/lib/player/build-profile-payload";

type Row = {
  name: string;
  wr: number;
  games: number;
  fill: string;
  icon: string;
  endLabel: string;
};

const sectionTitle = "Map performance";

function MapTick(props: {
  x?: number | string;
  y?: number | string;
  payload?: { value: string };
  rows: Row[];
}) {
  const { rows, payload } = props;
  const x = typeof props.x === "number" ? props.x : Number(props.x) || 0;
  const y = typeof props.y === "number" ? props.y : Number(props.y) || 0;
  const name = payload?.value ?? "";
  const row = rows.find((r) => r.name === name);
  return (
    <g transform={`translate(${x - 2},${y})`}>
      {row?.icon ? (
        <image
          href={row.icon}
          width={24}
          height={24}
          x={-118}
          y={-12}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <rect x={-118} y={-12} width={24} height={24} rx={4} fill="#243447" />
      )}
      <text
        x={-88}
        y={4}
        fill="#ECE8E1"
        fontSize={12}
        className="font-heading"
        style={{ fontFamily: "var(--font-heading), sans-serif" }}
      >
        {name.length > 14 ? `${name.slice(0, 13)}…` : name}
      </text>
    </g>
  );
}

export function MapPerformance({ maps }: { maps: MapStatRow[] }) {
  const reduced = Boolean(useReducedMotion());
  const data: Row[] = maps.map((m) => {
    const wr = Math.round(m.winRate * 10) / 10;
    return {
      name: m.mapName,
      wr,
      games: m.games,
      fill: m.winRate >= 50 ? "#4AE3A7" : "#FF4655",
      icon: m.listViewIcon,
      endLabel: `${Math.round(m.winRate)}% (${m.games} games)`,
    };
  });

  if (data.length === 0) {
    return (
      <section className="border-t border-white/5 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <h2 className="font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary">
            {sectionTitle}
          </h2>
          <p className="mt-4 text-center font-body text-sm text-text-secondary">
            No map data from your recent matches yet.
          </p>
        </div>
      </section>
    );
  }

  const chartH = Math.max(220, data.length * 44 + 32);

  return (
    <section className="border-t border-white/5 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <motion.h2
          initial={reduced ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary"
        >
          {sectionTitle}
        </motion.h2>
        <div className="mt-6 rounded-xl border border-white/5 bg-surface p-4 sm:p-5">
          <ResponsiveContainer width="100%" height={chartH}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ left: 4, right: 12, top: 8, bottom: 8 }}
              barCategoryGap={10}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="name"
                width={124}
                tickLine={false}
                axisLine={false}
                tick={(p) => (
                  <MapTick
                    x={p.x}
                    y={p.y}
                    payload={p.payload as { value: string } | undefined}
                    rows={data}
                  />
                )}
              />
              <Bar
                dataKey="wr"
                barSize={22}
                radius={[0, 6, 6, 0]}
                isAnimationActive={!reduced}
                animationDuration={900}
                animationEasing="ease-out"
              >
                {data.map((e) => (
                  <Cell key={e.name} fill={e.fill} />
                ))}
                <LabelList
                  dataKey="endLabel"
                  position="right"
                  fill="#768691"
                  fontSize={11}
                  style={{ fontFamily: "var(--font-heading), sans-serif" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
