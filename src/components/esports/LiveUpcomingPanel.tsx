"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Bell, CalendarOff, Clock, Tv } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { FetchErrorPanel } from "@/components/ui/FetchErrorPanel";
import {
  extractMatchId,
  normalizeLogoUrl,
  type LiveMatchSegment,
  type UpcomingMatchSegment,
} from "@/lib/vlr/matches";
import { FlagTag } from "./FlagTag";
import { TeamLogo } from "./TeamLogo";

const REGIONS = ["all", "amer", "emea", "pac", "cn", "other"] as const;
const TIERS = ["all", "vct", "challengers", "gc", "other"] as const;

type RegionKey = (typeof REGIONS)[number];
type TierKey = (typeof TIERS)[number];

function parseRegion(s: string | null): RegionKey {
  const v = (s ?? "").toLowerCase();
  return REGIONS.includes(v as RegionKey) ? (v as RegionKey) : "all";
}

function parseTier(s: string | null): TierKey {
  const v = (s ?? "").toLowerCase();
  return TIERS.includes(v as TierKey) ? (v as TierKey) : "all";
}

function regionMatch(text: string, region: RegionKey): boolean {
  if (region === "all") return true;
  const s = text.toLowerCase();
  const amer =
    /\bamericas\b|\bvct amer\b|\bvct americas\b|north america|\blatam\b|\bsa\b(?!\w)|\bmibr\b|\bkru\b|\bloud\b/i.test(s);
  const emea =
    /\bemea\b|\bvct emea\b|\beurope\b|\betom\b|\bfnatic\b|\bfnc\b|\bfut\b|\bm8\b|\bvit\b/i.test(s);
  const pac =
    /\bpacific\b|\bvct pac\b|\bapac\b|\bjapan\b|\bkorea\b|\bsea\b|\bdrx\b|\bprx\b|\bzeta\b|\bgeng\b|\bt1\b/i.test(s);
  const cn = /\bchina\b|\bvct cn\b|\bcn\b(?!\w)|\bedward\b|\bing\b/i.test(s);

  if (region === "amer") return amer;
  if (region === "emea") return emea;
  if (region === "pac") return pac && !cn;
  if (region === "cn") return cn;
  return !amer && !emea && !pac && !cn;
}

function tierMatch(text: string, tier: TierKey): boolean {
  if (tier === "all") return true;
  const s = text.toLowerCase();
  const hasVct = /\bvct\b/i.test(s);
  const hasChal = /challengers/i.test(s);
  const hasGc = /game\s*changers|gamechangers/i.test(s);
  if (tier === "vct") return hasVct;
  if (tier === "challengers") return hasChal;
  if (tier === "gc") return hasGc;
  return !hasVct && !hasChal && !hasGc;
}

function liveEventLabel(s: LiveMatchSegment): string {
  return `${s.match_event} ${s.match_series}`.trim();
}

function formatLocalFromUnix(raw: string | number | null | undefined): string {
  if (raw == null || raw === "") return "TBD";
  const n = typeof raw === "string" ? Number(raw) : raw;
  if (!Number.isFinite(n)) return "TBD";
  const ms = n > 1e11 ? n : n * 1000;
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(ms));
}

function ensureVlrUrl(matchPage: string): string {
  if (!matchPage) return "";
  if (matchPage.startsWith("http")) return matchPage;
  const path = matchPage.startsWith("/") ? matchPage : `/${matchPage}`;
  return `https://www.vlr.gg${path}`;
}

function pillBase(active: boolean): string {
  return [
    "rounded-none border px-3 py-1.5 font-mono-display text-[10px] uppercase tracking-[0.2em] transition-colors",
    active
      ? "border-[#FF4655] bg-[#FF4655] text-white"
      : "border-white/[0.08] bg-white/[0.03] text-white/60 hover:bg-white/[0.06]",
  ].join(" ");
}

export function LiveUpcomingLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-16 animate-pulse rounded-none bg-white/[0.06]" />
        ))}
      </div>
      <div className="h-44 animate-pulse rounded-none border border-white/[0.06] bg-[#0D0D10]" />
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-none border border-white/[0.06] bg-[#0D0D10]" />
        ))}
      </div>
    </div>
  );
}

function LiveUpcomingInner() {
  const reduced = Boolean(useReducedMotion());
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const region = parseRegion(searchParams.get("region"));
  const tier = parseTier(searchParams.get("tier"));

  const setFilter = useCallback(
    (next: Partial<{ region: RegionKey; tier: TierKey }>) => {
      const p = new URLSearchParams(searchParams.toString());
      const r = next.region ?? region;
      const t = next.tier ?? tier;
      if (r === "all") p.delete("region");
      else p.set("region", r);
      if (t === "all") p.delete("tier");
      else p.set("tier", t);
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, region, router, searchParams, tier]
  );

  const [live, setLive] = useState<LiveMatchSegment[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingMatchSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(false);
    try {
      const res = await fetch("/api/esports/live-feed", { cache: "no-store" });
      if (!res.ok) throw new Error("feed");
      const j = (await res.json()) as { live: LiveMatchSegment[]; upcoming: UpcomingMatchSegment[] };
      setLive(Array.isArray(j.live) ? j.live : []);
      setUpcoming(Array.isArray(j.upcoming) ? j.upcoming : []);
    } catch {
      setErr(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredLive = useMemo(() => {
    return live.filter((s) => {
      const t = liveEventLabel(s);
      return regionMatch(t, region) && tierMatch(t, tier);
    });
  }, [live, region, tier]);

  const filteredUpcoming = useMemo(() => {
    return upcoming.filter((s) => {
      const t = s.tournament_name;
      return regionMatch(t, region) && tierMatch(t, tier);
    });
  }, [upcoming, region, tier]);

  const liveIds = useMemo(() => {
    const ids = new Set<string>();
    for (const s of filteredLive) {
      const id = extractMatchId(s.match_page);
      if (id) ids.add(id);
    }
    return ids;
  }, [filteredLive]);

  const upcomingOnly = useMemo(() => {
    return filteredUpcoming.filter((u) => {
      const id = extractMatchId(u.match_page);
      return !id || !liveIds.has(id);
    });
  }, [filteredUpcoming, liveIds]);

  if (loading) {
    return <LiveUpcomingLoadingSkeleton />;
  }

  if (err) {
    return (
      <FetchErrorPanel
        title="Matches unavailable"
        message="We couldn’t reach the match feed. This is usually temporary — try again in a moment."
        onRetry={load}
      />
    );
  }

  const completelyEmpty = filteredLive.length === 0 && upcomingOnly.length === 0;

  if (completelyEmpty) {
    return (
      <>
        <FilterBar region={region} tier={tier} onChange={setFilter} />
        <div className="mt-8 rounded-none border border-dashed border-white/15 bg-background/80 px-6 py-14 text-center">
          <CalendarOff className="mx-auto size-10 text-text-secondary" aria-hidden />
          <p className="mt-4 font-heading text-sm font-bold uppercase tracking-wide text-text-primary">
            No matches scheduled
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            There’s nothing in this filter set right now. Try All / a different region, or check back
            after announcements.
          </p>
          <Link
            href="/esports"
            className="mt-6 inline-flex font-semibold text-accent-blue underline-offset-4 hover:underline"
          >
            Reset filters →
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-10">
      <FilterBar region={region} tier={tier} onChange={setFilter} />

      {filteredLive.map((seg, idx) => (
        <LiveMatchCard key={`${seg.match_page}-${idx}`} segment={seg} reduced={reduced} />
      ))}

      <div>
        <h3 className="font-mono-display text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
          Upcoming
        </h3>
        {upcomingOnly.length === 0 ? (
          <div className="mt-4 rounded-none border border-white/[0.08] bg-[#0D0D10] px-5 py-10 text-center">
            <p className="font-display text-sm font-semibold text-white">
              {filteredLive.length > 0 ? "No other upcoming matches" : "Calendar is quiet"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/45">
              {filteredLive.length > 0
                ? "Everything else on the feed is either live or not listed yet."
                : "When organisers publish fixtures, they’ll show up here automatically."}
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {upcomingOnly.map((m, i) => (
              <UpcomingMatchCard key={`${m.match_page}-${i}`} segment={m} reduced={reduced} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterBar({
  region,
  tier,
  onChange,
}: {
  region: RegionKey;
  tier: TierKey;
  onChange: (next: Partial<{ region: RegionKey; tier: TierKey }>) => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-6 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="mb-2 font-mono-display text-[9px] uppercase tracking-[0.25em] text-white/35">
          Region
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["all", "All"],
              ["amer", "AMER"],
              ["emea", "EMEA"],
              ["pac", "PAC"],
              ["cn", "CN"],
              ["other", "Other"],
            ] as const
          ).map(([key, label]) => (
            <button key={key} type="button" className={pillBase(region === key)} onClick={() => onChange({ region: key })}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 font-mono-display text-[9px] uppercase tracking-[0.25em] text-white/35">
          Event tier
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ["all", "All"],
              ["vct", "VCT"],
              ["challengers", "Challengers"],
              ["gc", "Game Changers"],
              ["other", "Other"],
            ] as const
          ).map(([key, label]) => (
            <button key={key} type="button" className={pillBase(tier === key)} onClick={() => onChange({ tier: key })}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LiveMatchCard({ segment, reduced }: { segment: LiveMatchSegment; reduced: boolean }) {
  const id = extractMatchId(segment.match_page);
  const detailHref = id ? `/esports/match/${id}` : null;
  const external = ensureVlrUrl(segment.match_page);
  const s1 = Number.parseInt(segment.score1, 10);
  const s2 = Number.parseInt(segment.score2, 10);
  const t1Lead = Number.isFinite(s1) && Number.isFinite(s2) && s1 > s2;
  const t2Lead = Number.isFinite(s1) && Number.isFinite(s2) && s2 > s1;
  const tie = Number.isFinite(s1) && Number.isFinite(s2) && s1 === s2;

  const mapLine = [
    `MAP ${segment.map_number}`,
    segment.current_map,
    segment.team1_round_ct != null || segment.team1_round_t != null
      ? `${segment.team1_round_ct ?? "–"}-${segment.team1_round_t ?? "–"} vs ${segment.team2_round_ct ?? "–"}-${segment.team2_round_t ?? "–"}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-visible rounded-none border border-[#FF4655]/40 bg-[#0D0D10] p-5"
    >
      <div
        className="pointer-events-none absolute bottom-0 left-0 top-0 w-[4px] bg-[#FF4655] esports-live-edge-glow"
        aria-hidden
      />
      <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-[auto_1fr_auto_auto]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 bg-[#FF4655] px-2.5 py-1 font-mono-display text-[11px] uppercase tracking-[0.2em] text-white">
            <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden />
            LIVE
          </span>
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <TeamLogo
                logoUrl={normalizeLogoUrl(segment.team1_logo)}
                name={segment.team1}
                size={28}
                className="shrink-0"
              />
              <span className="font-display text-lg font-black leading-none text-white sm:text-[18px]">
                {segment.team1}
              </span>
              <FlagTag code={segment.flag1} />
            </div>
            <span className="hidden font-mono-display text-[12px] tracking-[0.3em] text-white/30 sm:inline">
              VS
            </span>
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
              <FlagTag code={segment.flag2} />
              <span className="font-display text-lg font-black leading-none text-white sm:text-[18px]">
                {segment.team2}
              </span>
              <TeamLogo
                logoUrl={normalizeLogoUrl(segment.team2_logo)}
                name={segment.team2}
                size={28}
                className="shrink-0"
              />
            </div>
          </div>
          <p className="font-mono-display text-[11px] uppercase tracking-[0.2em] text-white/50">{mapLine}</p>
        </div>

        <div className="flex items-center justify-center gap-3 tabular-nums md:justify-end">
          <span
            className={`font-display text-[clamp(32px,3vw,44px)] font-black ${
              t1Lead ? "text-[#00E5D1]" : tie ? "text-white" : "text-white/50"
            }`}
          >
            {segment.score1}
          </span>
          <span className="font-display text-2xl font-bold text-white/30">:</span>
          <span
            className={`font-display text-[clamp(32px,3vw,44px)] font-black ${
              t2Lead ? "text-[#00E5D1]" : tie ? "text-white" : "text-white/50"
            }`}
          >
            {segment.score2}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {detailHref ? (
            <Link
              href={detailHref}
              className="inline-flex items-center gap-2 bg-white/[0.06] px-3 py-2 font-mono-display text-[11px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#FF4655]"
            >
              WATCH →
            </Link>
          ) : external ? (
            <a
              href={external}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/[0.06] px-3 py-2 font-mono-display text-[11px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#FF4655]"
            >
              WATCH (VLR) →
            </a>
          ) : (
            <span className="font-mono-display text-[11px] uppercase tracking-[0.2em] text-white/35">
              No watch link
            </span>
          )}
          <Tv className="size-4 text-white/35" aria-hidden />
        </div>
      </div>

      <p className="mt-4 font-mono-display text-[10px] uppercase tracking-[0.2em] text-white/40">
        {segment.match_event} · {segment.match_series}
      </p>
    </motion.div>
  );
}

function UpcomingMatchCard({
  segment,
  reduced,
}: {
  segment: UpcomingMatchSegment;
  reduced: boolean;
}) {
  const id = extractMatchId(segment.match_page);
  const clickable = Boolean(id);
  const [notified, setNotified] = useState(false);

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex max-w-[80%] items-center gap-1.5 font-mono-display text-[10px] uppercase tracking-[0.2em] text-white/60">
          {segment.tournament_icon && normalizeLogoUrl(segment.tournament_icon) ? (
            <Image
              src={normalizeLogoUrl(segment.tournament_icon)!}
              alt=""
              width={14}
              height={14}
              className="size-3.5 object-contain opacity-90"
              unoptimized
            />
          ) : null}
          <span className="truncate">{segment.tournament_name}</span>
        </span>
        <span className="shrink-0 font-mono-display text-[10px] text-white/40">
          IN {segment.time_until_match}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <TeamLogo
            logoUrl={normalizeLogoUrl(segment.team1_logo)}
            name={segment.team1}
            size={32}
          />
          <span className="truncate font-display text-[15px] font-bold text-white">{segment.team1}</span>
          <FlagTag code={segment.flag1} />
        </div>
        <span className="hidden font-mono-display text-[11px] tracking-[0.3em] text-white/30 sm:inline">vs</span>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:ml-auto">
          <FlagTag code={segment.flag2} />
          <span className="truncate font-display text-[15px] font-bold text-white">{segment.team2}</span>
          <TeamLogo
            logoUrl={normalizeLogoUrl(segment.team2_logo)}
            name={segment.team2}
            size={32}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] pt-3">
        <span className="inline-flex items-center gap-1.5 font-mono-display text-[10px] text-white/50">
          <Clock className="size-3.5 text-white/35" aria-hidden />
          {formatLocalFromUnix(segment.unix_timestamp)}
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-white/40 transition-colors hover:text-[#FF4655]"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setNotified((v) => !v);
          }}
        >
          <Bell className={`size-3.5 ${notified ? "text-[#FF4655]" : ""}`} aria-hidden />
          <span className="font-mono-display text-[9px] uppercase tracking-[0.2em]">
            {notified ? "SET" : "ALERT"}
          </span>
        </button>
      </div>
    </>
  );

  const cardClass = [
    "group block rounded-none border p-4 transition-colors",
    clickable
      ? "cursor-pointer border-white/[0.06] bg-[#0D0D10] hover:border-[#FF4655]/40"
      : "cursor-default border-white/[0.06] bg-[#0D0D10]",
  ].join(" ");

  if (clickable) {
    return (
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0 } : { delay: 0.04 }}
      >
        <Link href={`/esports/match/${id}`} className={cardClass}>
          {inner}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cardClass}
    >
      {inner}
    </motion.div>
  );
}

export function LiveUpcomingPanel() {
  return (
    <Suspense fallback={<LiveUpcomingLoadingSkeleton />}>
      <LiveUpcomingInner />
    </Suspense>
  );
}
