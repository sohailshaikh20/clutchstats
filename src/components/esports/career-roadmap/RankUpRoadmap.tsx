"use client";

import type { RoadmapRankGroup } from "@/lib/esports/rank-roadmap-data";
import { getGuidanceForRank } from "@/lib/esports/rank-guidance";
import { valorantColorToCss } from "@/lib/valorant/game-assets";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Eye,
  Gamepad2,
  MapPin,
  Rocket,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

export type RankUpAgent = { displayName: string; displayIcon: string };

function hexToCssGlow(colorHex: string): string | undefined {
  const raw = colorHex.replace(/^#/, "");
  const full = raw.length === 6 ? `${raw}ff` : raw.length >= 8 ? raw.slice(0, 8) : null;
  if (!full) return undefined;
  const rgba = valorantColorToCss(full);
  return rgba ? `0 0 28px ${rgba}, 0 0 48px ${rgba}` : undefined;
}

function HowToGoPro() {
  const steps = [
    { icon: Gamepad2, title: "Play ranked", body: "Build consistency and visible MMR on your main." },
    { icon: Users, title: "Join a team", body: "Scrims teach comms, roles, and map defaults faster than soloQ." },
    { icon: Trophy, title: "Compete in qualifiers", body: "Open cups and regional ladders are the on-ramp to circuits." },
    { icon: Eye, title: "Get scouted", body: "VODs, clips, and networking — visibility follows preparation." },
    { icon: Rocket, title: "Challengers / Ascension", body: "Earn promotion through league placement and Ascension runs." },
  ];
  return (
    <section className="mt-16 rounded-xl border border-white/10 bg-surface p-5 sm:p-8">
      <h2 className="font-heading text-lg font-bold text-text-primary sm:text-xl">How to go pro</h2>
      <p className="mt-1 max-w-2xl text-sm text-text-secondary">
        A compressed ladder from ranked grind to VCT-adjacent competition — not every path is linear,
        but the habits compound.
      </p>
      <div className="mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 touch-pan-x sm:mx-0 sm:grid sm:snap-none sm:grid-cols-5 sm:overflow-visible sm:px-0 sm:pb-0">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.06 }}
            className="relative flex min-w-[220px] shrink-0 snap-start flex-col items-center rounded-lg border border-white/10 bg-surface-light p-4 text-center sm:min-w-0 sm:shrink"
          >
            <div className="flex size-11 items-center justify-center rounded-full border border-accent-red/40 bg-background text-accent-red">
              <s.icon className="size-5" aria-hidden />
            </div>
            <p className="mt-3 font-heading text-xs font-bold uppercase tracking-wide text-accent-gold">
              Step {i + 1}
            </p>
            <h3 className="mt-1 font-heading text-sm font-semibold text-text-primary">{s.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">{s.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function RankUpRoadmap({
  rankGroups,
  agents,
  userRankGroupKey,
  riotLinked,
}: {
  rankGroups: RoadmapRankGroup[];
  agents: RankUpAgent[];
  userRankGroupKey: string | null;
  riotLinked: boolean;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const agentIconByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of agents) {
      m.set(a.displayName.trim().toLowerCase(), a.displayIcon);
    }
    return m;
  }, [agents]);

  if (rankGroups.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-surface p-8 text-center text-sm text-text-secondary">
        Rank assets could not be loaded. Try again later.
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-xl border border-white/10 bg-surface p-4 sm:p-6">
        <h2 className="font-heading text-lg font-bold text-text-primary sm:text-xl">Rank-up roadmap</h2>
        <p className="mt-1 text-sm text-text-secondary">
          From Iron to Radiant — curated focus areas, common pitfalls, and training cadence using live
          rank art from Valorant&apos;s asset API.
        </p>
        {!riotLinked ? (
          <p className="mt-3 rounded-md border border-white/10 bg-surface-light px-3 py-2 text-xs text-text-secondary">
            Sign in and link your Riot account on ClutchStats so we can sync your competitive rank and
            show a <span className="font-semibold text-text-primary">&quot;You are here&quot;</span> marker on
            the matching tier.
          </p>
        ) : null}
      </div>

      <div className="relative mt-8 pl-8 sm:pl-6">
        <div
          className="pointer-events-none absolute left-[15px] top-0 h-full w-0.5 bg-accent-red/70 sm:left-[27px]"
          aria-hidden
        />
        <div className="space-y-10 sm:space-y-12">
          {rankGroups.map((g, idx) => {
            const guidance = getGuidanceForRank(g.key);
            const isYou = Boolean(userRankGroupKey && userRankGroupKey === g.key);
            const glow = g.colorHex ? hexToCssGlow(g.colorHex) : undefined;
            const expanded = openKey === g.key;

            return (
              <motion.div
                key={g.key}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.24) }}
                className="relative pl-1 sm:pl-16"
              >
                <div
                  className="absolute left-[13px] top-8 size-3 rounded-full border-2 border-background bg-accent-red sm:left-[26px]"
                  aria-hidden
                />

                {isYou ? (
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent-red bg-accent-red/15 px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-accent-red shadow-glow-red">
                    <MapPin className="size-3.5" aria-hidden />
                    You are here
                  </div>
                ) : null}

                <div
                  className={`rounded-xl border bg-surface-light p-4 sm:p-5 ${
                    isYou ? "border-accent-red shadow-glow-red" : "border-white/10"
                  }`}
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <div
                      className="relative shrink-0 rounded-full border border-white/10 bg-background/80 p-1"
                      style={{ boxShadow: glow }}
                    >
                      {g.iconUrl ? (
                        <Image
                          src={g.iconUrl}
                          alt=""
                          width={48}
                          height={48}
                          sizes="48px"
                          className="size-12 rounded-full object-contain"
                        />
                      ) : (
                        <div className="flex size-12 items-center justify-center text-xs text-text-secondary">
                          —
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-heading text-xl font-bold text-text-primary">
                        {g.displayName}
                      </h3>
                      <p className="text-sm text-accent-gold">Divisions {g.divisionLabel}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpenKey(expanded ? null : g.key)}
                    className="mt-4 flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-surface px-3 py-2.5 text-left text-sm font-semibold text-text-primary transition hover:border-accent-blue/50"
                    aria-expanded={expanded}
                  >
                    What you need at this rank
                    <ChevronDown
                      className={`size-4 shrink-0 text-text-secondary transition ${expanded ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded ? (
                      <motion.div
                        key="c"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-4 border-t border-white/10 pt-4 text-sm">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-accent-blue">
                              Key skills
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1 text-text-secondary">
                              {guidance.skills.map((s) => (
                                <li key={s}>{s}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-accent-red">
                              Common mistakes
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1 text-text-secondary">
                              {guidance.mistakes.map((s) => (
                                <li key={s}>{s}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-accent-gold">
                              Recommended agents
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {guidance.agentNames.map((name) => {
                                const icon = agentIconByName.get(name.toLowerCase());
                                return (
                                  <span
                                    key={name}
                                    className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-surface px-2 py-1 text-xs text-text-primary"
                                  >
                                    {icon ? (
                                      <Image src={icon} alt="" width={22} height={22} className="size-[22px]" />
                                    ) : null}
                                    {name}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
                              Recommended training
                            </p>
                            <p className="mt-2 text-text-primary">{guidance.training}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
                              Estimated time to rank up
                            </p>
                            <p className="mt-2 font-medium text-text-primary">{guidance.eta}</p>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <HowToGoPro />
    </div>
  );
}
