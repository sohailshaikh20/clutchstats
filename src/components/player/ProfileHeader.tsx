"use client";

import { motion, useReducedMotion } from "framer-motion";
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

function rankGlowShadow(glow: string | null): string {
  const base = glow ?? "rgba(255, 70, 85, 0.55)";
  const m = base.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) return `0 0 30px rgba(${m[1]},${m[2]},${m[3]},0.4)`;
  return `0 0 30px ${base}`;
}

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
  const reduced = Boolean(useReducedMotion());
  const iconShadow = rankGlowShadow(current.glowColor);

  return (
    <motion.header
      initial={reduced ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-[220px] overflow-hidden border-b border-white/10 sm:min-h-[240px]"
    >
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cardWide}
          alt=""
          className="h-full min-h-[220px] w-full object-cover object-[center_22%]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background from-[48%] via-background/45 to-accent-red/12" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/25 to-transparent" />
      </div>

      <div className="relative z-[1] mx-auto flex min-h-[220px] w-full max-w-screen-2xl flex-col justify-end px-4 pb-5 pt-10 sm:min-h-[240px] sm:px-6 sm:pb-6 lg:px-8 xl:px-10">
        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="flex min-w-0 flex-wrap items-end gap-2 break-words">
              <span className="shrink-0 text-2xl leading-none opacity-90" aria-hidden>
                {regionFlag}
              </span>
              <span className="min-w-0 font-heading text-3xl font-bold tracking-tight text-white md:text-4xl">
                {riotName}
                <span className="font-heading text-2xl font-bold text-text-secondary md:text-3xl">
                  #{riotTag}
                </span>
              </span>
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1.5 font-body text-[11px] font-semibold uppercase tracking-wider text-text-primary backdrop-blur-sm min-h-[36px] inline-flex items-center">
                Level {accountLevel}
              </span>
              <div className="flex min-h-[36px] items-center gap-2 rounded-full border border-white/12 bg-black/35 px-3 py-1.5 backdrop-blur-sm">
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
              style={{ boxShadow: iconShadow }}
            >
              {current.largeIconUrl ? (
                <Image
                  src={current.largeIconUrl}
                  alt={current.name}
                  width={72}
                  height={72}
                  sizes="72px"
                  className="size-16 object-contain sm:size-[72px]"
                />
              ) : (
                <div className="size-16 rounded-lg bg-surface-lighter sm:size-[72px]" />
              )}
            </div>
            <div className="min-w-0 pb-0.5 text-left">
              <p className="font-heading text-base font-bold text-text-primary sm:text-lg">
                {current.name}
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <span className="font-heading text-2xl font-bold tabular-nums text-white sm:text-3xl">
                  {current.rr}
                  <span className="ml-1.5 text-base font-semibold tracking-wide text-text-secondary sm:text-lg">
                    RR
                  </span>
                </span>
                {current.mmrDelta !== 0 ? (
                  <span
                    className={`inline-flex items-center gap-0.5 font-heading text-xl font-bold tabular-nums sm:text-2xl ${
                      current.mmrDelta > 0 ? "text-win" : "text-loss"
                    }`}
                  >
                    {current.mmrDelta > 0 ? (
                      <ArrowUp className="size-5 shrink-0" aria-hidden />
                    ) : (
                      <ArrowDown className="size-5 shrink-0" aria-hidden />
                    )}
                    {current.mmrDelta > 0 ? "+" : ""}
                    {current.mmrDelta}
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
