import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-surface-light bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <Link href="/" className="font-heading text-lg font-bold">
          <span className="text-accent-red">CLUTCH</span>
          <span className="text-text-primary">STATS</span>
          <span className="text-text-secondary">.gg</span>
        </Link>

        <div className="flex flex-col items-center gap-1 text-center sm:items-end">
          <p className="text-sm text-text-secondary">© {year} ClutchStats.gg. All rights reserved.</p>
          <p className="font-body text-xs text-text-secondary/80">Built by gamers, for gamers.</p>
        </div>
      </div>
    </footer>
  );
}
