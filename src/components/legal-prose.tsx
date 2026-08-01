/**
 * Typography for the information pages.
 *
 * A handful of small components rather than a prose plugin, so these pages
 * stay readable without pulling the tenant design tokens (which belong to
 * published sites) into the builder app.
 */
export function LegalTitle({
  children,
  updated,
}: {
  children: React.ReactNode;
  updated?: string;
}) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
        {children}
      </h1>
      {updated ? (
        <p className="mt-2 text-sm text-slate-500">Last updated {updated}</p>
      ) : null}
    </header>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 mb-3 text-xl font-semibold tracking-tight text-slate-100">
      {children}
    </h2>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 leading-[1.75] text-slate-400">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mb-4 flex list-disc flex-col gap-2 pl-5 leading-[1.75] text-slate-400 marker:text-slate-600">
      {children}
    </ul>
  );
}

/**
 * Used where the text needs a lawyer's eye before it is relied on. Visible on
 * purpose: a placeholder that looks finished is worse than no page at all.
 */
export function NeedsReview({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4">
      <p className="text-sm font-semibold text-amber-300">
        Needs a lawyer&apos;s review before launch
      </p>
      <p className="mt-1 text-sm leading-relaxed text-amber-100/70">
        {children}
      </p>
    </div>
  );
}
