"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const FAKE_INSIGHTS = [
  "Your first-death rate on attack is high — consider defaulting slower.",
  "Aim duels won ↑ 12% when you played duelists on Fracture.",
  "Utility damage per round is below Immortal average — review lineups.",
];

export function CoachingCta() {
  return (
    <section className="mx-4 mb-10 mt-4 sm:mx-6 lg:mx-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-transparent bg-surface p-[1px] shadow-inner">
        <div
          className="rounded-2xl p-[1px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,70,85,0.9), rgba(31,170,237,0.5), rgba(255,70,85,0.4))",
          }}
        >
          <div className="flex flex-col gap-8 rounded-[15px] bg-surface px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-10">
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:max-w-md">
              {FAKE_INSIGHTS.map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.45, filter: "blur(8px)" }}
                  whileInView={{ opacity: 0.6, filter: "blur(6px)" }}
                  viewport={{ once: true }}
                  className="rounded-lg border border-white/5 bg-background/80 px-3 py-2 text-xs leading-relaxed text-text-primary"
                >
                  {text}
                </motion.div>
              ))}
            </div>
            <div className="max-w-md text-center sm:text-left">
              <h2 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
                Unlock AI Coaching
              </h2>
              <p className="mt-3 text-sm text-text-secondary">
                Get personalised insights from your match data
              </p>
              <motion.div
                className="mt-6 inline-block"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/coach"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-accent-red px-6 font-heading text-xs font-bold uppercase tracking-wide text-white shadow-glow-red transition-[filter] hover:brightness-110"
                >
                  Explore coaching
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
