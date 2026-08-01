import Link from "next/link";

/**
 * Shared shell for the information pages.
 *
 * These are the pages a person reads when deciding whether to trust the
 * platform, or when something has gone wrong — so they are plain, readable and
 * navigable between, rather than styled like marketing.
 */
const PAGES = [
  { href: "/legal/about", label: "About" },
  { href: "/legal/how-it-works", label: "How to use Hyke" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/acceptable-use", label: "Acceptable use" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/report", label: "Report a site" },
];

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex-1 bg-[#050914] text-slate-300">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-6 py-14 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Information pages" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex flex-wrap gap-1 lg:flex-col">
            {PAGES.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <article className="prose-invert max-w-2xl">{children}</article>
      </div>
    </main>
  );
}
