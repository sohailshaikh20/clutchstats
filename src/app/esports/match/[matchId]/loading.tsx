export default function MatchLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative min-h-[280px] overflow-hidden border-b border-white/[0.06] bg-[#0A0A0C]">
        <div className="absolute left-0 top-0 h-full w-[3px] bg-[#FF4655]" />
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto_1fr]">
            <div className="flex flex-col items-center gap-3 md:items-start">
              <div className="size-20 animate-pulse bg-white/[0.08]" />
              <div className="h-8 w-40 animate-pulse bg-white/[0.08]" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-4 w-32 animate-pulse bg-white/[0.06]" />
              <div className="h-16 w-48 animate-pulse bg-white/[0.08]" />
              <div className="h-6 w-24 animate-pulse rounded-none bg-white/[0.06]" />
            </div>
            <div className="flex flex-col items-center gap-3 md:items-end">
              <div className="size-20 animate-pulse bg-white/[0.08]" />
              <div className="h-8 w-40 animate-pulse bg-white/[0.08]" />
            </div>
          </div>
        </div>
      </div>
      <div className="border-b border-white/[0.06] bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-1 px-6 py-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 w-40 animate-pulse bg-white/[0.06]" />
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-7xl space-y-4 px-6 py-8">
        <div className="h-32 animate-pulse rounded-none border border-white/[0.06] bg-[#0D0D10]" />
        <div className="h-64 min-w-full animate-pulse rounded-none border border-white/[0.06] bg-[#0D0D10]" />
      </div>
    </div>
  );
}
