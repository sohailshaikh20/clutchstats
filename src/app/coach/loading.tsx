export default function CoachLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-surface-light" />
      <div className="mt-4 h-4 max-w-xl animate-pulse rounded bg-surface-light/70" />
      <div className="mt-10 h-64 animate-pulse rounded-2xl border border-white/5 bg-surface" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="h-32 animate-pulse rounded-xl border border-white/5 bg-surface" />
        <div className="h-32 animate-pulse rounded-xl border border-white/5 bg-surface" />
      </div>
    </div>
  );
}
