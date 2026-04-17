"use client";

export function FetchErrorPanel({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void | Promise<void>;
}) {
  return (
    <div
      className="rounded-xl border border-white/10 bg-surface px-6 py-10 text-center"
      role="alert"
    >
      <p className="font-heading text-sm font-bold uppercase tracking-wide text-accent-red">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={() => void onRetry()}
          className="mt-6 rounded-full border border-white/15 bg-surface-light px-6 py-2.5 font-heading text-xs font-bold uppercase tracking-wide text-text-primary transition hover:border-accent-red hover:text-accent-red"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
