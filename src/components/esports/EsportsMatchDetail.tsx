"use client";

import { LiveScoreTicker } from "@/app/esports/match/[matchId]/LiveScoreTicker";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Tv } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MatchDetail, MatchDetailMap, MatchDetailPlayer } from "@/lib/vlr/matches";
import { normalizeLogoUrl } from "@/lib/vlr/matches";
import { FlagTag } from "./FlagTag";
import { TeamLogo } from "./TeamLogo";

type ValAgent = { displayName: string; displayIcon: string };

function parseNum(s: string | undefined): number {
  if (!s) return 0;
  const n = parseFloat(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function parseRating(p: MatchDetailPlayer): number {
  return parseNum(p.rating);
}

function normalizeTeamRef(name: string): string {
  return name.trim().toLowerCase();
}

function resolveTeamIdx(player: MatchDetailPlayer, teams: MatchDetail["teams"]): number {
  const pt = normalizeTeamRef(player.team);
  if (!pt) return 0;
  const i0 = teams.findIndex((t) => normalizeTeamRef(t.name) === pt);
  if (i0 >= 0) return i0;
  const i1 = teams.findIndex((t) => pt.includes(normalizeTeamRef(t.name)));
  if (i1 >= 0) return i1;
  const i2 = teams.findIndex((t) => normalizeTeamRef(t.name).includes(pt));
  return i2 >= 0 ? i2 : 0;
}

function playersForTeam(map: MatchDetailMap, teams: MatchDetail["teams"], idx: number): MatchDetailPlayer[] {
  const rows = map.players.filter((p) => resolveTeamIdx(p, teams) === idx);
  return [...rows].sort((a, b) => parseRating(b) - parseRating(a));
}

function mapWinnerTeamIdx(map: MatchDetailMap): number | null {
  const a = map.score.team1.total;
  const b = map.score.team2.total;
  if (a === b) return null;
  return a > b ? 0 : 1;
}

function iconForStream(url: string) {
  const u = url.toLowerCase();
  if (u.includes("youtu")) return PlayCircle;
  return Tv;
}

export function EsportsMatchDetail({
  match,
  matchId,
}: {
  match: MatchDetail;
  matchId: string;
}) {
  const [tab, setTab] = useState(0);
  const [agents, setAgents] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("https://valorant-api.com/v1/agents?isPlayableCharacter=true");
        const j = (await r.json()) as { data?: ValAgent[] };
        const m = new Map<string, string>();
        for (const a of j.data ?? []) {
          m.set(a.displayName.toLowerCase(), a.displayIcon);
        }
        if (!cancelled) setAgents(m);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeMap = match.maps[tab] ?? match.maps[0] ?? null;

  const seriesFormat = useMemo(() => {
    const n = match.maps.length;
    if (n >= 5) return "BO5";
    if (n >= 3) return "BO3";
    if (n > 0) return `BO${n}`;
    return "Series";
  }, [match.maps.length]);

  const t1 = match.teams[0];
  const t2 = match.teams[1];
  const s1 = t1?.score ?? 0;
  const s2 = t2?.score ?? 0;
  const completed = match.status === "completed";
  const live = match.status === "live";

  const winSeriesIdx =
    completed && s1 !== s2 ? (s1 > s2 ? 0 : 1) : null;

  const pollScores = live;

  const roundsSorted = useMemo(() => {
    return [...match.rounds].sort((a, b) => a.round_number - b.round_number);
  }, [match.rounds]);

  const mvpIdForMap = useMemo(() => {
    if (!activeMap) return null;
    const w = mapWinnerTeamIdx(activeMap);
    if (w == null) return null;
    const teamPlayers = playersForTeam(activeMap, match.teams, w);
    const best = teamPlayers[0];
    if (!best) return null;
    return `${w}::${best.player}`;
  }, [activeMap, match.teams]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header band */}
      <section className="relative min-h-[280px] overflow-hidden border-b border-white/[0.06] bg-[#0A0A0C]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)",
          }}
        />
        <div className="pointer-events-none absolute left-0 top-0 h-full w-[3px] bg-[#FF4655]" />
        <div className="relative mx-auto max-w-7xl px-6 py-10">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
            <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
              <TeamLogo
                logoUrl={normalizeLogoUrl(t1?.logo)}
                name={t1?.name ?? "Team 1"}
                size={80}
              />
              <span
                className="font-display font-black leading-none text-white"
                style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
              >
                {t1?.name}
              </span>
              <div className="flex items-center gap-2">
                <FlagTag code={t1?.flag} />
                <span className="font-mono-display text-[10px] text-white/50">
                  {(t1?.flag ?? "").replace(/^flag_/i, "").replace(/_/g, " ").toUpperCase() || "—"}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-2">
                <span className="h-2 w-[3px] bg-[#FF4655]" aria-hidden />
                <span className="font-mono-display text-[10px] uppercase tracking-[0.25em] text-white/60">
                  {match.event.name || "Event"}
                </span>
              </div>

              {pollScores ? (
                <LiveScoreTicker
                  matchId={matchId}
                  initialTeam1Score={s1}
                  initialTeam2Score={s2}
                  isLive
                />
              ) : (
                <div
                  className="font-display font-black tabular-nums text-white"
                  style={{ fontSize: "clamp(48px, 6vw, 80px)" }}
                >
                  <span
                    className={
                      winSeriesIdx === 0
                        ? "text-[#00E5D1]"
                        : winSeriesIdx === 1
                          ? "text-white/50"
                          : "text-white"
                    }
                  >
                    {s1}
                  </span>
                  <span className="mx-2 text-white/30">—</span>
                  <span
                    className={
                      winSeriesIdx === 1
                        ? "text-[#00E5D1]"
                        : winSeriesIdx === 0
                          ? "text-white/50"
                          : "text-white"
                    }
                  >
                    {s2}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2">
                <span
                  className={`rounded-none px-2 py-1 font-mono-display text-[10px] uppercase tracking-[0.2em] ${
                    live
                      ? "bg-[#FF4655]/20 text-[#FF4655]"
                      : match.status === "upcoming"
                        ? "bg-white/10 text-white/60"
                        : "bg-white/5 text-white/40"
                  }`}
                >
                  {live ? "LIVE" : match.status === "upcoming" ? "UPCOMING" : "COMPLETED"}
                </span>
                <span className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-white/35">
                  {seriesFormat}
                </span>
              </div>
              <p className="max-w-md font-mono-display text-[10px] text-white/45">{match.event.series}</p>
            </div>

            <div className="flex flex-col items-center gap-3 text-center md:items-end md:text-right">
              <TeamLogo
                logoUrl={normalizeLogoUrl(t2?.logo)}
                name={t2?.name ?? "Team 2"}
                size={80}
              />
              <span
                className="font-display font-black leading-none text-white"
                style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
              >
                {t2?.name}
              </span>
              <div className="flex items-center justify-end gap-2">
                <span className="font-mono-display text-[10px] text-white/50">
                  {(t2?.flag ?? "").replace(/^flag_/i, "").replace(/_/g, " ").toUpperCase() || "—"}
                </span>
                <FlagTag code={t2?.flag} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {match.streams?.length ? (
        <div className="border-b border-white/[0.06] bg-[#13131A] py-3">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-6">
            <span className="font-mono-display text-[10px] uppercase tracking-[0.25em] text-white/40">
              Watch now:
            </span>
            {match.streams.map((s, i) => {
              const Icon = iconForStream(s.link);
              return (
                <a
                  key={`${s.link}-${i}`}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#FF4655] px-4 py-1.5 font-mono-display text-[10px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#ff5a69]"
                >
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  {s.name || "Stream"}
                </a>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Map tabs */}
      {match.maps.length ? (
        <div className="sticky top-0 z-20 border-b border-white/[0.06] bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-1 px-6 py-2">
            {match.maps.map((m, i) => {
              const w = mapWinnerTeamIdx(m);
              const scoreLine = `${m.score.team1.total}-${m.score.team2.total}`;
              const label = `MAP ${i + 1} · ${m.map_name} · ${scoreLine}`;
              return (
                <button
                  key={`${m.map_name}-${i}`}
                  type="button"
                  onClick={() => setTab(i)}
                  className={`rounded-none border px-3 py-2 font-mono-display text-[10px] uppercase tracking-[0.15em] transition-colors ${
                    tab === i
                      ? w === 0
                        ? "border-[#00E5D1]/50 bg-[#00E5D1]/10 text-[#00E5D1]"
                        : w === 1
                          ? "border-[#FF4655]/50 bg-[#FF4655]/10 text-[#FF4655]"
                          : "border-white/20 bg-white/5 text-white"
                      : "border-transparent bg-transparent text-white/45 hover:text-white/70"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-7xl space-y-12 px-6 py-10">
        {activeMap ? (
          <>
            <section className="space-y-4">
              <h2 className="font-mono-display text-[11px] uppercase tracking-[0.3em] text-white/45">
                Score breakdown
              </h2>
              <div className="grid gap-4 rounded-none border border-white/[0.06] bg-[#0D0D10] p-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="font-mono-display text-[11px] text-white/50">Pick &amp; duration</p>
                  <p className="font-display text-lg font-black text-white">
                    {activeMap.picked_by ? `Picked by ${activeMap.picked_by}` : "Pick —"}{" "}
                    <span className="text-white/40">·</span>{" "}
                    {activeMap.duration ? `Duration ${activeMap.duration}` : "Duration —"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono-display text-[11px] text-white/50">Side totals</p>
                  <p className="font-display text-lg font-black leading-snug text-white">
                    {t1?.name} (CT {activeMap.score.team1.ct} / T {activeMap.score.team1.t}) vs {t2?.name} (CT{" "}
                    {activeMap.score.team2.ct} / T {activeMap.score.team2.t})
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-6 overflow-x-auto">
              {[0, 1].map((idx) => {
                const team = match.teams[idx];
                const rows = playersForTeam(activeMap, match.teams, idx);
                const mapScore =
                  idx === 0 ? activeMap.score.team1.total : activeMap.score.team2.total;
                return (
                  <div key={idx} className="min-w-[720px]">
                    <div className="mb-2 flex items-center gap-3">
                      <TeamLogo logoUrl={normalizeLogoUrl(team?.logo)} name={team?.name ?? ""} size={36} />
                      <span className="font-display text-lg font-black text-white">{team?.name}</span>
                      <span className="rounded-none border border-white/15 px-2 py-0.5 font-mono-display text-xs tabular-nums text-white/60">
                        {mapScore}
                      </span>
                    </div>
                    <table className="w-full min-w-[720px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-white/10 font-mono-display text-[10px] uppercase tracking-wider text-white/45">
                          <th className="py-2 pr-3">Player</th>
                          <th className="py-2 pr-3">Agent</th>
                          <th className="py-2 pr-3 text-right">Rtg</th>
                          <th className="py-2 pr-3 text-right">K/D/A</th>
                          <th className="py-2 pr-3 text-right">ACS</th>
                          <th className="py-2 pr-3 text-right">ADR</th>
                          <th className="py-2 pr-3 text-right">HS%</th>
                          <th className="py-2 pr-3 text-right">KAST</th>
                          <th className="py-2 text-right">FK/FD</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((p) => {
                          const rtg = parseRating(p);
                          const isMvp = mvpIdForMap === `${idx}::${p.player}`;
                          const rtgCls =
                            rtg >= 1.2 ? "text-[#00E5D1]" : rtg < 0.9 ? "text-[#FF4655]" : "text-white";
                          const fk = Math.round(parseNum(p.fk));
                          const fd = Math.round(parseNum(p.fd));
                          const fkCls = fk > fd ? "text-[#00E5D1]" : fd > fk ? "text-[#FF4655]" : "text-white/50";
                          const kills = Math.round(parseNum(p.kills));
                          const deaths = Math.round(parseNum(p.deaths));
                          const assists = Math.round(parseNum(p.assists));
                          const acs = Math.round(parseNum(p.acs));
                          const adr = parseNum(p.adr);
                          const hs = parseNum(p.hs_pct);
                          const kast = parseNum(p.kast);
                          const agentName = (p.agent ?? "").toLowerCase();
                          const agentIcon = agentName ? agents.get(agentName) ?? null : null;

                          return (
                            <tr key={`${idx}-${p.player}`} className="border-b border-white/[0.05]">
                              <td className="py-2 pr-3">
                                <div className="flex min-w-0 items-center gap-2">
                                  {agentIcon ? (
                                    <Image src={agentIcon} alt="" width={28} height={28} className="size-7 object-contain" />
                                  ) : (
                                    <div className="size-7 bg-white/5" />
                                  )}
                                  <span className="font-display text-sm font-medium text-white">
                                    {p.player}
                                    {isMvp ? (
                                      <span className="ml-2 inline-flex items-center rounded-none bg-amber-500/15 px-1.5 py-0.5 font-mono-display text-[9px] font-semibold uppercase tracking-wide text-amber-300">
                                        ★ MVP
                                      </span>
                                    ) : null}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2 pr-3 font-mono-display text-xs text-white/70">{p.agent ?? "—"}</td>
                              <td className={`py-2 pr-3 text-right font-mono-display text-sm font-medium tabular-nums ${rtgCls}`}>
                                {p.rating ?? "—"}
                              </td>
                              <td className="py-2 pr-3 text-right font-mono-display text-sm tabular-nums text-white">
                                {kills} / {deaths} / {assists}
                              </td>
                              <td className="py-2 pr-3 text-right font-mono-display text-sm tabular-nums text-white">
                                {acs}
                              </td>
                              <td className="py-2 pr-3 text-right font-mono-display text-sm tabular-nums text-white">
                                {Number.isFinite(adr) ? adr.toFixed(0) : "—"}
                              </td>
                              <td className="py-2 pr-3 text-right font-mono-display text-sm tabular-nums text-white">
                                {hs ? `${hs.toFixed(0)}%` : "—"}
                              </td>
                              <td className="py-2 pr-3 text-right font-mono-display text-sm tabular-nums text-white">
                                {kast ? `${kast.toFixed(0)}%` : "—"}
                              </td>
                              <td className={`py-2 text-right font-mono-display text-sm tabular-nums ${fkCls}`}>
                                {fk}/{fd}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </section>

            <section className="space-y-3">
              <h3 className="font-mono-display text-[11px] uppercase tracking-[0.3em] text-white/45">
                Round history
              </h3>
              <div className="flex max-w-full flex-wrap gap-1.5 overflow-x-auto pb-2">
                {roundsSorted.map((r) => (
                  <div
                    key={r.round_number}
                    title={`Round ${r.round_number} · T1 ${r.team1_side.toUpperCase()} vs T2 ${r.team2_side.toUpperCase()}`}
                    className={`flex size-5 items-center justify-center font-mono-display text-[8px] text-white ${
                      r.team1_win ? "bg-[#00E5D1]/80" : r.team2_win ? "bg-[#FF4655]/80" : "bg-white/20"
                    }`}
                  >
                    {r.round_number}
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <p className="font-mono-display text-sm text-white/50">Map details will appear when available.</p>
        )}

        {match.head_to_head?.length ? (
          <section className="space-y-3">
            <h3 className="font-mono-display text-[11px] uppercase tracking-[0.3em] text-white/45">
              {"// "}HEAD-TO-HEAD HISTORY
            </h3>
            <div className="flex flex-wrap gap-2">
              {match.head_to_head.slice(0, 5).map((h, i) => (
                <div
                  key={`${h.event}-${i}`}
                  className="rounded-none border border-white/[0.08] bg-[#0D0D10] px-3 py-2 font-mono-display text-[10px] text-white/70"
                >
                  <span className="block text-white/90">{h.event}</span>
                  <span className="text-white/50">{h.match}</span>
                  <span className="ml-2 text-[#00E5D1]">{h.score}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <div className="pt-8 text-center">
          <Link
            href="/esports"
            className="font-mono-display text-[11px] uppercase tracking-[0.2em] text-[#1FAAED] hover:underline"
          >
            ← Back to Esports
          </Link>
        </div>
      </div>
    </div>
  );
}
