export default function RoadmapLoading() {
  return (
    <div className="min-h-screen bg-background pb-20 pt-6 sm:pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 h-4 w-40 animate-pulse rounded bg-surface-light/70" />
        <div className="mb-10 h-10 max-w-md animate-pulse rounded-lg bg-surface-light" />
        <div className="h-[min(70vh,520px)] animate-pulse rounded-2xl border border-white/5 bg-surface" />
      </div>
    </div>
  );
}
