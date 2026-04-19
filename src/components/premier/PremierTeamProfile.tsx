"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Bell } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  divisionColor,
  divisionName,
  DIVISION_COLORS,
  DIVISION_NAMES,
  type PremierTeamDetails,
  type PremierMatchHistoryEntry,
  type PremierLeaderboardEntry,
} from "@/lib/henrikdev/premier";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PremierTeamProfileProps {
  team: PremierTeamDetails | null;
  history: PremierMatchHistoryEntry[];
  contextTeams: PremierLeaderboardEntry[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

type Tab = "overview" | "roster" | "matches" | "rankings";
const TABS: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "roster", label: "Roster" },
  { id: "matches", label: "Matches" },
  { id: "rankings", label: "Rankings" },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatMatchDate(iso?: string): string {
  if (!iso) return "Unknown date";
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86_400_000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "Unknown date";
  }
}

function formatPointsDelta(diff?: number): string {
  if (diff == null) return "";
  return diff >= 0 ? `+${diff} pts` : `${diff} pts`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RedBar() {
  return (
    <span
      className="inline-block w-4 h-px bg-[#FF4655] mr-2 align-middle shrink-0"
      aria-hidden
    />
  );
}

function SectionLabel({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="flex items-center font-mono-display text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
        <RedBar />
        {children}
      </p>
      {right && (
        <p className="font-mono-display text-[10px] text-white/40">{right}</p>
      )}
    </div>
  );
}

function CornerAccents() {
  return (
    <>
      <div className="absolute top-0 left-0 w-5 h-5 border-l-2 border-t-2 border-[#FF4655]" />
      <div className="absolute top-0 right-0 w-5 h-5 border-r-2 border-t-2 border-[#FF4655]" />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-l-2 border-b-2 border-[#FF4655]" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-r-2 border-b-2 border-[#FF4655]" />
    </>
  );
}

function TeamAvatar({ team }: { team: PremierTeamDetails }) {
  const initials = (team.tag ?? "?").slice(0, 3);
  return (
    <div className="relative size-[120px] shrink-0">
      <div
        className="size-full flex items-center justify-center bg-[#13131A] border border-white/[0.08]"
        style={{
          clipPath:
            "polygon(20px 0,100% 0,100% calc(100% - 20px),calc(100% - 20px) 100%,0 100%,0 20px)",
        }}
      >
        {team.customization?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={team.customization.image}
            alt={team.name}
            className="size-20 object-contain"
          />
        ) : (
          <span className="font-display text-4xl font-black text-[#FF4655] leading-none select-none">
            {initials}
          </span>
        )}
      </div>
      <CornerAccents />
    </div>
  );
}

function DivisionCard({
  team,
  rank,
}: {
  team: PremierTeamDetails;
  rank?: number;
}) {
  const color = divisionColor(team.division);
  const name = divisionName(team.division);
  return (
    <div
      className="shrink-0 bg-[#0D0D10] border border-white/[0.08] p-4 min-w-[140px]"
      style={{
        clipPath:
          "polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)",
      }}
    >
      <p className="font-mono-display text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
        Division
      </p>
      <p
        className="font-display font-black text-base leading-none uppercase"
        style={{ color }}
      >
        {name}
      </p>
      {rank != null && (
        <p className="mt-2 font-mono-display text-[12px] tabular-nums text-white/50">
          #{rank} in conference
        </p>
      )}
      <p className="mt-1 font-mono-display text-[11px] tabular-nums text-white/40">
        {team.score.toLocaleString()} PTS
      </p>
    </div>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="py-24 text-center border border-white/[0.06] bg-[#0D0D10]">
      <p className="font-display font-bold text-xl text-white/30">{label}</p>
      <p className="mt-2 font-mono-display text-[11px] uppercase tracking-[0.2em] text-white/20">
        Coming soon
      </p>
    </div>
  );
}

function OverviewTab({
  team,
  history,
  contextTeams,
  reduced,
}: {
  team: PremierTeamDetails;
  history: PremierMatchHistoryEntry[];
  contextTeams: PremierLeaderboardEntry[];
  reduced: boolean;
}) {
  const lastMatch = history[0];
  const members = team.members ?? [];

  // Narrow contextTeams to same conference/division for the rankings table
  const divisionPeers = contextTeams
    .filter((t) => t.conference === team.conference && t.division === team.division)
    .sort((a, b) => b.score - a.score);
  const tableTeams = divisionPeers.length > 0 ? divisionPeers : contextTeams.slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Row 1 — last match */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Last match */}
        <div
          className="bg-[#0D0D10] p-5 border border-white/[0.06]"
          style={{
            clipPath:
              "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)",
          }}
        >
          <SectionLabel>Last Match</SectionLabel>
          {lastMatch ? (
            <>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={[
                    "font-mono-display text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 leading-none",
                    lastMatch.won
                      ? "bg-[#4AE3A7]/15 text-[#4AE3A7] border border-[#4AE3A7]/30"
                      : "bg-[#FF4655]/15 text-[#FF4655] border border-[#FF4655]/30",
                  ].join(" ")}
                >
                  {lastMatch.won ? "W" : "L"}
                </span>
                {lastMatch.points_difference != null && (
                  <span
                    className={[
                      "font-mono-display text-sm tabular-nums font-bold",
                      lastMatch.won ? "text-[#4AE3A7]" : "text-[#FF4655]",
                    ].join(" ")}
                  >
                    {formatPointsDelta(lastMatch.points_difference)}
                  </span>
                )}
              </div>
              {lastMatch.points_after_match != null && (
                <p className="mt-2 font-mono-display text-[12px] text-white/50">
                  {lastMatch.points_after_match.toLocaleString()} pts after match
                </p>
              )}
              <p className="mt-2 font-mono-display text-[11px] text-white/40">
                {formatMatchDate(lastMatch.timestamp)}
              </p>
            </>
          ) : (
            <p className="mt-4 font-mono-display text-[11px] text-white/30 tracking-[0.1em]">
              No match data available
            </p>
          )}
        </div>

        {/* Upcoming match — not available from Premier API */}
        <div
          className="bg-[#0D0D10] p-5 border border-white/[0.06] relative"
          style={{
            clipPath:
              "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)",
          }}
        >
          <SectionLabel>Upcoming</SectionLabel>
          <p className="mt-4 font-mono-display text-[11px] text-white/30 tracking-[0.1em]">
            Upcoming match schedule unavailable
          </p>
          <button
            type="button"
            disabled
            className="mt-4 flex items-center gap-1.5 bg-white/[0.04] px-3 py-1.5 font-mono-display text-[10px] font-bold uppercase tracking-[0.1em] text-white/25 cursor-not-allowed"
          >
            <Bell className="size-3" aria-hidden />
            Set Reminder
          </button>
        </div>
      </div>

      {/* Row 2 — Roster */}
      {members.length > 0 && (
        <div>
          <SectionLabel right={`${members.length} players`}>Roster</SectionLabel>
          <motion.div
            initial="hidden"
            animate="show"
            variants={
              reduced
                ? { hidden: {}, show: {} }
                : {
                    hidden: {},
                    show: { transition: { staggerChildren: 0.05 } },
                  }
            }
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-white/[0.06]"
          >
            {members.map((player) => {
              const displayName = player.name ?? player.puuid.slice(0, 8);
              const displayTag = player.tag ?? "—";
              const initials = displayName.slice(0, 2).toUpperCase();
              return (
                <motion.div
                  key={player.puuid}
                  variants={
                    reduced
                      ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
                      : {
                          hidden: { opacity: 0, y: 8 },
                          show: {
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.25 },
                          },
                        }
                  }
                  className="bg-[#0D0D10] p-4 relative"
                >
                  <div
                    className="size-12 bg-[#1A1A25] border border-white/[0.08] flex items-center justify-center mb-3"
                    style={{
                      clipPath:
                        "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)",
                    }}
                  >
                    <span className="font-display text-sm font-black text-white/50 select-none">
                      {initials}
                    </span>
                  </div>
                  <p className="font-display font-medium text-sm text-white leading-tight truncate">
                    {displayName}
                  </p>
                  <p className="font-mono-display text-[11px] text-white/40 mt-0.5">
                    #{displayTag}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* Row 3 — Division context */}
      {tableTeams.length > 0 && (
        <div>
          <SectionLabel>
            {divisionPeers.length > 0 ? "Division Context" : "Regional Leaderboard"}
          </SectionLabel>
          <div className="bg-[#0D0D10] border border-white/[0.06] overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["#", "Team", "Division", "Score", "Record"].map((col) => (
                    <th
                      key={col}
                      className="py-3 px-4 text-left font-mono-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableTeams.map((t, i) => {
                  const isThis = t.id === team.id;
                  const color = DIVISION_COLORS[t.division] ?? "#8A8A95";
                  return (
                    <tr
                      key={t.id}
                      className={[
                        "border-b border-white/[0.04] transition-colors",
                        isThis
                          ? "bg-white/[0.04] border-l-2 border-l-[#FF4655]"
                          : "hover:bg-white/[0.02] cursor-pointer",
                      ].join(" ")}
                    >
                      <td className="py-3 px-4 font-mono-display text-sm tabular-nums text-white/40">
                        {i + 1}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/premier/${t.id}`}
                          className={[
                            "font-display font-bold text-sm",
                            isThis ? "text-white" : "text-white/70 hover:text-white",
                          ].join(" ")}
                          onClick={(e) => isThis && e.preventDefault()}
                        >
                          {t.name}
                          {isThis && (
                            <span className="ml-2 font-mono-display text-[9px] font-bold uppercase tracking-[0.1em] text-[#FF4655]">
                              ← you
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="font-mono-display text-[10px] font-bold uppercase px-1.5 py-0.5 leading-none"
                          style={{
                            color,
                            background: `${color}15`,
                          }}
                        >
                          {DIVISION_NAMES[t.division] ?? `Div ${t.division}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono-display text-sm tabular-nums text-white/70">
                        {t.score.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono-display text-sm tabular-nums">
                        {t.wins != null && t.losses != null ? (
                          <>
                            <span className="text-[#4AE3A7]">{t.wins}W</span>
                            <span className="text-white/30 mx-1">-</span>
                            <span className="text-[#FF4655]">{t.losses}L</span>
                          </>
                        ) : (
                          <span className="text-white/25">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PremierTeamProfile({
  team,
  history,
  contextTeams,
}: PremierTeamProfileProps) {
  const reduced = Boolean(useReducedMotion());
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (!team) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div
          className="size-20 flex items-center justify-center bg-[#0D0D10] border border-white/[0.08]"
          style={{
            clipPath:
              "polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)",
          }}
        >
          <span className="font-display font-black text-3xl text-[#FF4655]">?</span>
        </div>
        <div>
          <p className="font-display font-black text-2xl text-white">Team not found</p>
          <p className="mt-2 font-mono-display text-xs tracking-[0.2em] text-white/40 uppercase">
            This team doesn&apos;t exist in our records
          </p>
        </div>
        <Link
          href="/premier"
          className="flex items-center gap-2 font-mono-display text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF4655] hover:brightness-110 transition-[filter]"
        >
          <ArrowLeft className="size-3" aria-hidden />
          Back to Premier
        </Link>
      </div>
    );
  }

  const divColor = divisionColor(team.division);
  const divLabel = divisionName(team.division);

  // Conference display name (fall back to raw id)
  const conferenceDisplay = team.conference
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Rank within conference peers on the leaderboard
  const conferencePeers = contextTeams
    .filter((t) => t.conference === team.conference)
    .sort((a, b) => b.score - a.score);
  const rank = conferencePeers.findIndex((t) => t.id === team.id) + 1 || undefined;

  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      {/* ─── TEAM HEADER ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0A0A0C] min-h-[240px] flex items-center">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background: `radial-gradient(ellipse 60% 80% at 30% 50%, ${divColor}20, transparent 60%)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.4) 1px,transparent 1px)," +
                "linear-gradient(90deg,rgba(255,255,255,0.4) 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 3px)",
            }}
          />
        </div>

        <div className="relative z-10 w-full mx-auto max-w-7xl px-6 py-10">
          <Link
            href="/premier"
            className="inline-flex items-center gap-1.5 font-mono-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors mb-8"
          >
            <ArrowLeft className="size-3" aria-hidden />
            Premier
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <TeamAvatar team={team} />

            <div className="flex-1 min-w-0">
              <p className="font-mono-display text-[11px] font-bold uppercase tracking-[0.25em] text-white/40">
                {team.affinity.toUpperCase()}
                {" // "}
                {conferenceDisplay}
                {" // "}
                {divLabel.toUpperCase()}
              </p>
              <h1
                className="mt-2 font-display font-black text-white leading-none"
                style={{ fontSize: "clamp(32px,4vw,52px)" }}
              >
                {team.name}
                <span
                  className="font-mono-display text-white/25 ml-3"
                  style={{ fontSize: "clamp(18px,2vw,28px)" }}
                >
                  #{team.tag}
                </span>
              </h1>
              {(team.wins != null || team.losses != null) && (
                <p className="mt-3 font-mono-display text-sm">
                  <span className="text-[#4AE3A7] font-bold">{team.wins ?? "?"}W</span>
                  <span className="text-white/30 mx-1.5">-</span>
                  <span className="text-[#FF4655] font-bold">{team.losses ?? "?"}L</span>
                </p>
              )}
            </div>

            <DivisionCard team={team} rank={rank} />
          </div>
        </div>
      </section>

      {/* ─── TABS ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-[#0D0D10] border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-stretch gap-0 min-w-max">
            {TABS.map(({ id, label }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={[
                    "relative h-12 px-5 flex items-center font-mono-display text-xs font-bold uppercase tracking-[0.2em] transition-colors",
                    active
                      ? "text-white bg-white/[0.03]"
                      : "text-white/50 hover:text-white hover:bg-white/[0.02]",
                  ].join(" ")}
                >
                  {label}
                  {active && (
                    <motion.div
                      layoutId="premier-team-tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF4655]"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── TAB CONTENT ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <OverviewTab
                team={team}
                history={history}
                contextTeams={contextTeams}
                reduced={reduced}
              />
            )}
            {activeTab === "roster" && <PlaceholderTab label="Roster" />}
            {activeTab === "matches" && <PlaceholderTab label="Match History" />}
            {activeTab === "rankings" && <PlaceholderTab label="Rankings" />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
