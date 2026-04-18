"use client";

export interface TiltMeterProps {
  matches: Array<{ result: "win" | "loss" | "draw" }>;
}

const WIN = "#00E5D1";
const LOSS = "#FF4655";
const DRAW = "#FFB547";

function streakFromStart(matches: TiltMeterProps["matches"]): { len: number; kind: "win" | "loss" | null } {
  if (!matches.length) return { len: 0, kind: null };
  const first = matches[0].result;
  if (first === "draw") return { len: 0, kind: null };
  let len = 0;
  for (const m of matches) {
    if (m.result !== first) break;
    len += 1;
  }
  return { len, kind: first === "win" || first === "loss" ? first : null };
}

function isAlternatingRecent(matches: TiltMeterProps["matches"], take: number): boolean {
  const slice = matches.slice(0, take);
  if (slice.length < 4) return false;
  for (let i = 0; i < slice.length - 1; i++) {
    const a = slice[i].result;
    const b = slice[i + 1].result;
    if (a === "draw" || b === "draw" || a === b) return false;
  }
  return true;
}

export function TiltMeter({ matches }: TiltMeterProps) {
  const strip = matches.slice(0, 20);
  const wins = strip.filter((m) => m.result === "win").length;
  const losses = strip.filter((m) => m.result === "loss").length;

  const { len: streakLen, kind: streakKind } = streakFromStart(strip);
  const alternating = isAlternatingRecent(strip, 8);

  let suffix: { text: string; className: string } | null = null;
  if (alternating) {
    suffix = { text: "(mixed)", className: "text-white/50" };
  } else if (streakLen >= 3 && streakKind === "win") {
    suffix = { text: `(on a ${streakLen}-win streak)`, className: "text-[#00E5D1]" };
  } else if (streakLen >= 3 && streakKind === "loss") {
    suffix = { text: `(on a ${streakLen}-loss streak)`, className: "text-accent-red" };
  }

  return (
    <div className="mt-5">
      <div className="flex items-center gap-2">
        <span className="h-3 w-[2px] shrink-0 rounded-[1px] bg-accent-red" aria-hidden />
        <p className="font-mono-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">
          Recent form
        </p>
      </div>
      <div className="mt-2 flex flex-wrap gap-0.5" aria-hidden>
        {strip.map((m, i) => {
          const bg = m.result === "win" ? WIN : m.result === "loss" ? LOSS : DRAW;
          const op = m.result === "draw" ? 0.6 : 0.8;
          return (
            <span
              key={i}
              className="inline-block h-[18px] w-2.5 rounded-[1px]"
              style={{ backgroundColor: bg, opacity: op }}
            />
          );
        })}
      </div>
      <p className="mt-2 font-mono-display text-[11px] font-bold tabular-nums">
        <span className="text-[#00E5D1]">{wins}W</span>
        <span className="text-white/35"> </span>
        <span className="text-accent-red">{losses}L</span>
        {suffix ? <span className={`ml-1.5 font-medium ${suffix.className}`}>{suffix.text}</span> : null}
      </p>
    </div>
  );
}
