"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarRange } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchVlrProxy, unwrapSegments } from "@/lib/esports/vlr-client-fetch";
import { FetchErrorPanel } from "@/components/ui/FetchErrorPanel";
import type { VLREvent } from "@/types/esports";

type EventExt = VLREvent & { teams?: number; team_count?: number };

function teamCount(e: EventExt): string {
  const n = e.teams ?? e.team_count;
  if (typeof n === "number" && n > 0) return `${n} teams`;
  return "—";
}

function hidePrize(p: string | null): boolean {
  if (!p) return true;
  const x = p.trim().toLowerCase();
  return x === "" || x === "0" || x === "--" || x === "tbd" || x === "n/a";
}

function statusBadge(status: VLREvent["status"]) {
  if (status === "ongoing") {
    return (
      <span className="rounded-full bg-win/20 px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wide text-win">
        Ongoing
      </span>
    );
  }
  if (status === "upcoming") {
    return (
      <span className="rounded-full bg-accent-blue/20 px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wide text-accent-blue">
        Upcoming
      </span>
    );
  }
  return (
    <span className="rounded-full bg-surface-light px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wide text-text-secondary">
      Completed
    </span>
  );
}

function regionPillClass(region: string): string {
  const r = (region || "").toLowerCase();
  if (r.includes("america") || r === "na") return "border-accent-blue/40 bg-accent-blue/10 text-accent-blue";
  if (r.includes("emea") || r.includes("eu")) return "border-accent-red/40 bg-accent-red/10 text-accent-red";
  if (r.includes("pacific") || r.includes("ap")) return "border-win/40 bg-win/10 text-win";
  if (r.includes("china") || r.includes("cn")) return "border-accent-gold/50 bg-accent-gold/10 text-accent-gold";
  return "border-white/10 bg-white/5 text-text-secondary";
}

export function EventsPanel() {
  const reduced = Boolean(useReducedMotion());
  const [events, setEvents] = useState<VLREvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(false);
    try {
      const [upRaw, onRaw] = await Promise.all([
        fetchVlrProxy<unknown>("/events?status=upcoming"),
        fetchVlrProxy<unknown>("/events?status=ongoing"),
      ]);
      const up = unwrapSegments<VLREvent>(upRaw);
      const on = unwrapSegments<VLREvent>(onRaw);
      const byId = new Map<string, VLREvent>();
      for (const e of up) byId.set(e.id, e);
      for (const e of on) byId.set(e.id, e);
      const merged = Array.from(byId.values()).sort((a, b) => {
        if (a.status === "ongoing" && b.status !== "ongoing") return -1;
        if (b.status === "ongoing" && a.status !== "ongoing") return 1;
        return 0;
      });
      setEvents(merged);
    } catch {
      setErr(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-xl border border-surface-light bg-surface"
          />
        ))}
      </div>
    );
  }

  if (err) {
    return (
      <FetchErrorPanel
        title="Events unavailable"
        message="We couldn’t load the tournament calendar. Try again in a moment."
        onRetry={load}
      />
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-surface/80 px-6 py-12 text-center">
        <CalendarRange className="mx-auto size-10 text-text-secondary" aria-hidden />
        <p className="mt-4 font-heading text-sm font-bold uppercase tracking-wide text-text-primary">
          No events in the feed
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
          When organisers publish upcoming or ongoing tournaments, they’ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((e, i) => {
        const ext = e as EventExt;
        const pill = regionPillClass(e.region);
        return (
          <motion.div
            key={e.id}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { delay: i * 0.04 }}
            whileHover={reduced ? undefined : { y: -3, transition: { duration: 0.2 } }}
          >
            <Link
              href={`/esports/event/${e.id}`}
              className="flex h-full flex-col rounded-xl border border-surface-light bg-surface p-5 transition-all duration-200 hover:border-accent-red/30 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="min-w-0 flex-1 font-heading text-lg font-bold leading-snug text-text-primary">
                  {e.title}
                </h3>
                {statusBadge(e.status)}
              </div>
              <span className={`mt-3 inline-flex w-fit rounded-full border px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide ${pill}`}>
                {e.region || "International"}
              </span>
              <p className="mt-3 font-body text-xs text-text-secondary">{e.dates}</p>
              {!hidePrize(e.prizepool) ? (
                <p className="mt-2 font-heading text-base font-bold text-accent-gold">{e.prizepool}</p>
              ) : null}
              {e.status === "ongoing" ? (
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-light">
                  <motion.div
                    className="h-full rounded-full bg-win"
                    initial={{ width: "32%" }}
                    animate={{ width: ["32%", "55%", "40%", "32%"] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              ) : null}
              <p className="mt-auto pt-4 font-body text-[10px] uppercase tracking-wide text-text-secondary">
                {teamCount(ext)} · Tap for event hub
              </p>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
