"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { playerPathFromSearchInput } from "@/lib/riot-search";

export function NotFoundSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hint, setHint] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setHint(null);
    const path = playerPathFromSearchInput(q);
    if (!path) {
      setHint("Use your Riot ID format: PlayerName#TAG");
      return;
    }
    router.push(path);
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 w-full max-w-md" role="search" aria-label="Player lookup">
      <label htmlFor="not-found-search" className="sr-only">
        Riot ID
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-text-secondary"
          aria-hidden
        />
        <input
          id="not-found-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          type="search"
          placeholder="PlayerName#TAG"
          className="h-12 w-full rounded-full border border-white/10 bg-surface py-2 pl-12 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent-red focus:outline-none focus:ring-1 focus:ring-accent-red"
          autoComplete="off"
        />
      </div>
      {hint ? <p className="mt-2 text-left text-xs text-accent-gold">{hint}</p> : null}
      <button
        type="submit"
        className="mt-4 w-full rounded-full bg-accent-red py-3 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-glow-red hover:bg-accent-red/90 sm:w-auto sm:px-10"
      >
        Open profile
      </button>
    </form>
  );
}
