"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, ExternalLink, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchVlrProxy, unwrapSegments } from "@/lib/esports/vlr-client-fetch";
import { TeamLogo } from "./TeamLogo";
import { TEAM_LOGOS } from "@/lib/constants/team-logos";

type MatchData = {
  id: string;
  team1Name: string;
  team2Name: string;
  team1Score: number | null;
  team2Score: number | null;
  team1Won: boolean;
  tournament: string;
  event: string;
  eventImg: string;
  status: "live" | "upcoming" | "completed";
  timeLabel: string;
  unixTimestamp: number | null;
  ago: string;
  country1: string;
  country2: string;
};

function formatDate(unix: number | null): string {
  if (!unix) return "TBD";
  const ms = unix > 1e11 ? unix : unix * 1000;
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(ms));
}

function countryFlag(code: string): string {
  const c = code.toUpperCase();
  if (c.length !== 2) return "";
  const codePoints = Array.from(c).map((ch) => 0x1f1e0 + ch.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

function parseMatch(raw: unknown): MatchData | null {
  const m = raw as Record<string, unknown>;
  if (!m || !m.id) return null;
  const teams = Array.isArray(m.teams) ? (m.teams as Array<Record<string, unknown>>) : [];
  const t1 = teams[0] ?? {};
  const t2 = teams[1] ?? {};
  const statusRaw = String(m.status ?? "").toUpperCase();
  const isCompleted = statusRaw === "COMPLETED";
  const isLive = statusRaw === "LIVE";

  return {
    id: String(m.id),
    team1Name: String(t1.name ?? "TBD"),
    team2Name: String(t2.name ?? "TBD"),
    team1Score: t1.score != null && t1.score !== "" ? Number(t1.score) : null,
    team2Score: t2.score != null && t2.score !== "" ? Number(t2.score) : null,
    team1Won: Boolean(t1.won),
    tournament: String(m.tournament ?? m.event ?? ""),
    event: String(m.event ?? ""),
    eventImg: String(m.img ?? ""),
    status: isLive ? "live" : isCompleted ? "completed" : "upcoming",
    timeLabel: String(m.in ?? m.ago ?? ""),
    unixTimestamp: m.timestamp ? Number(m.timestamp) : null,
    ago: String(m.ago ?? ""),
    country1: String(t1.country ?? ""),
    country2: String(t2.country ?? ""),
  };
}

export function MatchDetailClient({ matchId }: { matchId: string }) {
  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // Search results and upcoming/live for this match ID
        const [resultsRaw, upcomingRaw, liveRaw] = await Promise.all([
          fetchVlrProxy<unknown>("/match?q=results").catch(() => null),
          fetchVlrProxy<unknown>("/match?q=upcoming").catch(() => null),
          fetchVlrProxy<unknown>("/match?q=live_score").catch(() => null),
        ]);

        const allRaw = [resultsRaw, upcomingRaw, liveRaw].filter(Boolean);
        let found: MatchData | null = null;

        for (const raw of allRaw) {
          const segments = unwrapSegments<unknown>(raw);
          const match = segments.find((s) => {
            const m = s as Record<string, unknown>;
            return String(m.id) === matchId;
          });
          if (match) {
            found = parseMatch(match);
            break;
          }
        }

        if (!cancelled) {
          if (found) setMatch(found);
          else setNotFound(true);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [matchId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 animate-pulse rounded-2xl border border-surface-light bg-surface" />
        <div className="h-32 animate-pulse rounded-xl border border-surface-light bg-surface" />
      </div>
    );
  }

  if (notFound || !match) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-surface/80 px-6 py-16 text-center">
        <Trophy className="mx-auto size-12 text-text-secondary" />
        <p className="mt-4 font-heading text-lg font-bold text-text-primary">Match not found</p>
        <p className="mt-2 text-sm text-text-secondary">
          This match may have expired from our feed or the ID is incorrect.
        </p>
        <Link
          href="/esports"
          className="mt-6 inline-flex items-center gap-2 font-semibold text-accent-blue underline-offset-4 hover:underline"
        >
          ← Back to Esports Hub
        </Link>
      </div>
    );
  }

  const logo1 = TEAM_LOGOS[match.team1Name] ?? null;
  const logo2 = TEAM_LOGOS[match.team2Name] ?? null;
  const isCompleted = match.status === "completed";
  const isLive = match.status === "live";

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-2xl border border-surface-light bg-surface"
      >
        {/* Tournament banner */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
          <div className="flex items-center gap-2">
            {match.eventImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={match.eventImg}
                alt=""
                className="size-6 rounded object-contain"
              />
            ) : null}
            <span className="font-heading text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {match.tournament}
            </span>
            {match.event ? (
              <span className="text-text-secondary/50">·</span>
            ) : null}
            <span className="font-heading text-xs text-text-secondary/70">{match.event}</span>
          </div>
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="flex items-center gap-1.5 rounded-full bg-accent-red/15 px-2.5 py-1 font-heading text-[10px] font-bold uppercase tracking-wider text-accent-red">
                <span className="size-1.5 animate-pulse rounded-full bg-accent-red" />
                LIVE
              </span>
            )}
            <a
              href={`https://www.vlr.gg/${matchId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-body text-xs text-text-secondary transition-colors hover:text-accent-blue"
            >
              <ExternalLink className="size-3" />
              vlr.gg
            </a>
          </div>
        </div>

        {/* Teams vs Score */}
        <div className="grid grid-cols-3 items-center gap-4 px-6 py-8 sm:py-10">
          {/* Team 1 */}
          <div className={`flex flex-col items-center gap-3 text-center ${isCompleted && !match.team1Won ? "opacity-50" : ""}`}>
            <TeamLogo name={match.team1Name} logoUrl={logo1} size={72} />
            <div>
              <p className="font-heading text-lg font-bold text-text-primary">{match.team1Name}</p>
              {match.country1 ? (
                <p className="mt-0.5 font-body text-sm text-text-secondary">
                  {countryFlag(match.country1)} {match.country1.toUpperCase()}
                </p>
              ) : null}
            </div>
            {isCompleted && match.team1Won && (
              <span className="flex items-center gap-1 rounded-full bg-win/15 px-2.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-win">
                <Trophy className="size-3" />
                Winner
              </span>
            )}
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-2">
            {isCompleted || isLive ? (
              <p className="font-heading text-5xl font-bold tabular-nums text-text-primary sm:text-6xl">
                <span className={match.team1Won ? "text-win" : "text-text-primary"}>
                  {match.team1Score ?? 0}
                </span>
                <span className="px-3 text-text-secondary/50">–</span>
                <span className={!match.team1Won && isCompleted ? "text-win" : "text-text-primary"}>
                  {match.team2Score ?? 0}
                </span>
              </p>
            ) : (
              <p className="font-heading text-3xl font-bold text-text-secondary">VS</p>
            )}
            <span className={`rounded-full px-3 py-1 font-heading text-xs font-semibold uppercase tracking-wide ${
              isLive
                ? "bg-accent-red/15 text-accent-red"
                : isCompleted
                ? "bg-surface-lighter text-text-secondary"
                : "bg-accent-blue/10 text-accent-blue"
            }`}>
              {isLive ? "Live" : isCompleted ? "Final" : "Upcoming"}
            </span>
          </div>

          {/* Team 2 */}
          <div className={`flex flex-col items-center gap-3 text-center ${isCompleted && match.team1Won ? "opacity-50" : ""}`}>
            <TeamLogo name={match.team2Name} logoUrl={logo2} size={72} />
            <div>
              <p className="font-heading text-lg font-bold text-text-primary">{match.team2Name}</p>
              {match.country2 ? (
                <p className="mt-0.5 font-body text-sm text-text-secondary">
                  {countryFlag(match.country2)} {match.country2.toUpperCase()}
                </p>
              ) : null}
            </div>
            {isCompleted && !match.team1Won && (
              <span className="flex items-center gap-1 rounded-full bg-win/15 px-2.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-win">
                <Trophy className="size-3" />
                Winner
              </span>
            )}
          </div>
        </div>

        {/* Time */}
        {(match.unixTimestamp || match.ago || match.timeLabel) && (
          <div className="border-t border-white/5 px-5 py-3 text-center">
            {match.unixTimestamp ? (
              <span className="flex items-center justify-center gap-1.5 font-body text-xs text-text-secondary">
                <Calendar className="size-3.5" />
                {formatDate(match.unixTimestamp)}
              </span>
            ) : match.ago ? (
              <span className="flex items-center justify-center gap-1.5 font-body text-xs text-text-secondary">
                <Clock className="size-3.5" />
                {match.ago} ago
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5 font-body text-xs text-text-secondary">
                <Clock className="size-3.5" />
                {match.timeLabel}
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* No deep stats notice */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.4 }}
        className="rounded-xl border border-white/5 bg-surface/60 px-5 py-4 text-center text-sm text-text-secondary"
      >
        Per-map player stats are not available through our current data source.{" "}
        <a
          href={`https://www.vlr.gg/${matchId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-accent-blue underline-offset-4 hover:underline"
        >
          Full stats on vlr.gg <ExternalLink className="size-3" />
        </a>
      </motion.div>
    </div>
  );
}
