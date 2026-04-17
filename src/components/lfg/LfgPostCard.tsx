"use client";

import { computeCompatibilityPercent } from "@/lib/lfg/compatibility";
import { rankLabel } from "@/lib/lfg/ranks";
import type { Agent } from "@/types/valorant";
import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { LfgPostWithProfile } from "./types";
import { profileFromPost } from "./types";

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const s = Math.floor((Date.now() - then) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

function playstyleBadgeClass(p: string | null): string {
  const x = (p ?? "").toLowerCase();
  if (x === "aggressive") return "bg-accent-red/20 text-accent-red border-accent-red/40";
  if (x === "support") return "bg-accent-blue/15 text-accent-blue border-accent-blue/35";
  if (x === "flex") return "bg-accent-gold/15 text-accent-gold border-accent-gold/40";
  return "bg-surface-lighter text-text-secondary border-white/10";
}

const DISCORD_URL = process.env.NEXT_PUBLIC_LFG_DISCORD_URL ?? "https://discord.gg/valorant";

export function LfgPostCard({
  post,
  rankVisuals,
  agentByName,
  allAgents,
  viewerHenrikRank,
  filterAgentNames,
  isNew,
}: {
  post: LfgPostWithProfile;
  rankVisuals: Record<string, { icon: string; label: string }>;
  agentByName: Map<string, Agent>;
  allAgents: Agent[];
  viewerHenrikRank: number | null;
  filterAgentNames: string[];
  isNew?: boolean;
}) {
  const prof = profileFromPost(post);
  const rankKey = post.rank.toLowerCase();
  const rv =
    rankVisuals[rankKey] ??
    rankVisuals.gold ??
    Object.values(rankVisuals)[0];
  const verified = Boolean(prof?.riot_puuid);
  const displayAgents = post.agents.slice(0, 5);
  const compat =
    viewerHenrikRank != null && viewerHenrikRank > 0
      ? computeCompatibilityPercent({
          viewerHenrikRank,
          postRankKey: post.rank,
          postAgents: post.agents,
          filterAgentNames,
          allAgents,
        })
      : null;

  return (
    <motion.article
      layout
      initial={isNew ? { opacity: 0, y: -16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className="rounded-xl border border-white/10 bg-surface p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-lg sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-surface-light">
            {prof?.avatar_url ? (
              // User avatars come from arbitrary OAuth URLs — skip next/image domain allowlist.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={prof.avatar_url} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center font-heading text-lg font-bold text-text-secondary">
                {(prof?.username ?? "?").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-heading text-lg font-semibold text-text-primary">
                {prof?.username ?? "Player"}
              </span>
              {verified ? (
                <span className="inline-flex items-center gap-0.5 rounded-full border border-accent-blue/40 bg-accent-blue/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-blue">
                  <BadgeCheck className="size-3.5" aria-hidden />
                  Verified
                </span>
              ) : null}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {rv?.icon ? (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-surface-light px-2 py-0.5">
                  <Image src={rv.icon} alt="" width={20} height={20} className="size-5 object-contain" />
                  <span className="text-xs font-medium text-text-primary">{rv.label}</span>
                </span>
              ) : (
                <span className="text-xs text-text-secondary">{rankLabel(post.rank)}</span>
              )}
              <span className="rounded-md border border-white/10 bg-background/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-text-secondary">
                {post.region}
              </span>
              {post.playstyle ? (
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${playstyleBadgeClass(post.playstyle)}`}
                >
                  {post.playstyle.charAt(0).toUpperCase() + post.playstyle.slice(1)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        {compat != null ? (
          <div className="shrink-0 rounded-full border border-accent-gold/40 bg-accent-gold/10 px-3 py-1 font-heading text-xs font-bold uppercase tracking-wide text-accent-gold">
            Compatibility · {compat}%
          </div>
        ) : null}
      </div>

      {displayAgents.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {displayAgents.map((name) => {
            const a = agentByName.get(name.trim().toLowerCase());
            return (
              <span
                key={name}
                className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-surface-light"
              >
                {a?.displayIcon ? (
                  <Image src={a.displayIcon} alt="" width={32} height={32} className="size-8 object-contain" />
                ) : (
                  <span className="text-[10px] text-text-secondary">{name.slice(0, 2)}</span>
                )}
              </span>
            );
          })}
        </div>
      ) : null}

      {post.description ? (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-text-secondary">{post.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
        <span className="text-xs text-text-secondary">{timeAgo(post.created_at)}</span>
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/15 bg-surface-light px-4 py-1.5 text-xs font-semibold text-text-primary transition hover:border-accent-blue hover:text-accent-blue"
        >
          Contact on Discord
        </a>
      </div>

      {prof?.riot_name && prof?.riot_tag ? (
        <p className="mt-2 text-[11px] text-text-secondary">
          Riot:{" "}
          <Link
            href={`/player/${encodeURIComponent(prof.riot_name)}/${encodeURIComponent(prof.riot_tag)}`}
            className="font-medium text-accent-blue hover:underline"
          >
            {prof.riot_name}#{prof.riot_tag}
          </Link>
        </p>
      ) : null}
    </motion.article>
  );
}
