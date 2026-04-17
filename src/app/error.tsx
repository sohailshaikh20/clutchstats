"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent-red">
        ClutchStats.gg
      </p>
      <h1 className="mt-3 font-heading text-2xl font-bold text-text-primary">Something broke</h1>
      <p className="mt-3 text-sm text-text-secondary">
        An unexpected error occurred. You can try again — if it keeps happening, check back later.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 rounded-full bg-accent-red px-8 py-3 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-glow-red hover:bg-accent-red/90"
      >
        Retry
      </button>
    </div>
  );
}
