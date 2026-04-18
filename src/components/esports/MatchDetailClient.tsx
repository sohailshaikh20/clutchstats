"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bomb,
  Calendar,
  ExternalLink,
  Shield,
  Star,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TEAM_LOGOS } from "@/lib/constants/team-logos";
import type {
  ClutchMatchDetailPayload,
  ClutchMatchMapDetail,
  ClutchPlayerStatRow,
  ClutchRoundOutcome,
} from "@/types/clutch-match-detail";
import { TeamLogo } from "./TeamLogo";

type ValMap = { displayName: string; listViewIcon: string; splash: string };

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

function mapAssetsByName(maps: ValMap[]): Map<string, ValMap> {
  const m = new Map<string, ValMap>();
  for (const x of maps) {
    m.set(x.displayName.toLowerCase(), x);
  }
  return m;
}

function mvpFor(map: ClutchMatchMapDetail): { side: "a" | "b"; id: string } | null {
  const all = [...map.teamAPlayers, ...map.teamBPlayers];
  if (!all.length) return null;
  let best = all[0]!;
  for (const p of all) {
    if (p.rating > best.rating) best = p;
  }
  const a = map.teamAPlayers.some((p) => p.playerId === best.playerId);
  return { side: a ? "a" : "b", id: best.playerId };
}

function RoundDot({ outcome, winner }: { outcome: ClutchRoundOutcome; winner: "a" | "b" }) {
  const aWin = winner === "a";
  const fill = aWin ? "#4AE3A7" : "#FF4655";
  const icon =
    outcome === "a_spike" || outcome === "b_defuse" ? (
      outcome === "a_spike" ? (
        <Bomb className="size-2.5 text-background" aria-hidden />
      ) : (
        <Shield className="size-2.5 text-background" aria-hidden />
      )
    ) : null;

  return (
    <div
      className="relative flex size-6 shrink-0 items-center justify-center rounded-full border border-white/10"
      style={{ backgroundColor: fill }}
      title={`${aWin ? "Team A" : "Team B"} — ${outcome.replace("_", " ")}`}
    >
      {icon}
    </div>
  );
}

function StatTable({
  teamName,
  logoUrl,
  players,
  mvpId,
  reduced,
}: {
  teamName: string;
  logoUrl: string | null;
  players: ClutchPlayerStatRow[];
  mvpId: string | null;
  reduced: boolean;
}) {
  const rowVariants = {
    hidden: { opacity: 0, y: 6 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: reduced ? 0 : i * 0.05, duration: 0.25 },
    }),
  };

  return (
    <div className="mb-8 overflow-x-auto rounded-xl border border-white/10">
      <div className="flex items-center gap-3 border-b border-white/10 bg-surface-light px-4 py-3">
        <TeamLogo name={teamName} logoUrl={logoUrl} size={32} />
        <span className="font-heading text-sm font-bold uppercase tracking-wide text-text-primary">
          {teamName}
        </span>
      </div>
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead>
          <tr className="bg-surface-light font-body text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
            <th className="sticky left-0 z-10 bg-surface-light px-3 py-2">Player</th>
            <th className="px-2 py-2 text-right">Rtg</th>
            <th className="px-2 py-2 text-right">ACS</th>
            <th className="px-2 py-2 text-right">K</th>
            <th className="px-2 py-2 text-right">D</th>
            <th className="px-2 py-2 text-right">A</th>
            <th className="px-2 py-2 text-right">+/-</th>
            <th className="px-2 py-2 text-right">KAST</th>
            <th className="px-2 py-2 text-right">ADR</th>
            <th className="px-2 py-2 text-right">HS%</th>
            <th className="px-2 py-2 text-right">FK</th>
            <th className="px-2 py-2 text-right">FD</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => {
            const isMvp = mvpId === p.playerId;
            const rtg = p.rating;
            const rtgClass = rtg >= 1.2 ? "text-win" : rtg <= 0.8 ? "text-loss" : "text-text-primary";
            const hsClass = p.hsPct >= 30 ? "text-win" : p.hsPct <= 15 ? "text-loss" : "text-text-primary";
            const fkClass = p.fk > p.fd ? "text-win" : "text-text-secondary";
            const fdClass = p.fd > p.fk ? "text-loss" : "text-text-secondary";
            return (
              <motion.tr
                key={p.playerId}
                custom={i}
                variants={rowVariants}
                initial="hidden"
                animate="show"
                className={`border-b border-white/5 transition-colors hover:bg-surface-light/80 ${
                  isMvp ? "bg-accent-gold/10" : ""
                }`}
              >
                <td className="sticky left-0 z-10 bg-surface px-3 py-2 font-body font-medium text-text-primary">
                  <div className="flex min-w-0 items-center gap-2">
                    {p.agentIcon ? (
                      <Image src={p.agentIcon} alt="" width={32} height={32} className="size-8 rounded-md" />
                    ) : (
                      <div className="size-8 rounded-md bg-surface-lighter" />
                    )}
                    <span className="min-w-0 truncate">
                      {isMvp ? <Star className="mr-1 inline size-3.5 text-accent-gold" aria-hidden /> : null}
                      <span className="cursor-default">{p.name}</span>
                      {isMvp ? (
                        <span className="ml-2 rounded bg-accent-gold/20 px-1.5 py-0.5 font-heading text-[9px] font-bold uppercase text-accent-gold">
                          MVP
                        </span>
                      ) : null}
                    </span>
                  </div>
                </td>
                <td className={`px-2 py-2 text-right font-heading font-bold tabular-nums ${rtgClass}`}>
                  {rtg.toFixed(2)}
                </td>
                <td className="px-2 py-2 text-right font-heading tabular-nums text-text-primary">
                  {Math.round(p.acs)}
                </td>
                <td className="px-2 py-2 text-right font-heading tabular-nums text-text-primary">{p.kills}</td>
                <td className="px-2 py-2 text-right font-heading tabular-nums text-loss">{p.deaths}</td>
                <td className="px-2 py-2 text-right font-heading tabular-nums text-text-secondary">{p.assists}</td>
                <td className="px-2 py-2 text-right font-heading tabular-nums text-text-primary">{p.plusMinus}</td>
                <td className="px-2 py-2 text-right font-heading tabular-nums text-text-primary">
                  {p.kastPct.toFixed(0)}%
                </td>
                <td className="px-2 py-2 text-right font-heading tabular-nums text-text-primary">
                  {p.adr.toFixed(0)}
                </td>
                <td className={`px-2 py-2 text-right font-heading tabular-nums ${hsClass}`}>
                  {p.hsPct.toFixed(0)}%
                </td>
                <td className={`px-2 py-2 text-right font-heading tabular-nums ${fkClass}`}>{p.fk}</td>
                <td className={`px-2 py-2 text-right font-heading tabular-nums ${fdClass}`}>{p.fd}</td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function MatchDetailClient({ matchId }: { matchId: string }) {
  const reduced = Boolean(useReducedMotion());
  const [data, setData] = useState<ClutchMatchDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [valMaps, setValMaps] = useState<Map<string, ValMap>>(new Map());

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/esports/match/${matchId}`);
      if (!res.ok) {
        setErr(res.status === 404 ? "notfound" : "error");
        setData(null);
        return;
      }
      const j = (await res.json()) as ClutchMatchDetailPayload;
      setData(j);
      setTab(0);
    } catch {
      setErr("error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("https://valorant-api.com/v1/maps");
        const j = (await r.json()) as { data?: ValMap[] };
        if (!cancelled && j.data) setValMaps(mapAssetsByName(j.data));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeMap = data?.maps[tab] ?? null;

  const splash = useMemo(() => {
    if (!activeMap) return "";
    return valMaps.get(activeMap.mapName.toLowerCase())?.splash ?? "";
  }, [activeMap, valMaps]);

  const listIcon = (name: string) => valMaps.get(name.toLowerCase())?.listViewIcon ?? "";

  const mvp = useMemo(() => (activeMap ? mvpFor(activeMap) : null), [activeMap]);

  const ecoChartData = useMemo(() => {
    if (!activeMap?.economyA?.length) return [];
    return activeMap.economyA.map((a, i) => ({
      r: i + 1,
      a,
      b: activeMap.economyB[i] ?? 0,
    }));
  }, [activeMap]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="h-40 animate-pulse rounded-none border-b border-white/10 bg-surface sm:h-48" />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 w-32 shrink-0 animate-pulse rounded-lg bg-surface-light" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl border border-surface-light bg-surface" />
      </motion.div>
    );
  }

  if (err === "notfound" || !data) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-surface/80 px-6 py-16 text-center">
        <Trophy className="mx-auto size-12 text-text-secondary" />
        <p className="mt-4 font-heading text-lg font-bold text-text-primary">Match not found</p>
        <p className="mt-2 text-sm text-text-secondary">
          This match is not in our recent results or live feed. Check the ID or browse esports.
        </p>
        <Link
          href="/esports"
          className="mt-6 inline-flex items-center gap-2 font-semibold text-accent-blue underline-offset-4 hover:underline"
        >
          ← Back to Esports
        </Link>
      </div>
    );
  }

  const s = data.summary;
  const logoA = TEAM_LOGOS[s.teamA.name] ?? null;
  const logoB = TEAM_LOGOS[s.teamB.name] ?? null;
  const completed = s.status === "completed";
  const live = s.status === "live";
  const aSeries = s.teamA.score ?? 0;
  const bSeries = s.teamB.score ?? 0;
  const aWonSeries = completed && s.teamA.won;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="space-y-0"
    >
      {data.demoStats ? (
        <p className="mb-4 rounded-lg border border-white/10 bg-surface-light/50 px-3 py-2 text-center font-body text-[11px] text-text-secondary">
          Illustrative map &amp; box score — synced from series results. Wire in official play-by-play when
          available.
        </p>
      ) : null}

      {/* Header */}
      <header className="relative overflow-hidden border-b border-white/10 bg-surface">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 sm:py-10">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border border-white/10 bg-background/40 px-3 py-1 font-body text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
              {s.tournament || "Tournament"}
            </span>
            {live ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-accent-red/15 px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-accent-red motion-safe:animate-pulse">
                <span className="size-1.5 rounded-full bg-accent-red" />
                Live
              </span>
            ) : null}
          </div>

          <div className="flex w-full max-w-3xl items-center justify-between gap-3 sm:gap-8">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
              <TeamLogo name={s.teamA.name} logoUrl={logoA} size={48} />
              <span className="font-heading text-lg font-bold leading-tight text-text-primary sm:text-2xl">
                {completed && s.teamA.won ? (
                  <span className="inline-flex items-center gap-1">
                    <Trophy className="size-4 shrink-0 text-accent-red" aria-hidden />
                    {s.teamA.name}
                  </span>
                ) : (
                  s.teamA.name
                )}
              </span>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-1">
              <div className="font-heading text-4xl font-bold tabular-nums sm:text-5xl">
                <span className={aWonSeries ? "text-accent-red" : "text-text-secondary"}>{aSeries}</span>
                <span className="mx-2 text-text-secondary/40">–</span>
                <span className={completed && s.teamB.won ? "text-accent-red" : "text-text-secondary"}>
                  {bSeries}
                </span>
              </div>
              {s.unixTimestamp ? (
                <span className="flex items-center gap-1 font-body text-xs text-text-secondary">
                  <Calendar className="size-3.5" />
                  {formatDate(s.unixTimestamp)}
                </span>
              ) : s.timeLabel ? (
                <span className="font-body text-xs text-text-secondary">{s.timeLabel}</span>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
              <TeamLogo name={s.teamB.name} logoUrl={logoB} size={48} />
              <span className="font-heading text-lg font-bold leading-tight text-text-primary sm:text-2xl">
                {completed && s.teamB.won ? (
                  <span className="inline-flex items-center gap-1">
                    <Trophy className="size-4 shrink-0 text-accent-red" aria-hidden />
                    {s.teamB.name}
                  </span>
                ) : (
                  s.teamB.name
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {s.vodUrl ? (
              <a
                href={s.vodUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-accent-red/40 bg-accent-red/10 px-4 py-2 font-heading text-xs font-bold uppercase tracking-wide text-accent-red transition hover:bg-accent-red/20"
              >
                Watch VOD
                <ExternalLink className="size-3.5" />
              </a>
            ) : null}
            <a
              href={`https://www.vlr.gg/${matchId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-body text-xs text-text-secondary transition hover:text-accent-blue"
            >
              Open on VLR
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-16 z-20 border-b border-white/10 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2 py-2 sm:px-4">
          {data.maps.map((m, i) => {
            const icon = listIcon(m.mapName);
            const active = i === tab;
            return (
              <button
                key={m.index}
                type="button"
                onClick={() => setTab(i)}
                className={`relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 font-body text-xs font-semibold transition-colors sm:text-sm ${
                  active ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {icon ? <Image src={icon} alt="" width={20} height={20} className="size-5 object-contain" /> : null}
                <span className="whitespace-nowrap">
                  Map {i + 1}: {m.mapName}
                </span>
                {active ? (
                  <motion.span
                    layoutId="match-map-tab"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-accent-red"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          {activeMap ? (
            <motion.div
              key={tab}
              initial={reduced ? false : { opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: -10 }}
              transition={{ duration: 0.22 }}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-surface"
            >
              {splash ? (
                <div
                  className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.08]"
                  style={{ backgroundImage: `url(${splash})` }}
                />
              ) : null}
              <div className="relative z-[1] space-y-8 p-5 sm:p-8">
                <div>
                  <p className="font-heading text-3xl font-bold tabular-nums text-text-primary">
                    <span className={activeMap.teamAScore > activeMap.teamBScore ? "text-accent-red" : "text-text-secondary"}>
                      {activeMap.teamAScore}
                    </span>
                    <span className="mx-3 text-text-secondary/40">–</span>
                    <span className={activeMap.teamBScore > activeMap.teamAScore ? "text-accent-red" : "text-text-secondary"}>
                      {activeMap.teamBScore}
                    </span>
                  </p>
                  <p className="mt-1 font-body text-sm text-text-secondary">{activeMap.halfSummary}</p>
                </div>

                {activeMap.rounds.length > 0 ? (
                  <div>
                    <h3 className="mb-3 font-body text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
                      Rounds
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {activeMap.rounds.map((r, idx) => {
                        const halfMark = idx === 12;
                        return (
                          <div key={r.n} className="flex items-center gap-1.5">
                            {halfMark ? (
                              <div
                                className="mx-1 h-8 w-px bg-white/25"
                                title="Half-time"
                                aria-hidden
                              />
                            ) : null}
                            <RoundDot outcome={r.outcome} winner={r.winner} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {ecoChartData.length > 0 ? (
                  <div className="h-40 w-full rounded-lg border border-white/5 bg-background/40 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ecoChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#243447" />
                        <XAxis dataKey="r" tick={{ fill: "#768691", fontSize: 10 }} />
                        <YAxis hide domain={["dataMin - 500", "dataMax + 500"]} />
                        <Tooltip
                          contentStyle={{ background: "#1A2634", border: "1px solid #243447", borderRadius: 8 }}
                          labelFormatter={(l) => `Round ${l}`}
                        />
                        <Area type="monotone" dataKey="a" stroke="#4AE3A7" fill="#4AE3A7" fillOpacity={0.15} name={s.teamA.name} />
                        <Area type="monotone" dataKey="b" stroke="#FF4655" fill="#FF4655" fillOpacity={0.12} name={s.teamB.name} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : null}

                <StatTable
                  teamName={s.teamA.name}
                  logoUrl={logoA}
                  players={activeMap.teamAPlayers}
                  mvpId={mvp?.side === "a" ? mvp.id : null}
                  reduced={reduced}
                />
                <StatTable
                  teamName={s.teamB.name}
                  logoUrl={logoB}
                  players={activeMap.teamBPlayers}
                  mvpId={mvp?.side === "b" ? mvp.id : null}
                  reduced={reduced}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
