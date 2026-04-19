"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useMemo, useState } from "react";
import {
  DIVISION_COLORS,
  DIVISION_NAMES,
  divisionColor,
  divisionName,
  type PremierConference,
  type PremierLeaderboardEntry,
  type PremierTeamSearchResult,
} from "@/lib/henrikdev/premier";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PremierLandingProps {
  conferences: PremierConference[];
  initialLeaderboard: PremierLeaderboardEntry[];
  totalTeams?: number;
  searchResults?: PremierTeamSearchResult[];
  searchQuery?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Division order: worst → best (for bar rendering left-to-right)
const DIVISION_ORDER = [6, 5, 4, 3, 2, 1] as const;

const REGION_TABS = [
  { region: "na", label: "NA" },
  { region: "eu", label: "EU" },
  { region: "ap", label: "APAC" },
  { region: "kr", label: "KR" },
  { region: "latam", label: "LATAM" },
  { region: "br", label: "BR" },
] as const;

type RegionKey = (typeof REGION_TABS)[number]["region"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function RedBar() {
  return (
    <span className="inline-block w-4 h-px bg-[#FF4655] mr-2 align-middle shrink-0" aria-hidden />
  );
}

function DivisionPill({ division }: { division: number }) {
  const color = divisionColor(division);
  const name = divisionName(division);
  return (
    <span
      className="font-mono-display text-[10px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 leading-none"
      style={{
        color,
        background: `${color}18`,
        border: `1px solid ${color}40`,
      }}
    >
      {name}
    </span>
  );
}

function DivisionBar({ entries }: { entries: PremierLeaderboardEntry[] }) {
  if (!entries.length)
    return <div className="h-1 rounded-full bg-white/[0.06] w-full" />;
  const total = entries.length;
  const segments = DIVISION_ORDER.map((d) => ({
    d,
    count: entries.filter((t) => t.division === d).length,
  })).filter((s) => s.count > 0);

  return (
    <div className="flex gap-1.5 h-1">
      {segments.map(({ d, count }) => (
        <div
          key={d}
          className="h-full rounded-full shrink-0"
          style={{
            backgroundColor: DIVISION_COLORS[d],
            width: `${(count / total) * 100}%`,
          }}
          title={`${DIVISION_NAMES[d]}: ${count}`}
        />
      ))}
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="font-mono-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 leading-none">
        {label}
      </p>
      <p className="mt-2 font-display text-[28px] font-black tabular-nums text-white leading-none">
        {value}
      </p>
    </div>
  );
}

type LeaderboardRow = PremierLeaderboardEntry | PremierTeamSearchResult;

function TeamsTable({ teams, reduced }: { teams: LeaderboardRow[]; reduced: boolean }) {
  const router = useRouter();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: -4 }}
      transition={{ duration: 0.25 }}
      className="mt-px overflow-x-auto"
    >
      <table className="w-full min-w-[560px]">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {["#", "TEAM", "DIVISION", "SCORE", "RECORD", ""].map((col, i) => (
              <th
                key={i}
                className="py-3 px-4 text-left font-mono-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <motion.tbody
          initial="hidden"
          animate="show"
          variants={
            reduced
              ? { hidden: {}, show: {} }
              : { hidden: {}, show: { transition: { staggerChildren: 0.03 } } }
          }
        >
          {teams.map((team, i) => {
            const div = (team as PremierLeaderboardEntry).division;
            const score = (team as PremierLeaderboardEntry).score;
            const wins = (team as PremierLeaderboardEntry).wins;
            const losses = (team as PremierLeaderboardEntry).losses;
            return (
              <motion.tr
                key={team.id}
                variants={
                  reduced
                    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
                    : {
                        hidden: { opacity: 0, x: -8 },
                        show: { opacity: 1, x: 0, transition: { duration: 0.22 } },
                      }
                }
                onClick={() => router.push(`/premier/${team.id}`)}
                className="border-b border-white/[0.04] cursor-pointer transition-colors hover:bg-white/[0.03] group"
              >
                <td className="py-3 px-4 font-mono-display text-sm tabular-nums text-white/40">
                  {i + 1}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-8 shrink-0 flex items-center justify-center bg-[#13131A] border border-white/[0.08]"
                      style={{ clipPath: "polygon(6px 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%,0 6px)" }}
                    >
                      <span className="font-display text-[9px] font-black text-[#FF4655] leading-none">
                        {team.tag?.slice(0, 3) ?? "???"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-bold text-sm text-white group-hover:text-[#FF4655] transition-colors truncate">
                        {team.name}
                      </p>
                      <p className="font-mono-display text-[10px] text-white/40">#{team.tag}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {div != null ? <DivisionPill division={div} /> : <span className="text-white/25">—</span>}
                </td>
                <td className="py-3 px-4 font-mono-display text-sm tabular-nums text-white/80">
                  {score != null ? score.toLocaleString() : <span className="text-white/25">—</span>}
                </td>
                <td className="py-3 px-4 font-mono-display text-sm tabular-nums">
                  {wins != null && losses != null ? (
                    <>
                      <span className="text-[#4AE3A7]">{wins}W</span>
                      <span className="text-white/30 mx-1">-</span>
                      <span className="text-[#FF4655]">{losses}L</span>
                    </>
                  ) : (
                    <span className="text-white/25">—</span>
                  )}
                </td>
                <td className="py-3 px-4" />
              </motion.tr>
            );
          })}
        </motion.tbody>
      </table>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PremierLanding({
  conferences,
  initialLeaderboard,
  totalTeams,
  searchResults,
  searchQuery,
}: PremierLandingProps) {
  const router = useRouter();
  const reduced = Boolean(useReducedMotion());

  const [activeRegion, setActiveRegion] = useState<RegionKey>("na");
  const [leaderboard, setLeaderboard] = useState<PremierLeaderboardEntry[]>(initialLeaderboard);
  const [loadingRegion, setLoadingRegion] = useState(false);
  const [expandedConference, setExpandedConference] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery ?? "");

  // Conferences for the active region
  const activeConferences = useMemo(
    () => conferences.filter((c) => c.affinity === activeRegion),
    [conferences, activeRegion],
  );

  // Teams in a given conference
  const getConferenceTeams = useCallback(
    (confId: string) =>
      leaderboard
        .filter((t) => t.conference === confId)
        .sort((a, b) => b.score - a.score),
    [leaderboard],
  );

  async function handleRegionChange(region: RegionKey) {
    setActiveRegion(region);
    setExpandedConference(null);
    setLoadingRegion(true);
    try {
      const res = await fetch(`/api/premier/leaderboard?region=${region}`);
      if (res.ok) {
        const json: { teams: PremierLeaderboardEntry[] } = await res.json();
        setLeaderboard(json.teams ?? []);
      }
    } catch {
      // keep previous leaderboard on error
    } finally {
      setLoadingRegion(false);
    }
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = searchInput.trim();
    if (q) {
      router.push(`/premier?q=${encodeURIComponent(q)}`);
    }
  }

  function clearSearch() {
    setSearchInput("");
    router.push("/premier");
  }

  const displayTotal = totalTeams ?? (leaderboard.length || 0);

  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0A0A0C]">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(ellipse 55% 60% at 20% 50%, rgba(255,70,85,0.18), transparent 60%)," +
                "radial-gradient(ellipse 45% 50% at 80% 40%, rgba(31,170,237,0.10), transparent 55%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px)," +
                "linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage:
                "radial-gradient(ellipse 80% 70% at 50% 50%,black 10%,transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 80% 70% at 50% 50%,black 10%,transparent 75%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 3px)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-12 items-center">
          {/* Left */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="flex items-center font-mono-display text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
              <RedBar />
              Valorant Premier
            </p>
            <h1
              className="mt-4 font-display font-black text-white leading-[0.95]"
              style={{ fontSize: "clamp(36px,4vw,56px)" }}
            >
              Your team,
              <br />
              your division,
              <br />
              your grind.
            </h1>
            <p className="mt-4 font-sans-tight text-[17px] text-white/60 max-w-[520px] leading-relaxed">
              Browse divisions, scout opponents, track your ranking — across every Premier region.
            </p>

            <form onSubmit={handleSearch} className="mt-8 max-w-md" role="search">
              <label className="group relative block">
                <span className="sr-only">Search team name or tag</span>
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/40 transition-colors group-focus-within:text-[#FF4655]"
                  aria-hidden
                />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search team name or tag"
                  className="h-12 w-full bg-[#0D0D10] border border-white/[0.08] py-3 pl-11 pr-4 font-mono-display text-sm text-white outline-none placeholder:text-white/30 transition-[border-color] focus:border-[#FF4655]/50"
                  style={{
                    clipPath:
                      "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)",
                  }}
                />
              </label>
              {searchResults !== undefined && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-2 font-mono-display text-[10px] uppercase tracking-[0.15em] text-white/40 hover:text-white/70 transition-colors"
                >
                  ← Clear search
                </button>
              )}
            </form>
          </motion.div>

          {/* Right — stats card */}
          <motion.div
            initial={reduced ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#0D0D10] border border-white/[0.06] p-6"
            style={{
              clipPath:
                "polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)",
            }}
          >
            <p className="flex items-center font-mono-display text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-6">
              <RedBar />
              Premier · This Act
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <StatBlock
                label="Teams Tracked"
                value={displayTotal > 0 ? displayTotal : "—"}
              />
              <StatBlock label="Active Divisions" value={6} />
              <StatBlock label="Top Division" value="INVITE" />
              <StatBlock label="Act Ending" value="Soon" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── REGION TABS ──────────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-[#0D0D10] border-y border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-stretch gap-0 min-w-max">
            {REGION_TABS.map(({ region, label }) => {
              const active = activeRegion === region;
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => handleRegionChange(region)}
                  disabled={loadingRegion}
                  className={[
                    "relative h-12 px-5 flex items-center gap-2 font-mono-display text-xs font-bold uppercase tracking-[0.2em] transition-colors",
                    active
                      ? "text-white bg-white/[0.03]"
                      : "text-white/50 hover:text-white hover:bg-white/[0.02]",
                  ].join(" ")}
                >
                  {label}
                  {active && (
                    <motion.div
                      layoutId="premier-region-underline"
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

      {/* ─── CONTENT ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        {searchResults !== undefined ? (
          /* Search results */
          <div>
            <p className="flex items-center font-mono-display text-[11px] font-bold uppercase tracking-[0.3em] text-white/50 mb-6">
              <RedBar />
              Search results for &ldquo;{searchQuery}&rdquo; &mdash;{" "}
              {searchResults.length} team{searchResults.length !== 1 ? "s" : ""}
            </p>
            {searchResults.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-display font-bold text-lg text-white/50">No teams found</p>
                <p className="mt-2 font-mono-display text-xs text-white/30 tracking-[0.1em]">
                  Try searching by team name or tag
                </p>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-6 font-mono-display text-[11px] uppercase tracking-[0.15em] text-[#FF4655] hover:brightness-110"
                >
                  ← Back to regions
                </button>
              </div>
            ) : (
              <div className="bg-[#0D0D10] border border-white/[0.06]">
                <TeamsTable teams={searchResults} reduced={reduced} />
              </div>
            )}
          </div>
        ) : (
          /* Region conference grid */
          <div>
            <p className="flex items-center font-mono-display text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
              <RedBar />
              {REGION_TABS.find((r) => r.region === activeRegion)?.label ?? activeRegion.toUpperCase()}
              {" // Conferences"}
              {loadingRegion && (
                <span className="ml-3 text-white/30 animate-pulse normal-case tracking-normal">
                  loading…
                </span>
              )}
            </p>

            {activeConferences.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06]">
                {activeConferences.map((conf) => {
                  const confTeams = getConferenceTeams(conf.id);
                  const isExpanded = expandedConference === conf.id;

                  return (
                    <div key={conf.id} className="contents">
                      <motion.div
                        whileHover={reduced ? undefined : { scale: 1.005 }}
                        whileTap={reduced ? undefined : { scale: 0.998 }}
                        onClick={() =>
                          setExpandedConference((prev) =>
                            prev === conf.id ? null : conf.id,
                          )
                        }
                        className={[
                          "relative bg-[#0D0D10] p-5 cursor-pointer transition-colors",
                          isExpanded
                            ? "bg-[#121218] border-l-2 border-l-[#FF4655]"
                            : "hover:bg-[#121218]",
                        ].join(" ")}
                      >
                        <div
                          className="absolute top-0 right-0 w-[10px] h-[10px] bg-[#FF4655]"
                          style={{ clipPath: "polygon(100% 0,0 0,100% 100%)" }}
                          aria-hidden
                        />
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <p className="font-display font-black text-lg text-white leading-tight">
                            {conf.name}
                          </p>
                          <span className="font-mono-display text-[11px] text-white/50 shrink-0 mt-0.5">
                            {confTeams.length} team{confTeams.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        <DivisionBar entries={confTeams} />

                        <div className="mt-4 flex items-center justify-between">
                          <p
                            className={[
                              "font-mono-display text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                              isExpanded ? "text-[#FF4655]" : "text-white/50",
                            ].join(" ")}
                          >
                            {isExpanded ? "Hide teams ↑" : "View teams →"}
                          </p>
                          <div className="flex gap-1.5">
                            {DIVISION_ORDER.filter((d) =>
                              confTeams.some((t) => t.division === d),
                            ).map((d) => (
                              <span
                                key={d}
                                className="size-1.5 rounded-full"
                                style={{ backgroundColor: DIVISION_COLORS[d] }}
                                title={DIVISION_NAMES[d]}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>

                      {/* Expanded teams — full-width row */}
                      <AnimatePresence>
                        {isExpanded && confTeams.length > 0 && (
                          <motion.div
                            key={`${conf.id}-expanded`}
                            initial={reduced ? false : { opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={reduced ? undefined : { opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="col-span-full overflow-hidden bg-[#0D0D10] border-t border-white/[0.06]"
                          >
                            <TeamsTable teams={confTeams} reduced={reduced} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* No conferences / leaderboard data */
              <div className="mt-8 py-16 text-center border border-white/[0.06] bg-[#0D0D10]">
                {loadingRegion ? (
                  <p className="font-mono-display text-xs tracking-[0.1em] text-white/25 animate-pulse">
                    Loading…
                  </p>
                ) : (
                  <>
                    <p className="font-display font-bold text-lg text-white/40">
                      No teams tracked yet
                    </p>
                    <p className="mt-2 font-mono-display text-xs tracking-[0.1em] text-white/25">
                      Data ingestion for this region is pending
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── FOOTER CTA ───────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] bg-[#0D0D10] py-6">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-mono-display text-xs tracking-[0.1em] text-white/40">
            Your team not showing up?{" "}
            <span className="text-white/60">
              Link your Riot account to appear on leaderboards.
            </span>
          </p>
          <Link
            href="/pricing"
            className="shrink-0 font-mono-display text-[11px] font-bold uppercase tracking-[0.15em] text-[#FF4655] hover:brightness-110 transition-[filter] flex items-center gap-1"
          >
            Link account <ChevronRight className="size-3" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
