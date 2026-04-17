"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import Image from "next/image";

type Peak = { patched: string; tier: number; largeIconUrl: string | null };
type Current = {
  name: string;
  rr: number;
  mmrDelta: number;
  largeIconUrl: string | null;
  glowColor: string | null;
};

export function ProfileHeader({
  cardWide,
  riotName,
  riotTag,
  regionFlag,
  accountLevel,
  current,
  peak,
}: {
  cardWide: string;
  riotName: string;
  riotTag: string;
  regionFlag: string;
  accountLevel: number;
  current: Current;
  peak: Peak;
}) {
  const glow =
    current.glowColor ??
    "rgba(255, 70, 85, 0.45)";

  return (
    <motion.header
      initial={{ opacity: 0, x: -48 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden border-b border-white/10"
    >
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cardWide}
          alt=""
          className="h-full w-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative z-[1] mx-auto flex w-full max-w-screen-2xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8 xl:px-10">
        <div className="min-w-0">
          <h1 className="flex min-w-0 flex-wrap items-center gap-2 break-words font-heading text-2xl font-bold text-white sm:text-3xl">
            <span className="shrink-0 text-2xl leading-none" aria-hidden>
              {regionFlag}
            </span>
            <span className="min-w-0">
              {riotName}
              <span className="text-text-secondary">#{riotTag}</span>
            </span>
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 font-heading text-xs font-semibold uppercase tracking-wider text-text-primary backdrop-blur-sm">
              Level {accountLevel}
            </span>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1 backdrop-blur-sm">
              {peak.largeIconUrl ? (
                <Image
                  src={peak.largeIconUrl}
                  alt=""
                  width={28}
                  height={28}
                  className="size-7 object-contain"
                />
              ) : null}
              <span className="font-heading text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Peak:{" "}
                <span className="text-text-primary">{peak.patched}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
          <div className="flex items-center gap-4">
            <div
              className="relative rounded-xl p-1"
              style={{
                boxShadow: `0 0 28px ${glow}`,
              }}
            >
              {current.largeIconUrl ? (
                <Image
                  src={current.largeIconUrl}
                  alt={current.name}
                  width={80}
                  height={80}
                  sizes="(min-width: 640px) 80px, 64px"
                  className="size-16 object-contain sm:size-20"
                />
              ) : (
                <div className="size-16 rounded-lg bg-surface-lighter sm:size-20" />
              )}
            </div>
            <div className="text-left sm:text-right">
              <p className="font-heading text-lg font-bold text-text-primary">
                {current.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2 sm:justify-end">
                <span className="font-heading text-sm font-semibold tabular-nums text-accent-gold">
                  {current.rr} RR
                </span>
                {current.mmrDelta !== 0 ? (
                  <span
                    className={`inline-flex items-center gap-0.5 font-heading text-xs font-bold ${
                      current.mmrDelta > 0 ? "text-win" : "text-loss"
                    }`}
                  >
                    {current.mmrDelta > 0 ? (
                      <ArrowUp className="size-3.5" aria-hidden />
                    ) : (
                      <ArrowDown className="size-3.5" aria-hidden />
                    )}
                    {Math.abs(current.mmrDelta)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
