"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { AgentStatRow } from "@/lib/player/build-profile-payload";

export function AgentBreakdown({ agents }: { agents: AgentStatRow[] }) {
  return (
    <section className="border-t border-white/5 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary">
          AGENT PERFORMANCE
        </h2>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06 } },
          }}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {agents.map((a) => (
            <motion.div
              key={a.agentName}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
              }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-xl border border-surface-light bg-surface transition-[border-color,box-shadow] hover:border-accent-red/40 hover:shadow-glow-red/25"
            >
              {a.fullPortraitV2 ? (
                <div
                  className="absolute bottom-0 left-0 top-0 w-[45%] max-w-[140px] bg-cover bg-top opacity-90 transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `linear-gradient(90deg, transparent 0%, #1A2634 72%, #1A2634 100%), url(${a.fullPortraitV2})`,
                  }}
                />
              ) : null}
              <div className="relative z-[1] flex min-h-[120px] flex-col justify-center gap-2 py-4 pl-[42%] pr-4 sm:pl-[46%]">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-base font-bold text-text-primary">
                    {a.agentName}
                  </h3>
                  {a.roleIcon ? (
                    <Image
                      src={a.roleIcon}
                      alt=""
                      width={22}
                      height={22}
                      className="size-5 shrink-0 object-contain opacity-80"
                    />
                  ) : null}
                </div>
                <p className="font-body text-xs text-text-secondary">
                  {a.games} games
                </p>
                <p className="font-heading text-sm font-semibold">
                  <span
                    className={
                      a.winRate >= 50 ? "text-win" : a.winRate < 50 ? "text-loss" : "text-text-secondary"
                    }
                  >
                    {a.winRate.toFixed(0)}% WR
                  </span>
                  <span className="text-text-secondary"> · </span>
                  <span className="text-text-primary">{a.kd.toFixed(2)} KD</span>
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        {agents.length === 0 ? (
          <p className="mt-8 text-center text-sm text-text-secondary">
            Not enough agent data yet — play more Competitive or Unrated.
          </p>
        ) : null}
      </div>
    </section>
  );
}
