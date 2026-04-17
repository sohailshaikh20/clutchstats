"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const FAKE_INSIGHTS = [
  "First deaths on attack ↑ — try slower defaults on pistol.",
  "Aim win rate +11% on Fracture when you took space before utility.",
  "Post-plant deaths cost ~2.4 rounds / game — review anchor timing.",
];

export function CoachingCta() {
  return (
    <section className="border-t border-white/5 px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-screen-2xl overflow-hidden rounded-2xl border border-white/10 bg-surface">
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-3 p-6 opacity-40 blur-md">
          {FAKE_INSIGHTS.map((text, i) => (
            <div
              key={i}
              className="max-w-lg rounded-lg border border-white/10 bg-background/90 px-4 py-3 font-body text-xs leading-relaxed text-text-primary"
            >
              {text}
            </div>
          ))}
        </div>

        <div className="relative z-[1] flex flex-col items-center gap-5 px-6 py-12 text-center sm:px-12 sm:py-14">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl font-heading text-2xl font-bold text-text-primary md:text-3xl"
          >
            Want to know exactly how to improve?
          </motion.h2>
          <p className="max-w-lg font-body text-sm leading-relaxed text-text-secondary md:text-base">
            AI coaching analyses your matches and gives personalised advice so you climb with a
            plan, not guesswork.
          </p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-accent-red px-8 font-heading text-xs font-bold uppercase tracking-wide text-white shadow-glow-red transition-[filter,box-shadow] hover:brightness-110 hover:shadow-lg"
            >
              Get AI Coaching
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
