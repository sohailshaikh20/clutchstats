export default function RootLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-4 w-24 animate-pulse rounded bg-surface-light" />
      <div className="mt-4 h-10 max-w-md animate-pulse rounded-lg bg-surface-light" />
      <div className="mt-3 h-4 max-w-xl animate-pulse rounded bg-surface-light/80" />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="h-48 animate-pulse rounded-xl border border-white/5 bg-surface" />
        <div className="h-48 animate-pulse rounded-xl border border-white/5 bg-surface" />
      </div>
    </div>
  );
}
