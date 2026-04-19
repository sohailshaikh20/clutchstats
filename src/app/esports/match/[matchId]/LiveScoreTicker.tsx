"use client";

import { useEffect, useState } from "react";

function formatSecondsAgo(d: Date): string {
  const sec = Math.round((Date.now() - d.getTime()) / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const m = Math.floor(sec / 60);
  return `${m}m ago`;
}

export function LiveScoreTicker({
  matchId,
  initialTeam1Score,
  initialTeam2Score,
  isLive,
}: {
  matchId: string;
  initialTeam1Score: number;
  initialTeam2Score: number;
  isLive: boolean;
}) {
  const [scores, setScores] = useState({
    team1: initialTeam1Score,
    team2: initialTeam2Score,
  });
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    setScores({ team1: initialTeam1Score, team2: initialTeam2Score });
  }, [initialTeam1Score, initialTeam2Score]);

  useEffect(() => {
    if (!isLive) return;

    let mounted = true;
    async function poll() {
      try {
        const res = await fetch(`/api/esports/match/${matchId}/score`, { cache: "no-store" });
        if (!res.ok || !mounted) return;
        const data = (await res.json()) as {
          team1Score?: number;
          team2Score?: number;
        };
        setScores({
          team1: data.team1Score ?? 0,
          team2: data.team2Score ?? 0,
        });
        setLastUpdate(new Date());
      } catch {
        /* keep last scores */
      }
    }

    void poll();
    const interval = setInterval(poll, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isLive, matchId]);

  return (
    <>
      <div className="font-display text-5xl font-black tabular-nums md:text-[clamp(40px,6vw,80px)]">
        <span className={scores.team1 > scores.team2 ? "text-[#00E5D1]" : "text-white"}>
          {scores.team1}
        </span>
        <span className="mx-2 text-white/30">—</span>
        <span className={scores.team2 > scores.team1 ? "text-[#00E5D1]" : "text-white"}>
          {scores.team2}
        </span>
      </div>
      {isLive ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 font-mono-display text-[10px] uppercase tracking-[0.2em] text-white/40">
          <span className="size-1.5 shrink-0 rounded-full bg-[#FF4655] animate-pulse" />
          <span>LIVE · UPDATES EVERY 30S</span>
          {lastUpdate ? <span className="text-white/25">· SYNCED {formatSecondsAgo(lastUpdate)}</span> : null}
        </div>
      ) : null}
    </>
  );
}
