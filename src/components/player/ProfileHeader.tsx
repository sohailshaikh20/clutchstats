"use client";

import { Bell, Share2 } from "lucide-react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AvatarFrame } from "@/components/player/profile/AvatarFrame";
import { LiveIndicator } from "@/components/player/profile/LiveIndicator";
import { RankBadge } from "@/components/player/profile/RankBadge";
import { StatPill, type HeadlineStat } from "@/components/player/profile/StatPill";
import { formatRelativeTime } from "@/lib/format";

export interface ProfileHeaderData {
  name: string;
  tag: string;
  region: string;
  countryCode?: string;
  playerCardWideUrl: string;
  /** Small playercard art (Riot / Henrik). */
  playerCardSmallUrl?: string;
  level: number;
  currentTier: string;
  currentRR: number;
  currentRRDelta?: number;
  leaderboardRank?: number;
  peakTier: string;
  peakRR?: number;
  peakEpisode?: string;
  topAgent: { name: string; splashUrl: string; playtimeHours: number; matches: number };
  clutchRating: number;
  clutchPercentile: number;
  clutchDelta?: number;
  headlineStats: HeadlineStat[];
  session?: { matchesLast24h: number; wins24h: number; losses24h: number; lastSeenISO: string };
  isOnline?: boolean;
  isStreaming?: boolean;
  /** Region flag emoji for meta row */
  regionFlag?: string;
}

export function ProfileHeader({ data }: { data: ProfileHeaderData }) {
  const reduced = Boolean(useReducedMotion());
  const [seenLabel, setSeenLabel] = useState("");

  const lastSeenIso = data.session?.lastSeenISO;
  useEffect(() => {
    if (!lastSeenIso) {
      setSeenLabel("");
      return;
    }
    const tick = () => setSeenLabel(formatRelativeTime(lastSeenIso));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [lastSeenIso]);

  const share = useCallback(() => {
    const path = `/player/${encodeURIComponent(data.name)}/${encodeURIComponent(data.tag)}`;
    const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    void navigator.clipboard.writeText(url);
  }, [data.name, data.tag]);

  const session = data.session;
  const showSession = session && session.matchesLast24h > 0;
  const wr24 =
    session && session.matchesLast24h > 0
      ? ((session.wins24h / session.matchesLast24h) * 100).toFixed(0)
      : "0";

  const clutchStat: HeadlineStat = useMemo(
    () => ({
      key: "clutch",
      label: "CLUTCH RATING",
      value: String(data.clutchRating),
      percentile: data.clutchPercentile,
      delta: data.clutchDelta ?? 0,
      trend: data.headlineStats[0]?.trend?.length ? data.headlineStats[0].trend : [400, 420, 450, 480, 500, 520],
      trendDirection: (data.clutchDelta ?? 0) > 0 ? "up" : (data.clutchDelta ?? 0) < 0 ? "down" : "flat",
    }),
    [data.clutchRating, data.clutchPercentile, data.clutchDelta, data.headlineStats]
  );

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduced ? 0 : 0.06,
        delayChildren: reduced ? 0 : 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const code = (data.countryCode ?? data.region).toUpperCase();
  const playHoursRounded = Math.max(0, Math.round(data.topAgent.playtimeHours));
  const hoursLabel = playHoursRounded === 1 ? "HOUR" : "HOURS";
  const mainAgentLine = `MAIN AGENT — ${data.topAgent.name.toUpperCase()} · ${playHoursRounded} ${hoursLabel} THIS ACT · ${data.topAgent.matches} MATCHES`;

  return (
    <motion.header
      variants={container}
      initial="hidden"
      animate="show"
      className="relative w-full overflow-hidden border-b border-white/[0.06] bg-[#0a0a0c]"
    >
      <motion.div variants={item} className="relative min-h-[280px] w-full sm:min-h-[290px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.playerCardWideUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.35]"
          style={{ objectPosition: "center 30%" }}
        />

        <div
          className="pointer-events-none absolute inset-0 mix-blend-multiply"
          style={{ backgroundColor: "#FF4655", opacity: 0.25 }}
        />
        <div
          className="pointer-events-none absolute inset-0 mix-blend-color"
          style={{ backgroundColor: "#0a0a0c", opacity: 0.5 }}
        />

        {data.topAgent.splashUrl ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 h-full w-[35%] md:w-[30%]">
            <Image
              src={data.topAgent.splashUrl}
              alt=""
              fill
              className="object-cover mix-blend-luminosity"
              style={{ objectPosition: "right center", opacity: 0.42 }}
              sizes="(max-width:768px) 35vw, 30vw"
              priority
            />
          </div>
        ) : null}

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 120% 100% at 0% 50%, rgba(10,10,12,0.98) 0%, rgba(10,10,12,0.85) 35%, rgba(10,10,12,0.3) 70%, transparent 100%)",
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #fff 1px, transparent 1px),
              linear-gradient(to bottom, #fff 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.05]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, #fff 2px, #fff 3px)",
          }}
        />

        <div className="absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 h-6 w-[3px] shrink-0 bg-accent-red" aria-hidden />
            <div className="min-w-0">
              <p className="font-mono-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">{mainAgentLine}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {data.isStreaming ? <LiveIndicator /> : null}
            <button
              type="button"
              title="Coming soon"
              className="inline-flex size-8 items-center justify-center rounded-sm border border-white/[0.06] bg-white/[0.03] text-white/70 transition-colors hover:border-accent-red/40 hover:bg-accent-red hover:text-white"
            >
              <Bell className="size-4" />
              <span className="sr-only">Follow</span>
            </button>
            <button
              type="button"
              title="Copy profile link"
              onClick={share}
              className="inline-flex size-8 items-center justify-center rounded-sm border border-white/[0.06] bg-white/[0.03] text-white/70 transition-colors hover:border-accent-red/40 hover:bg-accent-red hover:text-white"
            >
              <Share2 className="size-4" />
              <span className="sr-only">Share</span>
            </button>
          </div>
        </div>

        <div className="absolute left-8 right-6 top-1/2 z-20 flex max-w-[calc(100%-3rem)] -translate-y-1/2 flex-col gap-3 sm:right-8 sm:max-w-none">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <AvatarFrame
              imageUrl={data.playerCardSmallUrl}
              initial={data.name}
              alt={`${data.name} playercard`}
              isOnline={data.isOnline}
            />

            <div className="min-w-0 flex-1">
              <p className="font-mono-display text-[11px] font-bold uppercase tracking-[0.25em] text-white/40">
                {data.regionFlag ? <span className="mr-1">{data.regionFlag}</span> : null}
                {code}
                {" // "}
                {data.region.toUpperCase()}
                {" // "}
                <span suppressHydrationWarning>Seen {seenLabel || (lastSeenIso ? "…" : "—")}</span>
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-4 sm:gap-6">
                <div className="min-w-0">
                  <h1 className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="font-display text-[40px] font-black leading-none tracking-tight text-white sm:text-[52px]">
                      {data.name}
                    </span>
                    <span className="font-mono-display text-xl font-normal text-white/30 sm:text-2xl">#{data.tag}</span>
                    <span
                      className="rounded-sm bg-accent-red px-2 py-0.5 font-mono-display text-[10px] font-bold uppercase tracking-[0.08em] text-white"
                      style={{
                        clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
                      }}
                    >
                      LVL {data.level.toLocaleString()}
                    </span>
                  </h1>

                  {showSession && session ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2 font-mono-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                      <span>Last 24h</span>
                      <span className="text-[#00E5D1]">{session.wins24h}W</span>
                      <span className="text-white/30">/</span>
                      <span className="text-accent-red">{session.losses24h}L</span>
                      <span className="text-white/35">·</span>
                      <span className="text-white/60">{wr24}% WR</span>
                      <span className="text-white/35">·</span>
                      <span className="text-white/60">{session.matchesLast24h} matches</span>
                    </div>
                  ) : null}
                </div>

                <RankBadge
                  currentTierPatched={data.currentTier}
                  currentRR={data.currentRR}
                  currentRRDelta={data.currentRRDelta}
                  peakTierPatched={data.peakTier}
                  peakRR={data.peakRR}
                  peakEpisode={data.peakEpisode}
                  leaderboardRank={data.leaderboardRank}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className="grid grid-cols-1 border-t border-white/[0.06] bg-[#0D0D10] md:grid-cols-5"
      >
        <StatPill stat={clutchStat} variant="clutch" />
        {data.headlineStats.slice(0, 4).map((s) => (
          <StatPill key={s.key} stat={s} />
        ))}
      </motion.div>
    </motion.header>
  );
}

export type { HeadlineStat } from "@/components/player/profile/StatPill";
