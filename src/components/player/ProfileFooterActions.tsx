"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Link2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { playerPathFromSearchInput } from "@/lib/riot-search";

export function ProfileFooterActions({
  riotName,
  riotTag,
}: {
  riotName: string;
  riotTag: string;
}) {
  const router = useRouter();
  const reduced = Boolean(useReducedMotion());
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState(false);

  function share() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/player/${encodeURIComponent(riotName)}/${encodeURIComponent(riotTag)}`
        : "";
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const path = playerPathFromSearchInput(q);
    if (path) {
      router.push(path);
      setQ("");
    }
  }

  return (
    <section className="border-t border-white/5 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-6 rounded-2xl border border-white/5 bg-surface/80 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-2"
        >
          <p className="font-heading text-sm font-bold uppercase tracking-wide text-text-primary">
            Share your profile
          </p>
          <p className="font-body text-sm text-text-secondary">
            Send this page to teammates — they can compare and search themselves.
          </p>
          <button
            type="button"
            onClick={share}
            className="mt-1 inline-flex min-h-[44px] max-w-xs items-center justify-center gap-2 rounded-lg bg-accent-red px-5 font-heading text-xs font-bold uppercase tracking-wide text-white shadow-glow-red transition hover:brightness-110"
          >
            <Link2 className="size-4" aria-hidden />
            {copied ? "Copied!" : "Copy profile link"}
          </button>
        </motion.div>

        <motion.form
          onSubmit={onSearch}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: reduced ? 0 : 0.06 }}
          className="w-full max-w-md"
        >
          <label className="block">
            <span className="font-body text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Search another player
            </span>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name#TAG"
                className="h-12 w-full rounded-xl border border-surface-light bg-background py-2 pl-10 pr-4 font-body text-sm text-text-primary outline-none transition focus:border-accent-red/50 focus:shadow-glow-red"
              />
            </div>
          </label>
          <button
            type="submit"
            className="mt-3 w-full min-h-[44px] rounded-lg border border-white/10 bg-surface-lighter font-heading text-xs font-bold uppercase tracking-wide text-text-primary transition hover:border-accent-red/40 hover:text-accent-red sm:w-auto sm:px-8"
          >
            Go to profile
          </button>
        </motion.form>
      </div>
    </section>
  );
}
