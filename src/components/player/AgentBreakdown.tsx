"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import type { AgentStatRow } from "@/lib/player/build-profile-payload";

export function AgentBreakdown({ agents }: { agents: AgentStatRow[] }) {
  const reduced = Boolean(useReducedMotion());

  return (
    <section className="border-t border-white/5 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <h2 className="font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary">
          Agent performance
        </h2>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: reduced ? 0 : 0.04 } },
          }}
          className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
        >
          {agents.map((a) => (
            <motion.div
              key={a.agentName}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
              }}
              whileHover={reduced ? undefined : { scale: 1.02, transition: { duration: 0.2 } }}
              className="group relative h-[200px] overflow-hidden rounded-xl border border-surface-light bg-surface shadow-lg transition-[border-color,box-shadow] hover:border-accent-red/50 hover:shadow-lg"
            >
              {a.fullPortraitV2 ? (
                <Image
                  src={a.fullPortraitV2}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 280px"
                  className="object-cover object-[center_18%] transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="absolute inset-0 bg-surface-lighter" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-surface/75 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 z-[1] p-4 pt-14">
                <div className="flex items-center gap-2">
                  {a.roleIcon ? (
                    <Image
                      src={a.roleIcon}
                      alt=""
                      width={16}
                      height={16}
                      className="size-4 shrink-0 object-contain opacity-95 drop-shadow"
                    />
                  ) : null}
                  <h3 className="font-heading text-lg font-bold text-white drop-shadow-md">
                    {a.agentName}
                  </h3>
                </div>
                <p className="mt-1 font-body text-xs text-text-secondary">{a.games} games played</p>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-heading text-sm font-semibold tabular-nums">
                  <span
                    className={
                      a.winRate >= 50 ? "text-win" : a.winRate < 50 ? "text-loss" : "text-text-secondary"
                    }
                  >
                    {a.winRate.toFixed(0)}% WR
                  </span>
                  <span className="text-text-secondary">·</span>
                  <span className="text-text-primary">{a.kd.toFixed(2)} KD</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        {agents.length === 0 ? (
          <p className="mt-6 text-center font-body text-sm text-text-secondary">
            No agents with 2+ games yet — keep queuing and your mains will show up here.
          </p>
        ) : null}
      </div>
    </section>
  );
}
