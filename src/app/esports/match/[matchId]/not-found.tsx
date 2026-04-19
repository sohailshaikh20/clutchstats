import Link from "next/link";

export default function MatchNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0A0A0C] px-6 text-center">
      <div
        className="flex size-20 items-center justify-center border border-[#FF4655]/30 bg-[#0D0D10]"
        style={{
          clipPath: "polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)",
        }}
      >
        <span className="font-display text-3xl font-black text-[#FF4655]">?</span>
      </div>
      <div>
        <p className="font-display text-2xl font-black text-white">Match not found</p>
        <p className="mt-2 max-w-sm font-mono-display text-xs tracking-[0.1em] text-white/50">
          That ID is not in the VLR feed right now.
        </p>
      </div>
      <Link
        href="/esports"
        className="border border-white/[0.08] bg-white/[0.03] px-6 py-3 font-mono-display text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 transition-colors hover:bg-white/[0.06]"
      >
        ← Back to Esports
      </Link>
    </div>
  );
}
