export default function LeaderboardLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="mb-8 h-4 w-24 animate-pulse rounded bg-surface-light" />
      <div className="mb-2 h-10 w-56 animate-pulse rounded-lg bg-surface-light" />
      <div className="mb-8 h-4 max-w-xl animate-pulse rounded bg-surface-light/70" />
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-16 animate-pulse rounded-full bg-surface-light/70" />
        ))}
      </div>
      <div className="mt-8 divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10 bg-surface">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-4 px-4 py-3 sm:px-5">
            <div className="h-8 w-10 rounded bg-surface-lighter" />
            <div className="h-4 flex-1 rounded bg-surface-lighter" />
            <div className="hidden h-8 w-8 rounded-full bg-surface-lighter sm:block" />
            <div className="h-6 w-14 rounded bg-surface-lighter" />
            <div className="h-6 w-8 rounded bg-surface-lighter" />
            <div className="hidden h-8 w-8 rounded-full bg-surface-lighter md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
