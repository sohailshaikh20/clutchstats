"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const FAKE = [
  "First deaths on attack — slower defaults on pistol.",
  "Utility damage below rank average on defence.",
  "Post-plant timing leaks ~2 rounds per full buy game.",
];

export function CoachingCta() {
  return (
    <section className="border-t border-white/5 px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-screen-2xl overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-surface to-surface-light p-1">
        <div className="relative flex flex-col gap-8 rounded-[15px] bg-surface px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:py-12">
          <div className="relative hidden min-h-[200px] flex-1 lg:block">
            {FAKE.map((text, i) => (
              <div
                key={i}
                className="absolute max-w-[240px] rounded-xl border border-white/10 bg-background/80 px-4 py-3 font-body text-xs leading-relaxed text-text-primary shadow-lg backdrop-blur-sm"
                style={{
                  left: `${8 + i * 12}%`,
                  top: `${12 + i * 18}%`,
                  transform: `rotate(${i === 0 ? -3 : i === 1 ? 0 : 3}deg)`,
                  opacity: 0.55,
                  filter: "blur(1px)",
                }}
              >
                {text}
              </div>
            ))}
          </div>

          <div className="relative z-[1] max-w-lg text-center lg:text-left">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading text-2xl font-bold text-text-primary md:text-3xl"
            >
              Want to know how to rank up?
            </motion.h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-text-secondary md:text-base">
              AI coaching analyses your matches and surfaces the exact habits holding you back — with
              drills you can run between queues.
            </p>
            <motion.div className="mt-6 inline-block" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/coach"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-accent-red px-8 font-heading text-xs font-bold uppercase tracking-wide text-white shadow-glow-red transition hover:brightness-110"
              >
                Try free demo
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
