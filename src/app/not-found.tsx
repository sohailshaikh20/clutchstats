import Link from "next/link";
import { NotFoundSearch } from "@/components/layout/NotFoundSearch";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-heading text-xs font-semibold uppercase tracking-widest text-accent-red">
        ClutchStats.gg
      </p>
      <h1 className="mt-3 font-heading text-6xl font-bold text-text-primary">404</h1>
      <p className="mt-4 text-lg text-text-secondary">That page doesn&apos;t exist or was moved.</p>

      <NotFoundSearch />

      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        <Link href="/" className="font-semibold text-accent-blue underline-offset-4 hover:underline">
          Home
        </Link>
        <Link href="/esports" className="font-semibold text-accent-blue underline-offset-4 hover:underline">
          Esports
        </Link>
        <Link href="/lfg" className="font-semibold text-accent-blue underline-offset-4 hover:underline">
          Find squad
        </Link>
      </div>
    </div>
  );
}
