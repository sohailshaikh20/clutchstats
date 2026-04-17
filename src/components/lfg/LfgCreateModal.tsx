"use client";

import { createClient } from "@/lib/supabase/client";
import { henrikTierToRankKey, RANK_KEYS, rankLabel } from "@/lib/lfg/ranks";
import type { User } from "@supabase/supabase-js";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { AgentChip } from "./LfgFilterBar";

const REGIONS = [
  { value: "eu", label: "EU" },
  { value: "na", label: "NA" },
  { value: "ap", label: "AP" },
  { value: "kr", label: "KR" },
  { value: "br", label: "BR" },
  { value: "latam", label: "LATAM" },
] as const;

type PlaystyleChoice = "aggressive" | "support" | "flex";

export function LfgCreateModal({
  open,
  onClose,
  agents,
  user,
  viewerHenrikRank,
  viewerRegion,
  onPosted,
}: {
  open: boolean;
  onClose: () => void;
  agents: AgentChip[];
  user: User | null;
  viewerHenrikRank: number | null;
  viewerRegion: string | null;
  onPosted: () => void;
}) {
  const [rank, setRank] = useState<string>("gold");
  const [picked, setPicked] = useState<string[]>([]);
  const [region, setRegion] = useState<string>("eu");
  const [playstyle, setPlaystyle] = useState<PlaystyleChoice>("flex");
  const [description, setDescription] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (viewerHenrikRank != null && viewerHenrikRank > 0) {
      setRank(henrikTierToRankKey(viewerHenrikRank));
    }
    if (viewerRegion && REGIONS.some((r) => r.value === viewerRegion)) {
      setRegion(viewerRegion);
    }
  }, [open, viewerHenrikRank, viewerRegion]);

  const toggleAgent = (name: string) => {
    const n = name.toLowerCase();
    setPicked((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));
  };

  const submit = useCallback(async () => {
    if (!user) return;
    if (picked.length < 1) {
      setError("Pick at least one agent you play.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const row = {
      user_id: user.id,
      rank,
      agents: picked,
      region: region as "eu" | "na" | "ap" | "kr" | "latam" | "br",
      playstyle,
      description: description.slice(0, 200) || null,
      available_from: timeFrom ? `${timeFrom}:00` : null,
      available_to: timeTo ? `${timeTo}:00` : null,
      is_active: true,
    };
    const { error: e } = await supabase.from("lfg_posts").insert(row);
    setSubmitting(false);
    if (e) {
      setError(e.message);
      return;
    }
    onPosted();
    onClose();
    setDescription("");
    setPicked([]);
    setTimeFrom("");
    setTimeTo("");
  }, [user, picked, rank, region, playstyle, description, timeFrom, timeTo, onPosted, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-surface p-5 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lfg-modal-title"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="lfg-modal-title" className="font-heading text-xl font-bold text-text-primary">
                Create squad post
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-2 py-1 text-sm text-text-secondary hover:bg-surface-light hover:text-text-primary"
              >
                Close
              </button>
            </div>

            {!user ? (
              <div className="mt-6 rounded-xl border border-white/10 bg-surface-light p-5 text-center">
                <p className="text-sm text-text-secondary">Sign in to post on the squad board.</p>
                <Link
                  href="/login?next=/lfg"
                  className="mt-4 inline-flex rounded-full bg-accent-red px-5 py-2 font-heading text-sm font-bold uppercase tracking-wide text-white hover:bg-accent-red/90"
                >
                  Log in
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Your rank
                  <select
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-text-primary focus:border-accent-red focus:outline-none"
                  >
                    {RANK_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {rankLabel(k)}
                      </option>
                    ))}
                  </select>
                </label>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Agents you play
                  </p>
                  <div className="mt-2 grid max-h-48 grid-cols-6 gap-2 overflow-y-auto sm:grid-cols-8">
                    {agents.map((a) => {
                      const on = picked.includes(a.displayName.toLowerCase());
                      return (
                        <button
                          key={a.uuid}
                          type="button"
                          onClick={() => toggleAgent(a.displayName)}
                          title={a.displayName}
                          className={`flex aspect-square items-center justify-center rounded-lg border-2 transition ${
                            on ? "border-accent-red bg-surface-light" : "border-transparent bg-background hover:border-white/20"
                          }`}
                        >
                          <Image
                            src={a.displayIcon}
                            alt=""
                            width={36}
                            height={36}
                            className="size-9 object-contain"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Region
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-text-primary focus:border-accent-red focus:outline-none"
                  >
                    {REGIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>

                <fieldset>
                  <legend className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Playstyle
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {(
                      [
                        ["aggressive", "Aggressive"],
                        ["support", "Support"],
                        ["flex", "Flex"],
                      ] as const
                    ).map(([id, label]) => (
                      <label
                        key={id}
                        className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                          playstyle === id
                            ? "border-accent-red bg-accent-red/15 text-text-primary"
                            : "border-white/10 text-text-secondary hover:border-white/25"
                        }`}
                      >
                        <input
                          type="radio"
                          name="playstyle"
                          className="accent-accent-red"
                          checked={playstyle === id}
                          onChange={() => setPlaystyle(id)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="block text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Description
                  <textarea
                    value={description}
                    maxLength={200}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="What are you looking for in teammates?"
                    className="mt-1 w-full resize-none rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent-red focus:outline-none"
                  />
                  <span className="mt-1 block text-right text-[11px] text-text-secondary">
                    {description.length}/200
                  </span>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Available from (optional)
                    <input
                      type="time"
                      value={timeFrom}
                      onChange={(e) => setTimeFrom(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-text-primary focus:border-accent-red focus:outline-none"
                    />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Available to (optional)
                    <input
                      type="time"
                      value={timeTo}
                      onChange={(e) => setTimeTo(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm text-text-primary focus:border-accent-red focus:outline-none"
                    />
                  </label>
                </div>

                {error ? <p className="text-sm text-loss">{error}</p> : null}

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void submit()}
                  className="w-full rounded-full bg-accent-red py-3 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-glow-red transition hover:bg-accent-red/90 disabled:opacity-50"
                >
                  {submitting ? "Posting…" : "Find my squad"}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
