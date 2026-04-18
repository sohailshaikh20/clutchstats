export default function PlayerProfileLoading() {
  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="relative h-52 overflow-hidden sm:h-60">
        <div className="h-full w-full animate-pulse bg-surface-lighter" />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background from-[45%] via-transparent to-accent-red/10" />
        <div className="absolute bottom-5 left-4 right-4 flex justify-between gap-4 sm:left-8 sm:right-8">
          <div className="space-y-3">
            <div className="h-9 w-56 animate-pulse rounded bg-surface-light/80" />
            <div className="h-6 w-40 animate-pulse rounded bg-surface-light/60" />
          </div>
          <div className="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-surface-light/80" />
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl space-y-5 px-4 pt-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-surface-light bg-surface"
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={`s-${i}`}
              className="h-28 animate-pulse rounded-xl border border-surface-light bg-surface"
            />
          ))}
        </div>
        <div className="h-56 animate-pulse rounded-xl border border-surface-light bg-surface" />
        <div className="h-24 animate-pulse rounded-xl border border-surface-light bg-surface" />
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 h-3 w-36 animate-pulse rounded bg-surface-light" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-[148px] animate-pulse rounded-xl border border-surface-light bg-surface"
            />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 h-3 w-48 animate-pulse rounded bg-surface-light" />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[200px] animate-pulse rounded-xl border border-surface-light bg-surface"
            />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 h-3 w-40 animate-pulse rounded bg-surface-light" />
        <div className="h-64 animate-pulse rounded-xl border border-surface-light bg-surface" />
      </div>

      <div className="mx-4 mt-6 sm:mx-6 lg:mx-8">
        <div className="mx-auto h-36 max-w-screen-2xl animate-pulse rounded-2xl border border-surface-light bg-surface" />
      </div>
    </div>
  );
}
