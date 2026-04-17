export default function LfgLoading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-16 z-30 border-b border-white/5 bg-background/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-wrap gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-surface-light/70" />
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 h-10 w-48 animate-pulse rounded-lg bg-surface-light" />
        <div className="mb-2 h-4 max-w-lg animate-pulse rounded bg-surface-light/70" />
        <div className="space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl border border-white/5 bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
