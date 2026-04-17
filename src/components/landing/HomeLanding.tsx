"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Brain,
  ChevronDown,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FetchErrorPanel } from "@/components/ui/FetchErrorPanel";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchLatestRankIconByHenrikTier,
  fetchPlayableAgentIcons,
  type AgentIcon,
} from "@/lib/valorant/landing-assets";
import { getRankByTier } from "@/lib/constants/ranks";
import type { LeaderboardRow } from "@/lib/leaderboard/parse-henrik-leaderboard";
import type { EsportsMatchCardDTO } from "@/types/esports";

// Active players verified against Henrik API (leaderboard top players, April 2026)
const TRY_PLAYERS = ["CB10#Aegon", "raiku#hsp", "BLG Zayce#2009"] as const;

function playerHref(riotId: string): string {
  const hash = riotId.lastIndexOf("#");
  if (hash <= 0) return "/stats";
  const name = encodeURIComponent(riotId.slice(0, hash));
  const tag = encodeURIComponent(riotId.slice(hash + 1));
  return `/player/${name}/${tag}`;
}

/** Tiny blur for remote match logos (next/image). */
const REMOTE_IMG_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwABmQ/9k=";

const FALLBACK_LEADERBOARD: LeaderboardRow[] = [
  { leaderboardRank: 1, name: "stellar", tag: "NA1", rr: 612, tier: 25, wins: 0, topAgentUuid: null },
  { leaderboardRank: 2, name: "bang", tag: "100", rr: 524, tier: 25, wins: 0, topAgentUuid: null },
  { leaderboardRank: 3, name: "Asuna", tag: "1337", rr: 498, tier: 24, wins: 0, topAgentUuid: null },
  { leaderboardRank: 4, name: "Derrek", tag: "deer", rr: 455, tier: 24, wins: 0, topAgentUuid: null },
  { leaderboardRank: 5, name: "Ethan", tag: "100T", rr: 431, tier: 24, wins: 0, topAgentUuid: null },
  { leaderboardRank: 6, name: "BcJ", tag: "NV", rr: 402, tier: 23, wins: 0, topAgentUuid: null },
  { leaderboardRank: 7, name: "johnqt", tag: "NA1", rr: 388, tier: 23, wins: 0, topAgentUuid: null },
  { leaderboardRank: 8, name: "NaturE", tag: "100T", rr: 371, tier: 23, wins: 0, topAgentUuid: null },
  { leaderboardRank: 9, name: "OXY", tag: "OXY", rr: 355, tier: 22, wins: 0, topAgentUuid: null },
  { leaderboardRank: 10, name: "seven", tag: "77", rr: 340, tier: 22, wins: 0, topAgentUuid: null },
];

const featureCards = [
  {
    title: "Player Stats",
    body: "Deep analytics for any player. KDA, agents, maps, trends.",
    href: "/stats",
    icon: BarChart3,
    accent: "text-accent-red",
  },
  {
    title: "Live Esports",
    body: "VCT matches, results, rankings. Never miss a game.",
    href: "/esports",
    icon: Trophy,
    accent: "text-accent-blue",
  },
  {
    title: "Find Your Squad",
    body: "Rank-verified LFG. Find teammates who fit your playstyle.",
    href: "/lfg",
    icon: Users,
    accent: "text-accent-gold",
  },
  {
    title: "AI Coach",
    body: "Personalised improvement plans powered by AI. Know exactly what to fix.",
    href: "/coach",
    icon: Brain,
    accent: "text-accent-red",
  },
] as const;

function tierMedalClass(position: number): string {
  if (position === 1) return "border-l-[#D4AF37]";
  if (position === 2) return "border-l-[#B8C4CE]";
  if (position === 3) return "border-l-[#A87040]";
  return "border-l-transparent";
}

function EsportsSkeleton() {
  return (
    <div className="flex gap-4 pb-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-36 min-w-[260px] shrink-0 animate-pulse rounded-xl border border-surface-light bg-surface-lighter/40"
        />
      ))}
    </div>
  );
}

export default function HomeLanding() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const reduced = Boolean(reducedMotion);
  const [searchQ, setSearchQ] = useState("");
  const [matches, setMatches] = useState<EsportsMatchCardDTO[] | null>(null);
  const [matchesErr, setMatchesErr] = useState(false);
  const [rankIcons, setRankIcons] = useState<Map<number, string>>(new Map());
  const [agents, setAgents] = useState<AgentIcon[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>(FALLBACK_LEADERBOARD);
  const [leaderboardSource, setLeaderboardSource] = useState<"live" | "fallback">("fallback");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [icons, ag] = await Promise.all([
        fetchLatestRankIconByHenrikTier(),
        fetchPlayableAgentIcons(),
      ]);
      if (!cancelled) {
        setRankIcons(icons);
        setAgents(
          [...ag].sort((a, b) => a.displayName.localeCompare(b.displayName))
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/leaderboard/preview");
        if (!res.ok) return;
        const json = (await res.json()) as { rows?: LeaderboardRow[]; source?: string };
        if (!cancelled && json.rows && json.rows.length > 0) {
          setLeaderboard(json.rows);
          setLeaderboardSource("live");
        }
      } catch {
        // keep fallback data
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMatches = useCallback(async () => {
    setMatches(null);
    setMatchesErr(false);
    try {
      const res = await fetch("/api/esports/matches", { cache: "no-store" });
      if (!res.ok) throw new Error("bad status");
      const json = (await res.json()) as { matches?: EsportsMatchCardDTO[] };
      setMatches(json.matches ?? []);
    } catch {
      setMatches([]);
      setMatchesErr(true);
    }
  }, []);

  useEffect(() => {
    void loadMatches();
  }, [loadMatches]);

  const agentByCard = useMemo(() => {
    const picks: (AgentIcon | undefined)[] = [0, 1, 2, 3].map(
      (i) => agents[i % Math.max(agents.length, 1)]
    );
    return picks;
  }, [agents]);

  function onSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const q = searchQ.trim();
    if (!q.includes("#")) {
      return;
    }
    router.push(playerHref(q));
    setSearchQ("");
  }

  const heroEase = [0.22, 1, 0.36, 1] as const;

  return (
    <div className="overflow-x-hidden">
      {/* ─── HERO ─── */}
      <section className="relative flex min-h-[100dvh] flex-col">
        <div className="pointer-events-none absolute inset-0 overflow-hidden bg-background">
          <div
            className="landing-hero-mesh-a absolute -left-[20%] -top-[25%] h-[150%] w-[150%] opacity-90 mix-blend-screen"
            style={{
              background: `
                radial-gradient(ellipse 52% 48% at 28% 38%, rgba(255,70,85,0.5), transparent 58%),
                radial-gradient(ellipse 48% 52% at 72% 58%, rgba(31,170,237,0.42), transparent 56%)
              `,
            }}
          />
          <div
            className="landing-hero-mesh-b absolute -right-[15%] bottom-[-20%] h-[140%] w-[140%] opacity-75 mix-blend-soft-light"
            style={{
              background: `
                radial-gradient(ellipse 42% 38% at 68% 28%, rgba(255,70,85,0.32), transparent 52%),
                radial-gradient(ellipse 46% 44% at 32% 72%, rgba(31,170,237,0.38), transparent 54%)
              `,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.09]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(236,232,225,0.55) 1px, transparent 1px),
                linear-gradient(90deg, rgba(236,232,225,0.55) 1px, transparent 1px)
              `,
              backgroundSize: "56px 56px",
              maskImage:
                "radial-gradient(ellipse 85% 75% at 50% 42%, black 15%, transparent 72%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 85% 75% at 50% 42%, black 15%, transparent 72%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-3 pb-28 pt-20 sm:px-4 md:px-8">
          <div className="mx-auto w-full max-w-3xl text-center">
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.55, ease: heroEase }}
              className="font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary"
            >
              COMPETITIVE GAMING PLATFORM
            </motion.p>

            <motion.h1
              initial={reduced ? false : { opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.75, ease: heroEase }}
              className="mt-4 text-balance font-heading text-4xl font-bold uppercase leading-[1.08] tracking-tight text-white sm:text-5xl md:text-7xl"
            >
              YOUR COMPETITIVE EDGE
            </motion.h1>

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduced ? { duration: 0 } : { duration: 0.65, delay: 0.06, ease: heroEase }
              }
              className="mt-5 text-balance font-body text-base text-text-secondary sm:text-lg"
            >
              Stats. Esports. Squad Finder. AI Coach.
            </motion.p>

            <motion.form
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduced ? { duration: 0 } : { duration: 0.65, delay: 0.2, ease: heroEase }
              }
              onSubmit={onSearchSubmit}
              className="mx-auto mt-10 w-full max-w-xl"
            >
              <label className="group relative block">
                <span className="sr-only">Search player</span>
                <Search
                  className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-text-secondary transition-colors group-focus-within:text-accent-red"
                  aria-hidden
                />
                <input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search player... Name#Tag"
                  className="h-14 w-full rounded-xl border border-surface-light bg-surface py-3 pl-14 pr-5 font-heading text-base text-text-primary outline-none transition-[border-color,box-shadow] placeholder:text-text-secondary/70 focus:border-accent-red focus:shadow-glow-red"
                />
              </label>
            </motion.form>

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduced ? { duration: 0 } : { duration: 0.55, delay: 0.4, ease: heroEase }
              }
              className="mt-5 flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-sm"
            >
              <span className="text-text-secondary">Try:</span>
              {TRY_PLAYERS.map((id, i) => (
                <span key={id} className="flex items-center gap-x-1">
                  {i > 0 ? (
                    <span className="text-text-secondary/60" aria-hidden>
                      |
                    </span>
                  ) : null}
                  <motion.span
                    whileHover={reduced ? undefined : { scale: 1.04 }}
                    whileTap={reduced ? undefined : { scale: 0.98 }}
                  >
                    <Link
                      href={playerHref(id)}
                      className="font-heading font-semibold text-accent-blue underline-offset-2 transition-colors hover:text-accent-blue/90 hover:underline"
                    >
                      {id}
                    </Link>
                  </motion.span>
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-text-secondary"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduced ? { duration: 0 } : { delay: 0.85, duration: 0.5 }}
        >
          <motion.div
            animate={reduced ? { y: 0 } : { y: [0, 10, 0] }}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
            className="flex flex-col items-center gap-1"
          >
            <span className="text-[10px] font-heading uppercase tracking-widest text-text-secondary/80">
              Scroll
            </span>
            <ChevronDown className="size-7" aria-hidden />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="relative border-t border-white/5 bg-background px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.h2
            initial={reduced ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={reduced ? { duration: 0 } : { duration: 0.5 }}
            className="text-center font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary"
          >
            EVERYTHING IN ONE PLACE
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={
              reduced
                ? { hidden: {}, show: {} }
                : {
                    hidden: {},
                    show: {
                      transition: { staggerChildren: 0.1, delayChildren: 0.08 },
                    },
                  }
            }
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {featureCards.map((card, index) => {
              const Icon = card.icon;
              const agent = agentByCard[index];
              return (
                <motion.div
                  key={card.title}
                  variants={
                    reduced
                      ? {
                          hidden: { opacity: 1, y: 0 },
                          show: { opacity: 1, y: 0 },
                        }
                      : {
                          hidden: { opacity: 0, y: 28 },
                          show: {
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.55, ease: heroEase },
                          },
                        }
                  }
                >
                  <motion.div
                    whileHover={reduced ? undefined : { y: -4, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  >
                    <Link
                      href={card.href}
                      className="group relative block h-full overflow-hidden rounded-xl border border-surface-light bg-surface p-6 transition-[border-color,box-shadow] hover:border-accent-red hover:shadow-glow-red"
                    >
                      {agent ? (
                        <div className="pointer-events-none absolute -right-4 -top-4 size-28 opacity-25 transition-opacity group-hover:opacity-40">
                          <Image
                            src={agent.displayIcon}
                            alt=""
                            width={112}
                            height={112}
                            sizes="112px"
                            className="object-contain"
                          />
                        </div>
                      ) : null}
                      <Icon
                        className={`relative z-[1] size-9 ${card.accent} transition-transform group-hover:scale-110`}
                        aria-hidden
                      />
                      <h3 className="relative z-[1] mt-4 font-heading text-lg font-bold text-text-primary">
                        {card.title}
                      </h3>
                      <p className="relative z-[1] mt-2 text-sm leading-relaxed text-text-secondary transition-colors group-hover:text-text-primary/90">
                        {card.body}
                      </p>
                    </Link>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── ESPORTS ─── */}
      <section className="border-t border-white/5 bg-surface/40 px-4 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <motion.h2
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={reduced ? { duration: 0 } : { duration: 0.45 }}
              className="font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary"
            >
              LIVE & UPCOMING MATCHES
            </motion.h2>
            <motion.div
              initial={reduced ? false : { opacity: 0, x: 8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={reduced ? { duration: 0 } : { duration: 0.45, delay: 0.05 }}
              whileHover={reduced ? undefined : { x: 4 }}
            >
              <Link
                href="/esports"
                className="font-heading text-sm font-semibold uppercase tracking-wide text-accent-blue transition-colors hover:text-text-primary"
              >
                View All Esports →
              </Link>
            </motion.div>
          </div>

          <div className="mt-8 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {matches === null ? (
              <EsportsSkeleton />
            ) : matches.length === 0 ? (
              matchesErr ? (
                <FetchErrorPanel
                  title="Matches unavailable"
                  message="We couldn’t load the esports feed. Check your connection and try again."
                  onRetry={loadMatches}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-white/15 bg-surface/80 px-6 py-12 text-center">
                  <p className="font-heading text-sm font-bold uppercase tracking-wide text-text-primary">
                    No matches on the board
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
                    Nothing live or scheduled right now. When VCT picks up, fresh cards will appear
                    here automatically.
                  </p>
                  <Link
                    href="/esports"
                    className="mt-6 inline-flex font-semibold text-accent-blue underline-offset-4 hover:underline"
                  >
                    Open the esports hub →
                  </Link>
                </div>
              )
            ) : (
              <div className="flex w-max gap-4 pb-1">
                {matches.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={reduced ? false : { opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={
                      reduced ? { duration: 0 } : { delay: i * 0.05, duration: 0.45 }
                    }
                    whileHover={reduced ? undefined : { scale: 1.02, y: -2 }}
                    className="snap-start"
                  >
                    <a
                      href={m.vlrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-36 min-w-[280px] max-w-[320px] flex-col justify-between rounded-xl border border-surface-light bg-surface p-4 transition-[border-color,box-shadow] hover:border-accent-blue/50 hover:shadow-glow-blue"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="line-clamp-1 text-left text-[11px] font-heading uppercase tracking-wider text-text-secondary">
                          {m.eventName}
                        </span>
                        {m.isLive ? (
                          <span className="shrink-0 rounded bg-accent-red/15 px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-accent-red">
                            Live
                          </span>
                        ) : (
                          <span className="shrink-0 font-heading text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                            {m.timeLabel}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          {m.team1.logo ? (
                            <Image
                              src={m.team1.logo}
                              alt=""
                              width={32}
                              height={32}
                              sizes="32px"
                              placeholder="blur"
                              blurDataURL={REMOTE_IMG_BLUR}
                              className="size-8 shrink-0 rounded object-contain"
                            />
                          ) : null}
                          <span className="truncate font-heading text-sm font-bold text-text-primary">
                            {m.team1.name}
                          </span>
                        </div>
                        <span className="shrink-0 font-heading text-xs text-text-secondary">
                          vs
                        </span>
                        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                          <span className="truncate text-right font-heading text-sm font-bold text-text-primary">
                            {m.team2.name}
                          </span>
                          {m.team2.logo ? (
                            <Image
                              src={m.team2.logo}
                              alt=""
                              width={32}
                              height={32}
                              sizes="32px"
                              placeholder="blur"
                              blurDataURL={REMOTE_IMG_BLUR}
                              className="size-8 shrink-0 rounded object-contain"
                            />
                          ) : null}
                        </div>
                      </div>
                      {(m.team1.score != null && m.team2.score != null) || m.isLive ? (
                        <div className="flex justify-center gap-6 font-heading text-lg font-bold tabular-nums text-text-primary">
                          <span>{m.team1.score ?? "–"}</span>
                          <span className="text-text-secondary">:</span>
                          <span>{m.team2.score ?? "–"}</span>
                        </div>
                      ) : (
                        <div className="h-7" />
                      )}
                    </a>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── LEADERBOARD PREVIEW ─── */}
      <section className="border-t border-white/5 px-4 py-20 md:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-center gap-3">
            <motion.h2
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={reduced ? { duration: 0 } : { duration: 0.45 }}
              className="font-heading text-xs font-semibold uppercase tracking-widest text-text-secondary"
            >
              TOP PLAYERS THIS ACT
            </motion.h2>
            {leaderboardSource === "fallback" && (
              <span className="rounded border border-white/10 bg-surface px-1.5 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-wide text-text-secondary/60">
                Sample data
              </span>
            )}
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-30px" }}
            variants={
              reduced
                ? { hidden: {}, show: {} }
                : { hidden: {}, show: { transition: { staggerChildren: 0.045 } } }
            }
            className="mt-10 overflow-hidden rounded-xl border border-surface-light bg-surface"
          >
            {leaderboard.map((row, idx) => {
              const pos = row.leaderboardRank || idx + 1;
              const iconUrl = rankIcons.get(row.tier);
              const rankMeta = getRankByTier(row.tier);
              return (
                <motion.div
                  key={`${row.name}-${row.tag}-${pos}`}
                  variants={
                    reduced
                      ? {
                          hidden: { opacity: 1, y: 0 },
                          show: { opacity: 1, y: 0 },
                        }
                      : {
                          hidden: { opacity: 0, y: 12 },
                          show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                        }
                  }
                  whileHover={
                    reduced ? undefined : { backgroundColor: "rgba(36, 52, 71, 0.65)" }
                  }
                  className={`flex items-center gap-3 border-b border-surface-light/80 border-l-4 py-3 pl-3 pr-4 last:border-b-0 ${pos <= 3 ? tierMedalClass(pos) : "border-l-transparent"}`}
                >
                  <span className="w-6 shrink-0 text-center font-heading text-sm font-bold text-text-secondary">
                    {pos}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-sm font-semibold text-text-primary">
                      {row.name}
                      {row.tag ? <span className="ml-1 text-text-secondary/60">#{row.tag}</span> : null}
                    </p>
                    <p className="text-xs text-text-secondary">{rankMeta.name}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {iconUrl ? (
                      <Image
                        src={iconUrl}
                        alt=""
                        width={36}
                        height={36}
                        sizes="36px"
                        className="size-9 object-contain"
                      />
                    ) : (
                      <div className="size-9 rounded bg-surface-lighter" />
                    )}
                    <span className="w-14 text-right font-heading text-sm font-bold tabular-nums text-accent-gold">
                      {row.rr} RR
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            className="mt-8 text-center"
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={reduced ? { duration: 0 } : { delay: 0.15, duration: 0.45 }}
            whileHover={reduced ? undefined : { scale: 1.03 }}
          >
            <Link
              href="/leaderboard"
              className="inline-block font-heading text-sm font-semibold uppercase tracking-wide text-accent-blue underline-offset-4 transition-colors hover:text-text-primary hover:underline"
            >
              View Full Leaderboard →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="relative overflow-hidden border-t border-white/5 px-4 py-24 md:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background: `
              radial-gradient(ellipse 80% 80% at 50% 120%, rgba(255,70,85,0.18), transparent 55%),
              radial-gradient(ellipse 60% 50% at 10% 0%, rgba(31,170,237,0.12), transparent 50%),
              linear-gradient(180deg, #0F1923 0%, #1A2634 45%, #0F1923 100%)
            `,
          }}
        />
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduced ? { duration: 0 } : { duration: 0.55 }}
          className="relative z-[1] mx-auto max-w-xl text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
            Ready to rank up?
          </h2>
          <p className="mt-4 font-body text-text-secondary">
            Get personalised AI coaching insights for every match
          </p>
          <motion.div
            className="mt-10 inline-block"
            whileHover={reduced ? undefined : { scale: 1.04 }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
          >
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-accent-red px-8 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-glow-red transition-[filter] hover:brightness-110"
            >
              Start Free Trial
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
