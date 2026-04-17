"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarRange } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  fetchVlrProxy,
  unwrapSegments,
} from "@/lib/esports/vlr-client-fetch";
import { FetchErrorPanel } from "@/components/ui/FetchErrorPanel";
import type { VLREvent } from "@/types/esports";

type EventExt = VLREvent & { teams?: number; team_count?: number };

function eventUrl(e: VLREvent): string {
  if (e.url?.startsWith("http")) return e.url;
  return `https://www.vlr.gg${e.url ?? ""}`;
}

function teamCount(e: EventExt): string {
  const n = e.teams ?? e.team_count;
  if (typeof n === "number" && n > 0) return `${n} teams`;
  return "—";
}

function statusBadge(status: VLREvent["status"]) {
  if (status === "ongoing") {
    return (
      <span className="rounded-full bg-win/15 px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wide text-win">
        Ongoing
      </span>
    );
  }
  if (status === "upcoming") {
    return (
      <span className="rounded-full bg-accent-blue/15 px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wide text-accent-blue">
        Upcoming
      </span>
    );
  }
  return (
    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-heading font-bold uppercase tracking-wide text-text-secondary">
      Completed
    </span>
  );
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
          When organisers publish upcoming or ongoing tournaments, they’ll show up here. You can
          always browse the full calendar on VLR.
        </p>
        <Link
          href="https://www.vlr.gg/events"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex font-semibold text-accent-blue underline-offset-4 hover:underline"
        >
          Open VLR events →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((e, i) => {
        const ext = e as EventExt;
        return (
          <motion.div
            key={e.id}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { delay: i * 0.04 }}
          >
            <Link
              href={eventUrl(e)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-full flex-col rounded-xl border border-surface-light bg-surface p-4 transition-[border-color,box-shadow] hover:border-accent-blue/30 hover:shadow-glow-blue/20"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="min-w-0 flex-1 font-heading text-base font-bold leading-snug text-text-primary">
                  {e.title}
                </h3>
                {statusBadge(e.status)}
              </div>
              <p className="mt-3 font-body text-xs text-text-secondary">{e.dates}</p>
              {e.prizepool ? (
                <p className="mt-1 font-heading text-xs font-semibold text-accent-gold">
                  {e.prizepool}
                </p>
              ) : null}
              <p className="mt-auto pt-4 font-heading text-[10px] uppercase tracking-wide text-text-secondary">
                {teamCount(ext)} · {e.region}
              </p>
              <span className="mt-2 text-xs font-semibold text-accent-blue">
                Brackets, teams & schedule on VLR →
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
