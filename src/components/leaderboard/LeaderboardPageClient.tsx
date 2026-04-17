"use client";

import { FetchErrorPanel } from "@/components/ui/FetchErrorPanel";
import {
  parseHenrikLeaderboardV1,
  parseHenrikLeaderboardV3,
  type LeaderboardRow,
} from "@/lib/leaderboard/parse-henrik-leaderboard";
import { BarChart3, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const REGIONS = [
  { id: "eu", label: "EU" },
  { id: "na", label: "NA" },
  { id: "ap", label: "AP" },
  { id: "kr", label: "KR" },
  { id: "br", label: "BR" },
  { id: "latam", label: "LATAM" },
] as const;

type RegionId = (typeof REGIONS)[number]["id"];

const PAGE_SIZE = 50;

function playerHref(name: string, tag: string): string {
  return `/player/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
}

function positionColor(rank: number): string {
  if (rank === 1) return "#F5C542";
  if (rank === 2) return "#C8D0D8";
  if (rank === 3) return "#CD7F32";
  return "#ECE8E1";
}

function PodiumBorder(rank: number): string {
  if (rank === 1) return "border-l-[#F5C542]";
  if (rank === 2) return "border-l-[#C8D0D8]";
  if (rank === 3) return "border-l-[#CD7F32]";
  return "border-l-transparent";
}

function PodiumGlow(rank: number): string {
  if (rank === 1) return "shadow-[0_0_24px_rgba(245,197,66,0.12)]";
  if (rank === 2) return "shadow-[0_0_20px_rgba(200,208,216,0.1)]";
  if (rank === 3) return "shadow-[0_0_20px_rgba(205,127,50,0.12)]";
  return "";
}

function PaginationPages({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  const nums = useMemo(() => {
    const window = [page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages);
    const set = new Set<number>([1, ...window, totalPages]);
    return Array.from(set).sort((a, b) => a - b);
  }, [page, totalPages]);

  const parts: Array<number | "gap"> = [];
  for (let i = 0; i < nums.length; i++) {
    if (i > 0 && nums[i] - nums[i - 1] > 1) parts.push("gap");
    parts.push(nums[i]);
  }

  return (
    <>
      {parts.map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-text-secondary">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            className={`min-w-[2.25rem] rounded-full px-3 py-1.5 text-sm font-semibold ${
              page === p ? "bg-accent-red text-white" : "text-text-primary hover:bg-surface-light"
            }`}
          >
            {p}
          </button>
        )
      )}
    </>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="divide-y divide-white/5 rounded-xl border border-white/10 bg-surface overflow-hidden">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-4 px-4 py-3 sm:px-5"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="h-8 w-10 rounded bg-surface-lighter" />
          <div className="h-4 flex-1 rounded bg-surface-lighter" />
          <div className="hidden h-8 w-8 rounded-full bg-surface-lighter sm:block" />
          <div className="h-6 w-14 rounded bg-surface-lighter" />
          <div className="h-6 w-8 rounded bg-surface-lighter" />
          <div className="hidden h-8 w-8 rounded-full bg-surface-lighter md:block" />
        </div>
      ))}
    </div>
  );
}

export function LeaderboardPageClient({
  tierIcons,
  agentIcons,
}: {
  tierIcons: Record<string, string>;
  agentIcons: Record<string, string>;
}) {
  const [region, setRegion] = useState<RegionId>("eu");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    setError(false);
    const startIndex = (page - 1) * PAGE_SIZE + 1;
    try {
      const v3Url = `/api/valorant/v3/leaderboard/${region}/pc?start_index=${startIndex}&size=${PAGE_SIZE}`;
      let res = await fetch(v3Url);
      let json: unknown = await res.json().catch(() => null);
      const readStatus = (j: unknown, fallback: number) =>
        j && typeof j === "object" && "status" in j ? Number((j as { status: unknown }).status) : fallback;

      let st = readStatus(json, res.status);
      let parsed = parseHenrikLeaderboardV3(json);
      const v3Ok = res.ok && st === 200 && parsed !== null;

      if (!v3Ok) {
        const v1Url = `/api/valorant/v1/leaderboard/${region}?page=${page}&size=${PAGE_SIZE}`;
        res = await fetch(v1Url);
        json = await res.json().catch(() => null);
        st = readStatus(json, res.status);
        parsed = parseHenrikLeaderboardV1(json);
      }

      if (!res.ok || st !== 200 || !parsed) {
        setError(true);
        setRows([]);
        setTotal(0);
        return;
      }

      setRows(parsed.rows);
      setTotal(Math.max(parsed.total, parsed.rows.length));
    } catch {
      setError(true);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [region, page]);

  useEffect(() => {
    void fetchBoard();
  }, [fetchBoard]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const id = `${r.name}#${r.tag}`.toLowerCase();
      return id.includes(q) || r.name.toLowerCase().includes(q) || r.tag.toLowerCase().includes(q);
    });
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleRefresh = () => {
    void fetchBoard();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent-red">
          Valorant
        </p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-text-primary md:text-4xl">
          Leaderboard
        </h1>
        <p className="mt-2 max-w-xl text-sm text-text-secondary">
          Act leaderboard by region — RR, wins, and peak agent. Data via Henrik API (cached on our
          proxy).
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setRegion(r.id);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 font-heading text-sm font-semibold uppercase tracking-wide transition-colors ${
                region === r.id
                  ? "bg-accent-red text-white"
                  : "bg-surface text-text-secondary hover:bg-surface-light"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this page…"
            className="w-full rounded-full border border-white/10 bg-surface py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent-red focus:outline-none focus:ring-1 focus:ring-accent-red"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="mt-8">
        {loading ? <LeaderboardSkeleton /> : null}

        {!loading && error ? (
          <FetchErrorPanel
            title="Leaderboard unavailable"
            message="Henrik data didn’t come through. Wait a moment and retry — we cache aggressively, but upstream can still hiccup."
            onRetry={handleRefresh}
          />
        ) : null}

        {!loading && !error && rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-surface/80 px-6 py-12 text-center">
            <BarChart3 className="mx-auto size-10 text-text-secondary" aria-hidden />
            <p className="mt-4 font-heading text-sm font-bold uppercase tracking-wide text-text-primary">
              No entries for this region
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
              The act leaderboard can be empty early in a split, or the API may return zero rows.
              Try another region or refresh in a few minutes.
            </p>
          </div>
        ) : null}

        {!loading && !error && rows.length > 0 && filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-surface px-6 py-10 text-center">
            <p className="font-heading text-sm font-semibold text-text-primary">No name matches</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
              Nothing on this page matches your search. Clear the box or paginate — handles are
              often split across pages.
            </p>
          </div>
        ) : null}

        {!loading && !error && filtered.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <div className="hidden border-b border-white/10 bg-surface-light px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary sm:flex sm:items-center sm:gap-5">
              <span className="w-16 shrink-0">#</span>
              <span className="min-w-0 flex-1">Player</span>
              <span className="hidden w-10 shrink-0 text-center sm:block">Rank</span>
              <span className="ml-auto flex w-[12.5rem] shrink-0 items-center justify-between gap-5 text-right">
                <span>RR</span>
                <span>Wins</span>
                <span className="w-8 text-center">Agent</span>
              </span>
            </div>
            <ul className="divide-y divide-white/[0.06]">
              {filtered.map((r) => {
                const isTop3 = r.leaderboardRank <= 3;
                const stripe = !isTop3 && (r.leaderboardRank - 1) % 2 === 1;
                const tierUrl = tierIcons[String(r.tier)] ?? null;
                const agentUrl = r.topAgentUuid ? agentIcons[r.topAgentUuid] ?? null : null;

                return (
                  <li key={`${r.leaderboardRank}-${r.name}-${r.tag}`}>
                    <Link
                      href={playerHref(r.name, r.tag)}
                      className={`group flex flex-col gap-3 border-l-4 px-4 py-3.5 transition-colors sm:flex-row sm:items-center sm:gap-5 sm:px-6 sm:py-4 ${
                        isTop3
                          ? `bg-surface-light ${PodiumBorder(r.leaderboardRank)} ${PodiumGlow(r.leaderboardRank)} py-4 sm:py-5`
                          : stripe
                            ? "border-l-transparent bg-surface-light/35 hover:bg-surface-lighter"
                            : "border-l-transparent bg-surface hover:bg-surface-lighter"
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:w-16 sm:shrink-0 sm:justify-start">
                        <span
                          className={`font-heading font-bold tabular-nums ${isTop3 ? "text-2xl" : "text-xl"}`}
                          style={{ color: positionColor(r.leaderboardRank) }}
                        >
                          {r.leaderboardRank}
                        </span>
                        {tierUrl ? (
                          <Image
                            src={tierUrl}
                            alt=""
                            width={40}
                            height={40}
                            sizes="40px"
                            className="size-8 object-contain sm:hidden"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-text-primary group-hover:text-accent-blue">
                          {r.name}
                          <span className="text-text-secondary">#{r.tag}</span>
                        </span>
                      </div>
                      <div className="hidden w-10 shrink-0 justify-center sm:flex">
                        {tierUrl ? (
                          <Image
                            src={tierUrl}
                            alt=""
                            width={40}
                            height={40}
                            sizes="40px"
                            className="size-8 object-contain md:size-10"
                          />
                        ) : (
                          <span className="flex size-8 items-center justify-center rounded bg-surface-lighter text-xs text-text-secondary">
                            —
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 items-center justify-between gap-3 sm:w-auto sm:flex-none sm:justify-end sm:gap-8">
                        <div className="font-heading text-lg font-semibold tabular-nums text-text-primary">
                          {r.rr}
                        </div>
                        <div className="w-12 text-right text-sm tabular-nums">
                          <span className="font-medium text-text-primary">{r.wins}</span>
                        </div>
                        <div className="flex shrink-0 justify-end">
                          {agentUrl ? (
                            <Image
                              src={agentUrl}
                              alt=""
                              width={40}
                              height={40}
                              sizes="40px"
                              className="size-8 rounded-full object-cover ring-1 ring-white/10 md:size-10"
                            />
                          ) : (
                            <span
                              className="flex size-8 items-center justify-center rounded-full bg-surface-lighter text-[10px] text-text-secondary"
                              title="Top agent not provided for this entry"
                            >
                              —
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      {!loading && !error && totalPages > 1 ? (
        <nav
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
          aria-label="Pagination"
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-full border border-white/15 px-3 py-1.5 text-sm font-semibold text-text-primary disabled:opacity-40 hover:bg-surface-light"
          >
            Previous
          </button>
          <PaginationPages page={page} totalPages={totalPages} onPage={setPage} />
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-full border border-white/15 px-3 py-1.5 text-sm font-semibold text-text-primary disabled:opacity-40 hover:bg-surface-light"
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}
