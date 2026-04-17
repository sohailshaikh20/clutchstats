export default function PricingLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <div className="mx-auto h-8 w-48 animate-pulse rounded-lg bg-surface-light" />
        <div className="mx-auto mt-4 h-4 w-full max-w-lg animate-pulse rounded bg-surface-light/70" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-[28rem] animate-pulse rounded-2xl border border-white/5 bg-surface" />
        <div className="h-[28rem] animate-pulse rounded-2xl border border-white/5 bg-surface" />
      </div>
    </div>
  );
}
