"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Flame,
  Search,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { lookupTierColors, tierKeyFromPatched } from "@/components/player/profile/RankBadge";
import {
  ESPORTS_FEED,
  EXPANDED_MATCH_CARDS,
  TRENDING_PLAYERS,
  type ExpandedMatchCard,
} from "@/components/landing/home-landing-data";
import { getRankByTier } from "@/lib/constants/ranks";
import type { LeaderboardRow } from "@/lib/leaderboard/parse-henrik-leaderboard";

type LeaderDisplay = LeaderboardRow & { region: string };

const DISPLAY_FALLBACK: LeaderDisplay[] = [
  { leaderboardRank: 1, name: "stellar", tag: "NA1", rr: 612, tier: 25, wins: 24, topAgentUuid: null, region: "NA" },
  { leaderboardRank: 2, name: "bang", tag: "100", rr: 524, tier: 25, wins: 21, topAgentUuid: null, region: "NA" },
  { leaderboardRank: 3, name: "Asuna", tag: "1337", rr: 498, tier: 24, wins: 19, topAgentUuid: null, region: "NA" },
  { leaderboardRank: 4, name: "Derrek", tag: "deer", rr: 455, tier: 24, wins: 18, topAgentUuid: null, region: "NA" },
  { leaderboardRank: 5, name: "Ethan", tag: "100T", rr: 431, tier: 24, wins: 17, topAgentUuid: null, region: "NA" },
  { leaderboardRank: 6, name: "BcJ", tag: "NV", rr: 402, tier: 23, wins: 16, topAgentUuid: null, region: "NA" },
  { leaderboardRank: 7, name: "johnqt", tag: "NA1", rr: 388, tier: 23, wins: 15, topAgentUuid: null, region: "NA" },
  { leaderboardRank: 8, name: "NaturE", tag: "100T", rr: 371, tier: 23, wins: 14, topAgentUuid: null, region: "NA" },
  { leaderboardRank: 9, name: "OXY", tag: "OXY", rr: 355, tier: 22, wins: 13, topAgentUuid: null, region: "EU" },
  { leaderboardRank: 10, name: "seven", tag: "77", rr: 340, tier: 22, wins: 12, topAgentUuid: null, region: "EU" },
  { leaderboardRank: 11, name: "Leo", tag: "FNC", rr: 328, tier: 22, wins: 11, topAgentUuid: null, region: "EU" },
  { leaderboardRank: 12, name: "Kai", tag: "APAC", rr: 315, tier: 21, wins: 10, topAgentUuid: null, region: "APAC" },
];

function playerHref(riotId: string): string {
  const hash = riotId.lastIndexOf("#");
  if (hash <= 0) return "/stats";
  const name = encodeURIComponent(riotId.slice(0, hash));
  const tag = encodeURIComponent(riotId.slice(hash + 1));
  return `/player/${name}/${tag}`;
}

function parseRiotId(raw: string): { name: string; tag: string } | null {
  const q = raw.trim();
  const i = q.indexOf("#");
  if (i <= 0 || i >= q.length - 1) return null;
  const name = q.slice(0, i).trim();
  const tag = q.slice(i + 1).trim();
  if (!name || !tag) return null;
  if (tag.includes("#")) return null;
  return { name, tag };
}

const heroEase = [0.22, 1, 0.36, 1] as const;

function leagueBadgeClass(key: "amer" | "emea" | "pac" | "chl"): string {
  if (key === "amer") return "bg-[rgba(31,170,237,0.18)] text-[#7EC8F0]";
  if (key === "emea") return "bg-[rgba(197,131,214,0.2)] text-[#D4B5E8]";
  if (key === "pac") return "bg-[rgba(0,229,209,0.14)] text-[#7EE8DC]";
  return "bg-white/[0.08] text-white/55";
}

function useCountUp(target: number, durationMs: number, active: boolean): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) {
      setV(target);
      return;
    }
    let startAt: number | null = null;
    let raf = 0;
    const tick = (now: number) => {
      if (startAt === null) startAt = now;
      const t = Math.min(1, (now - startAt) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setV(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, active]);
  return v;
}

const STAT_TARGETS = {
  players: 147_392,
  matchesM: 2.8,
  live: 12,
} as const;

function StatsBand({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const active = inView && !reduced;
  const nPlayers = useCountUp(STAT_TARGETS.players, 800, Boolean(active));
  const nLive = useCountUp(STAT_TARGETS.live, 800, Boolean(active));
  const [matchesDisplay, setMatchesDisplay] = useState("0");

  useEffect(() => {
    if (!active) {
      setMatchesDisplay(reduced ? "2.8M" : "0");
      return;
    }
    let start: number | null = null;
    let raf = 0;
    const target = 2.8;
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / 800);
      const eased = 1 - (1 - t) ** 3;
      setMatchesDisplay(`${(target * eased).toFixed(1)}M`);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced]);

  const tiles = [
    {
      label: "PLAYERS TRACKED",
      value: nPlayers.toLocaleString(),
      sub: "↑ 2,104 THIS WEEK",
      subClass: "text-[#FFB547]",
    },
    {
      label: "MATCHES ANALYZED",
      value: matchesDisplay,
      sub: "LAST 30 DAYS",
      subClass: "text-white/50",
    },
    {
      label: "LIVE MATCHES",
      value: String(nLive),
      sub: "VCT + CHALLENGERS",
      subClass: nLive > 0 ? "text-[#FF4655]" : "text-white/50",
      pulse: nLive > 0,
    },
    {
      label: "ACT ENDING IN",
      value: "10d 9h",
      sub: "V26: A2",
      subClass: "text-white/50",
    },
  ];

  return (
    <section ref={ref} className="w-full border-y border-white/[0.06] bg-[#0D0D10] py-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/[0.06] px-6 md:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="bg-[#0D0D10] px-6 py-4">
            <p className="font-mono-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">{t.label}</p>
            <p className="mt-1 font-display text-[32px] font-black tabular-nums leading-none text-white">{t.value}</p>
            <p className={`mt-2 flex items-center gap-1.5 font-mono-display text-[11px] ${t.subClass}`}>
              {t.pulse ? (
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-pulse rounded-full bg-[#FF4655] opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#FF4655]" />
                </span>
              ) : null}
              {t.sub}
            </p>
          </div>
        ))}
      </div>
      {/* TODO(backend): replace stat band with real aggregated counts from DB */}
    </section>
  );
}

const featureCards = [
  {
    icon: BarChart3,
    title: "PLAYER STATS",
    sublabel: "40+ METRICS PER MATCH",
    body: "Every metric you need and some Tracker does not show. KAST, DDA, econ rating, clutch %.",
    href: "/stats",
  },
  {
    icon: Trophy,
    title: "LIVE ESPORTS",
    sublabel: "VCT + CHALLENGERS",
    body: "Full schedule, live scores, standings. Match notifications coming soon.",
    href: "/esports",
  },
  {
    icon: Users,
    title: "SQUAD FINDER",
    sublabel: "RANK-VERIFIED LFG",
    body: "Find teammates at your rank with the voice chat, region, and playstyle you want.",
    href: "/lfg",
  },
  {
    icon: Target,
    title: "DEEP ANALYTICS",
    sublabel: "PRO-GRADE INSIGHTS",
    body: "Peer comparison, trend analysis, agent meta shifts. The stuff pros actually study.",
    href: "/player/CB10/Aegon",
  },
] as const;

function HeroTicker() {
  const liveCount = ESPORTS_FEED.filter((m) => m.status === "live").length;
  const anyLive = liveCount > 0;

  return (
    <div className="relative border border-white/[0.06] bg-[#0D0D10] p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-px w-6 shrink-0 bg-[#FF4655]" aria-hidden />
          <span className="font-mono-display text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
            LIVE & UPCOMING
          </span>
        </div>
        {anyLive ? (
          <span className="inline-flex items-center gap-2 bg-[#FF4655] px-2.5 py-1 font-mono-display text-[10px] font-bold uppercase tracking-[0.15em] text-white">
            <span className="size-1.5 rounded-full bg-white animate-pulse" />
            {liveCount} LIVE
          </span>
        ) : (
          <span className="border border-white/[0.1] px-2.5 py-1 font-mono-display text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
            UPCOMING
          </span>
        )}
      </div>
      <div className="divide-y divide-white/[0.06]">
        {ESPORTS_FEED.map((m) => (
          <div key={m.league + m.teamA.abbr + m.teamB.abbr} className="grid grid-cols-[50px_1fr_1fr_80px] items-center gap-3 py-3">
            <div
              className={`flex size-10 items-center justify-center font-mono-display text-[9px] font-bold uppercase leading-tight ${leagueBadgeClass(m.leagueKey)}`}
              style={{
                clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)",
              }}
            >
              {m.league.includes("VCT") ? "VCT" : "CHL"}
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <TeamLogo abbr={m.teamA.abbr} />
              <span className="font-display text-sm font-bold text-white">{m.teamA.abbr}</span>
              {m.status === "live" ? (
                <span
                  className={`font-mono-display text-[15px] font-bold tabular-nums ${
                    m.teamA.score > m.teamB.score
                      ? "text-[#00E5D1]"
                      : m.teamA.score === m.teamB.score
                        ? "text-white"
                        : "text-white/50"
                  }`}
                >
                  {m.teamA.score}
                </span>
              ) : null}
            </div>
            <div className="flex min-w-0 items-center justify-end gap-2">
              {m.status === "live" ? (
                <span
                  className={`font-mono-display text-[15px] font-bold tabular-nums ${
                    m.teamB.score > m.teamA.score
                      ? "text-[#00E5D1]"
                      : m.teamA.score === m.teamB.score
                        ? "text-white"
                        : "text-white/50"
                  }`}
                >
                  {m.teamB.score}
                </span>
              ) : null}
              <span className="font-display text-sm font-bold text-white">{m.teamB.abbr}</span>
              <TeamLogo abbr={m.teamB.abbr} />
            </div>
            <div className="text-right">
              {m.status === "live" ? (
                <>
                  <p className="font-mono-display text-[10px] font-bold uppercase text-[#FF4655]">
                    LIVE · MAP {m.map}
                  </p>
                  <p className="font-mono-display text-[9px] text-white/50">{m.currentScore}</p>
                </>
              ) : (
                <>
                  <p className="font-mono-display text-[10px] uppercase text-white/60">IN {m.startsIn.toUpperCase()}</p>
                  <p className="font-mono-display text-[9px] text-white/40">{m.date}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <Link
        href="/esports"
        className="group mt-4 inline-flex items-center gap-1 font-mono-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-[#FF4655]"
      >
        View all matches
        <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" aria-hidden />
      </Link>
      {/* TODO(backend): replace with real /api/esports/feed when available */}
    </div>
  );
}

function TeamLogo({ abbr }: { abbr: string }) {
  const initials = abbr.slice(0, 2).toUpperCase();
  return (
    <div className="flex size-5 shrink-0 items-center justify-center bg-white/[0.08] font-mono-display text-[9px] font-bold text-white/60">
      {initials}
    </div>
  );
}

function TeamLogoLg({ abbr }: { abbr: string }) {
  const initials = abbr.slice(0, 2).toUpperCase();
  return (
    <div className="flex size-8 shrink-0 items-center justify-center bg-white/[0.08] font-mono-display text-[10px] font-bold text-white/60 md:size-8">
      {initials}
    </div>
  );
}

function ExpandedMatchCardView({ card }: { card: ExpandedMatchCard }) {
  const isLive = card.status === "live";
  const isFinal = card.status === "final";
  const sA = card.teamA.score;
  const sB = card.teamB.score;
  const hasScores = sA != null && sB != null;

  return (
    <Link href="/esports" className="group relative block overflow-hidden border border-white/[0.06] bg-[#0D0D10] p-5 transition-colors hover:border-[#FF4655]/40">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex px-2 py-0.5 font-mono-display text-[9px] font-bold uppercase ${leagueBadgeClass(card.leagueKey)}`}
          style={{
            clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
          }}
        >
          {card.league}
        </span>
        <span
          className={`font-mono-display text-[10px] font-bold uppercase ${
            isLive ? "text-[#FF4655]" : isFinal ? "text-white/40" : "text-white/50"
          }`}
        >
          {isLive ? "LIVE" : isFinal ? "FINAL" : "UPCOMING"}
        </span>
      </div>
      <div className="my-5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col items-start gap-2">
          <TeamLogoLg abbr={card.teamA.abbr} />
          <span className="font-display text-lg font-black text-white md:text-xl">{card.teamA.abbr}</span>
        </div>
        <div className="flex shrink-0 flex-col items-center justify-center px-1">
          {isLive && hasScores ? (
            <div className="flex items-center gap-2 font-display text-2xl font-black tabular-nums md:text-[32px]">
              <span className={sA > sB ? "text-[#00E5D1]" : sA === sB ? "text-white" : "text-white/50"}>{sA}</span>
              <span className="text-white/30">–</span>
              <span className={sB > sA ? "text-[#00E5D1]" : sA === sB ? "text-white" : "text-white/50"}>{sB}</span>
            </div>
          ) : isFinal && hasScores ? (
            <div className="flex items-center gap-2 font-display text-2xl font-black tabular-nums text-white/80 md:text-[28px]">
              <span>{sA}</span>
              <span className="text-white/30">–</span>
              <span>{sB}</span>
            </div>
          ) : (
            <span className="font-mono-display text-base tracking-[0.3em] text-white/30">VS</span>
          )}
        </div>
        <div className="flex min-w-0 flex-col items-end gap-2">
          <TeamLogoLg abbr={card.teamB.abbr} />
          <span className="font-display text-lg font-black text-white md:text-xl">{card.teamB.abbr}</span>
        </div>
      </div>
      <div className="flex items-center justify-between font-mono-display text-[11px] text-white/50">
        <span>{card.mapLine ?? card.timeLine ?? "—"}</span>
        <span className={isLive ? "text-[#FF4655]" : ""}>{card.metaRight ?? "—"}</span>
      </div>
    </Link>
  );
}

function RankChevron({ rank }: { rank: number }) {
  if (rank > 3) {
    return <span className="font-mono-display text-sm tabular-nums text-white/60">{rank}</span>;
  }
  const bg = rank === 1 ? "bg-[#FFF6A1] text-[#0A0A0C]" : rank === 2 ? "bg-white/80 text-[#0A0A0C]" : "bg-[#A06A3B] text-white";
  return (
    <span
      className={`inline-flex min-w-[28px] items-center justify-center px-1.5 py-0.5 font-mono-display text-xs font-bold tabular-nums ${bg}`}
      style={{
        clipPath: "polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)",
      }}
    >
      {rank}
    </span>
  );
}

function TierBadge({ patched }: { patched: string }) {
  const { primary, glow } = lookupTierColors(patched);
  const isRadiant = tierKeyFromPatched(patched).toLowerCase() === "radiant";
  return (
    <span
      className="inline-flex max-w-[100px] truncate px-2 py-0.5 font-mono-display text-[9px] font-bold uppercase tracking-wide text-white"
      style={{
        background: `${primary}33`,
        boxShadow: isRadiant ? `0 0 12px ${glow}` : undefined,
        border: `1px solid ${primary}55`,
      }}
    >
      {tierKeyFromPatched(patched).toUpperCase()}
    </span>
  );
}

export default function HomeLanding() {
  const router = useRouter();
  const reduced = Boolean(useReducedMotion());
  const [searchQ, setSearchQ] = useState("");
  const [searchErr, setSearchErr] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderDisplay[]>(DISPLAY_FALLBACK);
  const [leaderboardSource, setLeaderboardSource] = useState<"live" | "fallback">("fallback");
  const [matchFilter, setMatchFilter] = useState<"live" | "today" | "week">("today");
  const [regionFilter, setRegionFilter] = useState<"ALL" | "EU" | "NA" | "APAC">("ALL");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/leaderboard/preview");
        if (!res.ok) return;
        const json = (await res.json()) as { rows?: LeaderboardRow[]; source?: string };
        if (!cancelled && json.rows && json.rows.length > 0) {
          setLeaderboard(json.rows.map((r) => ({ ...r, region: "NA" })));
          setLeaderboardSource("live");
        }
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMatches = useMemo(() => {
    return EXPANDED_MATCH_CARDS.filter((c) => c.filter === matchFilter);
  }, [matchFilter]);

  const filteredLeaderboard = useMemo(() => {
    if (regionFilter === "ALL") return leaderboard;
    return leaderboard.filter((r) => r.region === regionFilter);
  }, [leaderboard, regionFilter]);

  const onSearchSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const parsed = parseRiotId(searchQ);
      if (!parsed) {
        setSearchErr(true);
        return;
      }
      setSearchErr(false);
      router.push(`/player/${encodeURIComponent(parsed.name)}/${encodeURIComponent(parsed.tag)}`);
      setSearchQ("");
    },
    [router, searchQ]
  );

  return (
    <div className="overflow-x-hidden bg-[#0A0A0C] text-white">
      {/* ─── HERO ─── */}
      <section className="relative min-h-0 w-full overflow-hidden bg-[#0A0A0C] md:min-h-[560px]">
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
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.04]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, #fff 2px, #fff 3px)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,70,85,0.12) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-[1.1fr_1fr] md:px-12">
          <div>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.6, ease: heroEase }}
              className="flex items-center gap-2"
            >
              <span className="h-px w-6 shrink-0 bg-[#FF4655]" aria-hidden />
              <span className="font-mono-display text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
                VALORANT STATS PLATFORM
              </span>
            </motion.div>

            <motion.h1
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.6, delay: 0.08, ease: heroEase }}
              className="mt-4 font-display font-black leading-[0.95] tracking-[-0.02em] text-white"
              style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
            >
              YOUR EDGE <span className="text-[#FF4655]">{"// ONE PROFILE"}</span>
            </motion.h1>

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.6, delay: 0.16, ease: heroEase }}
              className="mt-4 max-w-[520px] font-sans-tight text-lg text-white/60"
            >
              Live VCT scores, match-level analytics, and rank-verified LFG — built for players who review their own
              demos, not just their career tab.
            </motion.p>

            <motion.form
              id="search"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.6, delay: 0.24, ease: heroEase }}
              onSubmit={onSearchSubmit}
              className="relative mt-8 max-w-[520px]"
            >
              <label className="relative block">
                <span className="sr-only">Search Riot ID</span>
                <Search className="pointer-events-none absolute left-5 top-1/2 size-[18px] -translate-y-1/2 text-white/40" />
                <input
                  value={searchQ}
                  onChange={(e) => {
                    setSearchQ(e.target.value);
                    setSearchErr(false);
                  }}
                  placeholder="Search Riot ID · e.g. CB10#Aegon"
                  className="h-14 w-full border border-white/[0.08] bg-[#13131A] py-3 pl-14 pr-32 font-mono-display text-[15px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#FF4655]"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 bg-[#FF4655] px-6 font-mono-display text-[12px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#ff5a69]"
                >
                  SEARCH →
                </button>
              </label>
              {searchErr ? (
                <p className="mt-2 font-mono-display text-[11px] text-[#FF4655]">
                  Use format Name#TAG (e.g. CB10#Aegon)
                </p>
              ) : null}
            </motion.form>

            <div className="mt-4">
              <p className="font-mono-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">TRENDING</p>
              <motion.div
                initial="hidden"
                animate="show"
                variants={
                  reduced
                    ? { hidden: {}, show: {} }
                    : {
                        hidden: {},
                        show: {
                          transition: { delayChildren: 0.4, staggerChildren: 0.05 },
                        },
                      }
                }
                className="mt-2 flex flex-wrap gap-2"
              >
                {TRENDING_PLAYERS.map((id) => (
                  <motion.div
                    key={id}
                    variants={
                      reduced
                        ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
                        : { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }
                    }
                  >
                    <Link
                      href={playerHref(id)}
                      className="inline-flex items-center gap-1.5 border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 font-mono-display text-[11px] text-white/70 transition-all hover:border-[#FF4655] hover:bg-white/[0.06] hover:text-white"
                      style={{
                        clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
                      }}
                    >
                      <Flame className="size-2.5 shrink-0 text-[#FF4655]" aria-hidden />
                      {id}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
              {/* TODO(backend): wire trending to most-searched-last-24h endpoint */}
            </div>
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.6, delay: 0.2, ease: heroEase }}
          >
            <HeroTicker />
          </motion.div>
        </div>
      </section>

      <StatsBand reduced={reduced} />

      {/* ─── FEATURES ─── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-center gap-2">
          <span className="h-px w-6 shrink-0 bg-[#FF4655]" aria-hidden />
          <span className="font-mono-display text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
            {"// WHAT CLUTCHSTATS DOES"}
          </span>
        </div>
        <h2 className="mt-3 font-display font-black text-white" style={{ fontSize: "clamp(28px, 3vw, 40px)" }}>
          Four tools. One profile.
        </h2>
        <p className="mt-3 max-w-[520px] font-sans-tight text-base text-white/50">
          Each piece is free to try. Pro unlocks the advanced analytics stack.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-px bg-white/[0.06] md:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.href} whileHover={reduced ? undefined : { y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                <Link
                  href={card.href}
                  className="group relative block overflow-hidden bg-[#0D0D10] p-6 transition-colors hover:bg-[#121218]"
                >
                  <span
                    className="pointer-events-none absolute right-0 top-0 size-2.5 bg-[#FF4655]"
                    style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
                    aria-hidden
                  />
                  <Icon
                    className="size-12 text-[#FF4655] opacity-80 transition-all group-hover:scale-105 group-hover:opacity-100"
                    strokeWidth={1}
                    aria-hidden
                  />
                  <h3 className="mt-6 font-display text-[22px] font-black text-white">{card.title}</h3>
                  <p className="mt-1 font-mono-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                    {card.sublabel}
                  </p>
                  <p className="mt-3 line-clamp-2 font-sans-tight text-sm text-white/60">{card.body}</p>
                  <span className="pointer-events-none absolute bottom-5 right-5 text-white/30 transition-all group-hover:translate-x-1 group-hover:text-[#FF4655]">
                    →
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── LIVE & UPCOMING (expanded) ─── */}
      <section className="bg-[#0A0A0C] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-px w-6 shrink-0 bg-[#FF4655]" aria-hidden />
                <span className="font-mono-display text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
                  {"// LIVE & UPCOMING"}
                </span>
              </div>
              <h2 className="mt-2 font-display font-black text-white" style={{ fontSize: "clamp(28px, 3vw, 40px)" }}>
                Track the pros
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["LIVE", "TODAY", "WEEK"] as const).map((label) => {
                const key = label === "LIVE" ? "live" : label === "TODAY" ? "today" : "week";
                const active = matchFilter === key;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setMatchFilter(key)}
                    className={`border px-3 py-1.5 font-mono-display text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                      active
                        ? "border-[#FF4655] bg-[#FF4655] text-white"
                        : "border-white/[0.08] bg-white/[0.03] text-white/60 hover:bg-white/[0.06]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMatches.length ? (
              filteredMatches.map((c) => (
                <motion.div key={c.id} whileHover={reduced ? undefined : { y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                  <ExpandedMatchCardView card={c} />
                </motion.div>
              ))
            ) : (
              <p className="col-span-full font-mono-display text-sm text-white/40">No matches for this filter.</p>
            )}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/esports"
              className="font-mono-display text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-[#FF4655]"
            >
              View all esports →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── LEADERBOARD ─── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-px w-6 shrink-0 bg-[#FF4655]" aria-hidden />
              <span className="font-mono-display text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
                {"// LEADERBOARD"}
              </span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-black text-white md:text-3xl">Top players — this act</h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["ALL", "NA", "EU", "APAC"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRegionFilter(r)}
                className={`border px-2.5 py-1 font-mono-display text-[10px] font-bold uppercase tracking-wide transition-colors ${
                  regionFilter === r
                    ? "border-[#FF4655] bg-[#FF4655] text-white"
                    : "border-white/[0.08] bg-white/[0.03] text-white/60 hover:bg-white/[0.06]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 font-mono-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
          Act ends in 10d 9h · V26: A2
        </p>
        <p className="mt-2 text-center font-mono-display text-[11px] text-white/40">
          {leaderboardSource === "live"
            ? "(Live preview — regional filters are approximate)"
            : "(Sample data — live leaderboard coming soon)"}
        </p>
        {/* TODO(backend): real leaderboard query */}

        <motion.table
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={
            reduced
              ? { hidden: {}, show: {} }
              : { hidden: {}, show: { transition: { staggerChildren: 0.03, delayChildren: 0.05 } } }
          }
          className="mt-6 w-full border-collapse border border-white/[0.06] bg-[#0D0D10]"
        >
          <thead>
            <tr className="h-10 border-b border-white/[0.08] text-left font-mono-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
              <th className="w-14 px-3 text-right">RANK</th>
              <th className="px-3">PLAYER</th>
              <th className="hidden px-3 md:table-cell">REGION</th>
              <th className="px-3">TIER</th>
              <th className="px-3 text-right">RR</th>
              <th className="hidden px-3 text-right md:table-cell">WINS</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaderboard.map((row, idx) => {
              const pos = row.leaderboardRank || idx + 1;
              const rankMeta = getRankByTier(row.tier);
              const href = playerHref(`${row.name}#${row.tag}`);
              return (
                <motion.tr
                  key={`${row.name}-${row.tag}-${pos}`}
                  variants={
                    reduced
                      ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
                      : { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }
                  }
                  className="cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
                  onClick={() => router.push(href)}
                >
                  <td className="px-3 py-3 text-right align-middle">
                    <RankChevron rank={pos} />
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="flex size-7 shrink-0 items-center justify-center bg-[#13131A] font-display text-xs font-black text-[#FF4655]">
                        {(row.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-display text-sm font-medium text-white">{row.name}</span>
                        <span className="ml-1 font-mono-display text-xs text-white/40">#{row.tag}</span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3 align-middle font-mono-display text-[11px] font-bold uppercase tracking-[0.15em] text-white/60 md:table-cell">
                    {row.region}
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <TierBadge patched={rankMeta.name} />
                  </td>
                  <td className="px-3 py-3 text-right align-middle font-mono-display text-sm tabular-nums text-white">
                    {row.rr}
                  </td>
                  <td className="hidden px-3 py-3 text-right align-middle font-mono-display text-sm tabular-nums text-white/70 md:table-cell">
                    {row.wins}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </motion.table>

        <div className="mt-8 flex justify-center">
          <Link
            href="/leaderboard"
            className="border border-white/[0.08] bg-white/[0.03] px-6 py-3 font-mono-display text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 transition-colors hover:bg-white/[0.06]"
          >
            View full leaderboard →
          </Link>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative mt-12 overflow-hidden bg-[#0A0A0C] py-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,70,85,0.15) 0%, transparent 70%)",
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
        <div className="pointer-events-none absolute left-0 top-0 h-full w-[3px] bg-[#FF4655]" />

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={reduced ? { duration: 0 } : { duration: 0.55, ease: heroEase }}
          className="relative z-[1] mx-auto max-w-3xl px-6 text-center"
        >
          <p className="font-mono-display text-[11px] font-bold uppercase tracking-[0.3em] text-[#FF4655]">
            FREE TO START · NO CARD REQUIRED
          </p>
          <h2 className="mt-3 font-display font-black leading-[1.05] text-white" style={{ fontSize: "clamp(36px, 4.5vw, 56px)" }}>
            Stop guessing. See your edge.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-sans-tight text-[17px] text-white/60">
            Free tier covers your last 20 matches and core stats. Pro adds full history, trend analysis, and peer
            comparison.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <motion.a
              href="/#search"
              whileTap={reduced ? undefined : { scale: 0.97 }}
              className="inline-flex items-center justify-center bg-[#FF4655] px-8 py-3 font-mono-display text-[13px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-[#ff5a69] hover:-translate-y-px"
              style={{
                clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
              }}
            >
              SEARCH YOUR PROFILE →
            </motion.a>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center border border-white/[0.15] bg-transparent px-8 py-3 font-mono-display text-[13px] font-bold uppercase tracking-[0.15em] text-white/70 transition-all hover:border-white/40 hover:text-white"
            >
              VIEW PRICING
            </Link>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-2 font-mono-display text-[11px] text-white/50 sm:flex-row sm:gap-4">
            <span>★ 4.8 ON DISCORD</span>
            <span className="hidden text-white/30 sm:inline">·</span>
            <span>147K PLAYERS TRACKED</span>
            <span className="hidden text-white/30 sm:inline">·</span>
            <span>USED BY 12 VCT PROS</span>
          </div>
          {/* TODO(marketing): replace social proof strip with real numbers once Discord reviews / pro endorsements exist */}
        </motion.div>
      </section>
    </div>
  );
}
