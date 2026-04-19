import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PremierTeamNotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div
        className="size-20 flex items-center justify-center bg-[#0D0D10] border border-white/[0.08]"
        style={{ clipPath: "polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)" }}
      >
        <span className="font-display font-black text-3xl text-[#FF4655]">?</span>
      </div>
      <div>
        <p className="font-display font-black text-2xl text-white">Team not found</p>
        <p className="mt-2 font-mono-display text-xs tracking-[0.2em] text-white/40 uppercase">
          This Premier team doesn&apos;t exist in our records
        </p>
      </div>
      <Link
        href="/premier"
        className="flex items-center gap-2 font-mono-display text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF4655] hover:brightness-110 transition-[filter]"
      >
        <ArrowLeft className="size-3" aria-hidden />
        Back to Premier
      </Link>
    </div>
  );
}
