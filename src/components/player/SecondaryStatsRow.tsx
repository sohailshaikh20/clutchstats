"use client";

import { animate, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

function useCountUp(target: number, formatter: (n: number) => string) {
  const reduced = Boolean(useReducedMotion());
  const [v, setV] = useState(reduced ? target : 0);

  useEffect(() => {
    if (reduced) {
      setV(target);
      return;
    }
    setV(0);
    const controls = animate(0, target, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: setV,
    });
    return () => controls.stop();
  }, [target, reduced]);

  return formatter(v);
}

export function SecondaryStatsRow({
  avgDamagePerRound,
  killsPerRound,
  deathsPerRound,
  abilityCastsTotal,
}: {
  avgDamagePerRound: number;
  killsPerRound: number;
  deathsPerRound: number;
  abilityCastsTotal: number | null;
}) {
  const reduced = Boolean(useReducedMotion());

  const adr = useCountUp(avgDamagePerRound, (n) => n.toFixed(1));
  const kpr = useCountUp(killsPerRound, (n) => n.toFixed(3));
  const dpr = useCountUp(deathsPerRound, (n) => n.toFixed(3));
  const abilityAnimated = useCountUp(abilityCastsTotal ?? 0, (n) => n.toFixed(2));
  const abilityDisplay = abilityCastsTotal == null ? "—" : abilityAnimated;

  const cards = [
    { key: "adr", label: "Avg damage / round", value: adr },
    { key: "kpr", label: "Kills / round", value: kpr },
    { key: "dpr", label: "Deaths / round", value: dpr },
    {
      key: "ab",
      label: "Ability usage",
      value: abilityDisplay,
      exclusive: true as const,
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduced ? 0 : 0.04, delayChildren: 0.04 } },
      }}
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {cards.map((c, i) => (
        <motion.div
          key={c.key}
          custom={i}
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
          }}
          whileHover={reduced ? undefined : { y: -2, transition: { duration: 0.2 } }}
          className={`rounded-xl bg-gradient-to-br from-surface-light/60 via-surface-light/15 to-transparent p-px transition-shadow hover:shadow-lg hover:shadow-black/25 ${
            "exclusive" in c && c.exclusive ? "ring-1 ring-accent-gold/35" : ""
          }`}
        >
          <div className="relative flex h-full flex-col rounded-[11px] bg-surface px-3 py-4 text-center">
            {"exclusive" in c && c.exclusive ? (
              <span className="absolute right-2 top-2 rounded bg-accent-gold/15 px-1.5 py-0.5 font-heading text-[9px] font-bold uppercase tracking-wider text-accent-gold">
                Exclusive
              </span>
            ) : null}
            <span className="font-heading text-2xl font-bold tabular-nums text-text-primary">
              {c.value}
            </span>
            <p className="mt-2 font-body text-[10px] font-medium uppercase tracking-wider text-text-secondary">
              {c.label}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
