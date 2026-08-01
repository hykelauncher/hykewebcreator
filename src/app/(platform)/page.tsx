import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { TEMPLATES } from "@/lib/templates";
import { THEMES } from "@/lib/themes";

const STEPS = [
  {
    step: "01",
    title: "Pick a template",
    body: "Preview the whole thing first — every page, exactly as it will look.",
  },
  {
    step: "02",
    title: "Make it yours",
    body: "Drag blocks around, swap the words, drop in your photos. No code.",
  },
  {
    step: "03",
    title: "Publish it",
    body: "Your own address, live in seconds. Custom domains when you're ready.",
  },
];

const FEATURES = [
  {
    title: "Drafts, then publish",
    body: "Edits autosave privately. Nothing reaches visitors until you say so.",
  },
  {
    title: "Take enquiries",
    body: "Forms, attachments and a shopping bag that sends orders straight to you.",
  },
  {
    title: "Plugins, not plumbing",
    body: "WhatsApp button, announcement bar, analytics — switch on, fill in, done.",
  },
  {
    title: "Yours to undo",
    body: "Every publish is snapshotted, so a bad edit is never permanent.",
  },
];

export default async function HomePage() {
  const user = await currentUser();
  const showcase = TEMPLATES.filter((t) => t.id !== "blank");

  return (
    <main className="flex flex-1 flex-col bg-[#050914] text-slate-100">
      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:pt-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(96,165,250,0.22),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.18),transparent_40%)]"
        />
        <div className="relative mx-auto w-full max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
            Free while in beta
          </span>
          <h1 className="mt-6 text-balance text-5xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
            Build a site you&apos;re not embarrassed to send.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            Pick a design that already looks finished, change the words, and
            publish. Takes about ten minutes.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={user ? "/dashboard" : "/sign-up"}
              className="rounded-full bg-blue-500 px-7 py-3.5 font-medium text-white shadow-[0_0_32px_rgba(96,165,250,0.4)] transition hover:-translate-y-0.5 hover:bg-blue-400"
            >
              {user ? "Go to dashboard" : "Start building — it's free"}
            </Link>
            <Link
              href={`/templates/${showcase[0]?.id ?? "portfolio"}`}
              className="rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-medium text-slate-100 transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              See a live example
            </Link>
          </div>
        </div>

        {/* A real template, rendered — not a mockup. */}
        <div className="relative mx-auto mt-16 w-full max-w-5xl">
          <div
            className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
            style={{ containerType: "inline-size" }}
          >
            <div className="relative h-[420px] w-full bg-white">
              <iframe
                src="/templates/boutique/thumb"
                title="A site built with Hyke"
                loading="lazy"
                tabIndex={-1}
                aria-hidden
                scrolling="no"
                className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
                style={{
                  width: "1440px",
                  height: "1100px",
                  transform: "scale(calc(100cqw / 1440px))",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto grid w-full max-w-5xl gap-10 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.step}>
              <span className="text-sm font-semibold tracking-[0.18em] text-blue-400">
                {s.step}
              </span>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2 leading-relaxed text-slate-400">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Templates, shown for real ---- */}
      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Start from a template
              </h2>
              <p className="mt-2 text-slate-400">
                {showcase.length} designs across {THEMES.length} themes. Open
                any one and look around before you choose.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {showcase.map((t) => (
              <Link
                key={t.id}
                href={`/templates/${t.id}`}
                className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div
                  className="relative h-52 w-full overflow-hidden bg-white"
                  style={{ containerType: "inline-size" }}
                >
                  <iframe
                    src={`/templates/${t.id}/thumb`}
                    title={`${t.name} preview`}
                    loading="lazy"
                    tabIndex={-1}
                    aria-hidden
                    scrolling="no"
                    className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
                    style={{
                      width: "1280px",
                      height: "1000px",
                      transform: "scale(calc(100cqw / 1280px))",
                    }}
                  />
                </div>
                <div className="flex items-start justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="font-medium">{t.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-slate-400">
                      {t.description}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="mt-1 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-slate-300"
                  >
                    ↗
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---- What you get ---- */}
      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto grid w-full max-w-5xl gap-8 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
            >
              <h3 className="text-lg font-semibold tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2 leading-relaxed text-slate-400">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Close ---- */}
      <section className="border-t border-white/10 px-6 py-24 text-center">
        <h2 className="mx-auto max-w-2xl text-balance text-4xl font-bold tracking-tight">
          Your site is about ten minutes away.
        </h2>
        <Link
          href={user ? "/dashboard" : "/sign-up"}
          className="mt-8 inline-block rounded-full bg-blue-500 px-8 py-4 font-medium text-white shadow-[0_0_32px_rgba(96,165,250,0.4)] transition hover:-translate-y-0.5 hover:bg-blue-400"
        >
          {user ? "Go to dashboard" : "Start building — it's free"}
        </Link>
      </section>

      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-sm text-slate-500">
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/legal/about" className="hover:text-slate-300">
              About
            </Link>
            <Link href="/legal/how-it-works" className="hover:text-slate-300">
              How to use Hyke
            </Link>
            <Link href="/legal/terms" className="hover:text-slate-300">
              Terms
            </Link>
            <Link href="/legal/acceptable-use" className="hover:text-slate-300">
              Acceptable use
            </Link>
            <Link href="/legal/privacy" className="hover:text-slate-300">
              Privacy
            </Link>
            <Link href="/legal/report" className="hover:text-slate-300">
              Report a site
            </Link>
          </nav>
          <p>Hyke — build and host your own website.</p>
        </div>
      </footer>
    </main>
  );
}
