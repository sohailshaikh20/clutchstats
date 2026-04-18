export default function EsportsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      <div className="h-4 w-20 animate-pulse rounded bg-surface-light" />
      <div className="mt-3 h-10 w-2/3 max-w-lg animate-pulse rounded-lg bg-surface-light" />
      <div className="mt-3 h-4 max-w-2xl animate-pulse rounded bg-surface-light/70" />
      <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-28 animate-pulse rounded-full bg-surface-light/60" />
        ))}
      </div>
      <div className="mt-8 space-y-6">
        <div className="h-40 animate-pulse rounded-xl border border-white/5 bg-surface" />
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-xl border border-white/5 bg-surface"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
