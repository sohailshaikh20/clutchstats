"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from "recharts";
import type { MapStatRow } from "@/lib/player/build-profile-payload";

type Row = {
  name: string;
  wr: number;
  games: number;
  fill: string;
  icon: string;
};

const sectionTitle = "Map performance";

export function MapPerformance({ maps }: { maps: MapStatRow[] }) {
  const data: Row[] = maps.map((m) => ({
    name: m.mapName,
    wr: Math.round(m.winRate * 10) / 10,
    games: m.games,
    fill: m.winRate >= 50 ? "#4AE3A7" : "#FF4655",
    icon: m.listViewIcon,
  }));

  if (data.length === 0) {
    return (
      <section className="border-t border-white/5 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <h2 className="font-body text-xs font-semibold uppercase tracking-widest text-text-secondary">
            {sectionTitle}
          </h2>
          <p className="mt-4 text-center font-body text-sm text-text-secondary">
            No map data from your recent matches yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-white/5 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-body text-xs font-semibold uppercase tracking-widest text-text-secondary"
        >
          {sectionTitle}
        </motion.h2>
        <div className="mt-6 flex flex-col gap-4">
          {data.map((row, i) => (
            <motion.div
              key={row.name}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              whileHover={{ x: 2, transition: { duration: 0.2 } }}
              className="flex flex-col gap-2 rounded-xl border border-white/5 bg-surface/40 p-2 transition-colors hover:border-white/10 sm:flex-row sm:items-center sm:gap-4 sm:p-3"
            >
              <div className="flex w-full shrink-0 items-center gap-2 sm:w-48">
                {row.icon ? (
                  <Image
                    src={row.icon}
                    alt=""
                    width={28}
                    height={28}
                    className="size-7 object-contain"
                  />
                ) : (
                  <div className="size-7 rounded bg-surface-lighter" />
                )}
                <span className="truncate font-body text-sm font-semibold text-text-primary">
                  {row.name}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="h-10 min-w-0 flex-1 rounded-lg border border-surface-light bg-surface px-1 py-1 transition-colors hover:border-white/10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[{ ...row }]}
                      margin={{ top: 2, right: 4, left: 2, bottom: 2 }}
                    >
                      <XAxis type="number" domain={[0, 100]} hide />
                      <Bar dataKey="wr" radius={[0, 6, 6, 0]} barSize={20} minPointSize={2}>
                        <Cell fill={row.fill} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <span className="shrink-0 font-heading text-xs font-semibold tabular-nums text-text-secondary">
                  {row.games} games
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
