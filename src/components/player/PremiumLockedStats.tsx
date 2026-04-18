"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import Link from "next/link";

const CARDS = [
  { key: "adr", label: "Avg damage/round", blur: "184" },
  { key: "fb", label: "First blood %", blur: "22%" },
  { key: "streak", label: "Win streak", blur: "5" },
  { key: "pct", label: "Your percentile", blur: "Top 12%" },
] as const;

export function PremiumLockedStats() {
  return (
    <div className="space-y-4">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-20px" }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.06 } },
        }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {CARDS.map((c, i) => (
          <motion.div
            key={c.key}
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
            }}
            custom={i}
          >
            <Link
              href="/pricing"
              className="group relative block overflow-hidden rounded-xl border border-surface-light bg-surface p-px transition-colors hover:border-white/20"
            >
              <div className="relative rounded-[11px] bg-surface px-4 py-5 text-center">
                <span className="absolute right-3 top-3 rounded-full bg-accent-red px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wide text-white">
                  Pro
                </span>
                <div className="relative mx-auto mt-2 flex h-16 items-center justify-center">
                  <span className="pointer-events-none font-heading text-4xl font-bold tabular-nums blur-sm select-none text-text-primary">
                    {c.blur}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                    <Lock className="size-5 text-text-secondary transition group-hover:text-text-primary" />
                  </div>
                </div>
                <p className="mt-3 font-body text-xs font-medium uppercase tracking-wider text-text-secondary">
                  {c.label}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
      <p className="text-center font-body text-xs text-text-secondary">
        Upgrade to Pro for advanced analytics —{" "}
        <Link href="/pricing" className="font-semibold text-accent-red hover:underline">
          view pricing
        </Link>
      </p>
    </div>
  );
}
