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
    current.glowColor ?? "rgba(255, 70, 85, 0.45)";

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-[220px] overflow-hidden border-b border-white/10 sm:min-h-[240px]"
    >
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cardWide}
          alt=""
          className="h-full min-h-[220px] w-full object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background from-[55%] via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-transparent to-transparent" />
      </div>

      <div className="relative z-[1] mx-auto flex min-h-[220px] w-full max-w-screen-2xl flex-col justify-end px-4 pb-6 pt-10 sm:min-h-[240px] sm:px-6 sm:pb-7 lg:px-8 xl:px-10">
        <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="flex min-w-0 flex-wrap items-end gap-3 break-words font-heading text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
              <span className="shrink-0 text-2xl leading-none opacity-90" aria-hidden>
                {regionFlag}
              </span>
              <span className="min-w-0">
                {riotName}
                <span className="font-heading text-3xl font-bold text-text-secondary md:text-4xl">
                  #{riotTag}
                </span>
              </span>
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-wider text-text-primary backdrop-blur-sm transition-colors hover:border-white/25">
                Level {accountLevel}
              </span>
              <div className="flex items-center gap-2 rounded-full border border-white/12 bg-black/30 px-3 py-1 backdrop-blur-sm transition-colors hover:border-white/20">
                {peak.largeIconUrl ? (
                  <Image
                    src={peak.largeIconUrl}
                    alt=""
                    width={24}
                    height={24}
                    className="size-6 object-contain"
                  />
                ) : null}
                <span className="font-body text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                  Peak{" "}
                  <span className="font-heading font-semibold text-text-primary">{peak.patched}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-end gap-4 lg:justify-end">
            <div
              className="relative rounded-xl p-1 transition-[filter] hover:brightness-110"
              style={{
                boxShadow: `0 0 32px ${glow}, 0 0 4px ${glow}`,
              }}
            >
              {current.largeIconUrl ? (
                <Image
                  src={current.largeIconUrl}
                  alt={current.name}
                  width={64}
                  height={64}
                  sizes="64px"
                  className="size-14 object-contain sm:size-16"
                />
              ) : (
                <div className="size-14 rounded-lg bg-surface-lighter sm:size-16" />
              )}
            </div>
            <div className="min-w-0 pb-0.5 text-left">
              <p className="font-heading text-lg font-bold text-text-primary sm:text-xl">
                {current.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="font-heading text-sm font-semibold tabular-nums text-accent-gold sm:text-base">
                  {current.rr} RR
                </span>
                {current.mmrDelta !== 0 ? (
                  <span
                    className={`inline-flex items-center gap-0.5 font-heading text-xs font-bold tabular-nums sm:text-sm ${
                      current.mmrDelta > 0 ? "text-win" : "text-loss"
                    }`}
                  >
                    {current.mmrDelta > 0 ? (
                      <ArrowUp className="size-4" aria-hidden />
                    ) : (
                      <ArrowDown className="size-4" aria-hidden />
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
