"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function PlayerNotFound({
  defaultName,
  defaultTag,
}: {
  defaultName?: string;
  defaultTag?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(defaultName ?? "");
  const [tag, setTag] = useState(defaultTag ?? "");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const n = name.trim();
    const t = tag.trim();
    if (!n || !t) return;
    router.push(
      `/player/${encodeURIComponent(n)}/${encodeURIComponent(t)}`
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20"
    >
      <h1 className="font-heading text-3xl font-bold text-text-primary">
        Player not found
      </h1>
      <p className="mt-3 max-w-md text-center text-sm text-text-secondary">
        Check the name and tag, or search again.
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Riot name"
          className="h-12 flex-1 rounded-xl border border-surface-light bg-surface px-4 font-heading text-sm text-text-primary outline-none focus:border-accent-red"
        />
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Tag"
          className="h-12 flex-1 rounded-xl border border-surface-light bg-surface px-4 font-heading text-sm text-text-primary outline-none focus:border-accent-red"
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="h-12 shrink-0 rounded-xl bg-accent-red px-6 font-heading text-xs font-bold uppercase tracking-wide text-white"
        >
          Search
        </motion.button>
      </form>
      <Link
        href="/leaderboard"
        className="mt-8 font-heading text-sm font-semibold text-accent-blue underline-offset-4 hover:underline"
      >
        View leaderboard →
      </Link>
    </motion.main>
  );
}
