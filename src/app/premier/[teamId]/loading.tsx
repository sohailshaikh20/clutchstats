export default function PremierTeamLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] animate-pulse">
      {/* Header skeleton */}
      <section className="min-h-[240px] flex items-center border-b border-white/[0.04]">
        <div className="w-full mx-auto max-w-7xl px-6 py-10">
          <div className="h-3 w-20 bg-white/[0.06] rounded mb-8" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div
              className="size-[120px] bg-white/[0.06] shrink-0"
              style={{ clipPath: "polygon(20px 0,100% 0,100% calc(100% - 20px),calc(100% - 20px) 100%,0 100%,0 20px)" }}
            />
            <div className="flex-1 space-y-3">
              <div className="h-3 w-32 bg-white/[0.06] rounded" />
              <div className="h-10 w-72 bg-white/[0.06] rounded" />
              <div className="h-4 w-24 bg-white/[0.06] rounded" />
            </div>
            <div
              className="bg-[#0D0D10] border border-white/[0.06] h-[116px] w-[140px] shrink-0"
              style={{ clipPath: "polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)" }}
            />
          </div>
        </div>
      </section>

      {/* Tab bar skeleton */}
      <div className="h-12 bg-[#0D0D10] border-b border-white/[0.06]" />

      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0D0D10] border border-white/[0.06] h-[140px]" />
          <div className="bg-[#0D0D10] border border-white/[0.06] h-[140px]" />
        </div>
        <div className="bg-[#0D0D10] border border-white/[0.06] h-[200px]" />
        <div className="bg-[#0D0D10] border border-white/[0.06] h-[260px]" />
      </div>
    </div>
  );
}
