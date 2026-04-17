"use client";

import { useEffect, useState } from "react";

/** Countdown when match starts within the next 24 hours. */
export function MatchCountdown({ unixSeconds }: { unixSeconds: number }) {
  const targetMs =
    unixSeconds > 1e11 ? unixSeconds : Math.floor(unixSeconds) * 1000;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const left = targetMs - now;
  if (left <= 0 || left > 24 * 60 * 60 * 1000) return null;

  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);

  return (
    <span className="font-heading text-xs font-bold tabular-nums text-accent-red">
      {h}h {m}m {s}s
    </span>
  );
}
