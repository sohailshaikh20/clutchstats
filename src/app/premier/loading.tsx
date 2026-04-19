export default function PremierLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] animate-pulse">
      {/* Hero skeleton */}
      <section className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-12 items-center">
        <div className="space-y-4">
          <div className="h-3 w-32 bg-white/[0.06] rounded" />
          <div className="h-12 w-3/4 bg-white/[0.06] rounded" />
          <div className="h-12 w-1/2 bg-white/[0.06] rounded" />
          <div className="h-4 w-2/3 bg-white/[0.06] rounded mt-2" />
          <div className="h-12 w-full max-w-md bg-white/[0.06] rounded mt-4" />
        </div>
        <div className="bg-[#0D0D10] border border-white/[0.06] p-6 h-[176px]" />
      </section>

      {/* Region tabs skeleton */}
      <div className="h-12 bg-[#0D0D10] border-y border-white/[0.06]" />

      {/* Subregion grid skeleton */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="h-3 w-40 bg-white/[0.06] rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#0D0D10] p-5 h-[116px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
