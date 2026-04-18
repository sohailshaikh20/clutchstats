"use client";

import { Bell, Share2 } from "lucide-react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AvatarFrame } from "@/components/player/profile/AvatarFrame";
import { LiveIndicator } from "@/components/player/profile/LiveIndicator";
import { RankBadge } from "@/components/player/profile/RankBadge";
import { StatPill, type HeadlineStat } from "@/components/player/profile/StatPill";

export interface ProfileHeaderData {
  name: string;
  tag: string;
  region: string;
  countryCode?: string;
  playerCardWideUrl: string;
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

function formatSeen(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const diff = Math.max(0, Date.now() - t);
  const sec = diff / 1000;
  if (sec < 45) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 86400 * 30) return `${Math.floor(sec / 86400)}d ago`;
  return `${Math.floor(sec / (86400 * 30))}mo ago`;
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
    const tick = () => setSeenLabel(formatSeen(lastSeenIso));
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

  return (
    <motion.header
      variants={container}
      initial="hidden"
      animate="show"
      className="relative w-full overflow-hidden border-b border-white/[0.06] bg-[#0a0a0c]"
    >
      {/* ── Banner ── */}
      <motion.div
        variants={item}
        className="relative min-h-[320px] w-full sm:min-h-[340px] lg:min-h-[360px]"
      >
        {/* Player card base */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.playerCardWideUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[0.35]"
          style={{ objectPosition: "center 30%" }}
        />

        {/* Duotone layers */}
        <div
          className="pointer-events-none absolute inset-0 mix-blend-multiply"
          style={{ backgroundColor: "#FF4655", opacity: 0.25 }}
        />
        <div
          className="pointer-events-none absolute inset-0 mix-blend-color"
          style={{ backgroundColor: "#0a0a0c", opacity: 0.5 }}
        />

        {/* Agent splash right */}
        {data.topAgent.splashUrl ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/2 md:w-[40%]">
            <Image
              src={data.topAgent.splashUrl}
              alt=""
              fill
              className="object-cover mix-blend-luminosity"
              style={{ objectPosition: "right center", opacity: 0.6 }}
              sizes="(max-width:768px) 50vw, 40vw"
              priority
            />
          </div>
        ) : null}

        {/* Vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 120% 100% at 0% 50%, rgba(10,10,12,0.98) 0%, rgba(10,10,12,0.85) 35%, rgba(10,10,12,0.3) 70%, transparent 100%)",
          }}
        />

        {/* Grid */}
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

        {/* Scanlines */}
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.05]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, #fff 2px, #fff 3px)",
          }}
        />

        {/* Top bar */}
        <div className="absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-4 px-5 py-5 sm:px-8">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-1 h-8 w-[3px] shrink-0 bg-accent-red" aria-hidden />
            <div className="min-w-0">
              <p className="font-mono-display text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
                Main agent
              </p>
              <p className="truncate font-sans-tight text-sm font-medium text-white/90">{data.topAgent.name}</p>
              <p className="mt-0.5 font-mono-display text-[11px] text-white/45">
                · {data.topAgent.playtimeHours.toFixed(0)}h · {data.topAgent.matches} matches
              </p>
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

        {/* Identity row */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col gap-6 px-5 pb-6 pt-12 sm:flex-row sm:items-end sm:px-8 sm:pb-8">
          <AvatarFrame name={data.name} level={data.level} isOnline={data.isOnline} />

          <div className="min-w-0 flex-1 pb-1">
            <p className="font-mono-display text-[11px] font-bold uppercase tracking-[0.25em] text-white/40">
              {data.regionFlag ? <span className="mr-1">{data.regionFlag}</span> : null}
              {code}
              {" // "}
              {data.region.toUpperCase()}
              {" // "}
              <span suppressHydrationWarning>Seen {seenLabel || (lastSeenIso ? "…" : "—")}</span>
            </p>
            <h1 className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className="font-display text-[48px] font-black leading-none tracking-tight text-white sm:text-[56px]">
                {data.name}
              </span>
              <span className="font-mono-display text-2xl font-normal text-white/30">#{data.tag}</span>
            </h1>
            {showSession && session ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 font-mono-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
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
      </motion.div>

      {/* Stats strip */}
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
