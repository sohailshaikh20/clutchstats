export default function PlayerProfileLoading() {
  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="relative h-52 overflow-hidden sm:h-64">
        <div className="h-full w-full animate-pulse bg-surface-lighter" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-6 left-4 right-4 flex justify-between gap-4 sm:left-8 sm:right-8">
          <div className="space-y-3">
            <div className="h-8 w-48 animate-pulse rounded bg-surface-light/80" />
            <div className="h-6 w-32 animate-pulse rounded bg-surface-light/60" />
          </div>
          <div className="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-surface-light/80" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-surface-light bg-surface"
            />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 h-4 w-40 animate-pulse rounded bg-surface-light" />
        <div className="flex flex-col gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-surface-light bg-surface"
            />
          ))}
        </div>
        <div className="mx-auto mt-8 h-10 w-32 animate-pulse rounded-full bg-surface-light" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 h-4 w-48 animate-pulse rounded bg-surface-light" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-surface-light bg-surface"
            />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 h-4 w-40 animate-pulse rounded bg-surface-light" />
        <div className="flex flex-col gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-surface" />
          ))}
        </div>
      </div>

      <div className="mx-4 mb-10 mt-4 sm:mx-6 lg:mx-8">
        <div className="mx-auto h-40 max-w-6xl animate-pulse rounded-2xl border border-surface-light bg-surface" />
      </div>
    </div>
  );
}
