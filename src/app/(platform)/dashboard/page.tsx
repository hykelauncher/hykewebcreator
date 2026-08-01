import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { getDb } from "@/db";
import { enquiries, pages, sites } from "@/db/schema";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { getSiteUrl } from "@/lib/tenant";
import { getTheme } from "@/lib/themes";
import { CreateSiteForm } from "./create-site-form";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  // Carries the choice through from a template preview's "Use this template".
  const { template: preselectedTemplate } = await searchParams;
  const { userId } = await auth();
  const db = getDb();
  const mySites = userId
    ? await db
        .select()
        .from(sites)
        .where(eq(sites.ownerId, userId))
        .orderBy(desc(sites.updatedAt))
    : [];

  const siteIds = mySites.map((s) => s.id);

  // One query each rather than per-card, so the dashboard doesn't fan out.
  const pageCounts = siteIds.length
    ? await db
        .select({
          siteId: pages.siteId,
          total: sql<number>`count(*)::int`,
          live: sql<number>`count(*) filter (where ${pages.publishedContent} is not null)::int`,
        })
        .from(pages)
        .where(inArray(pages.siteId, siteIds))
        .groupBy(pages.siteId)
    : [];

  const enquiryCounts = siteIds.length
    ? await db
        .select({
          siteId: enquiries.siteId,
          unread: sql<number>`count(*) filter (where ${enquiries.handled} = false)::int`,
        })
        .from(enquiries)
        .where(inArray(enquiries.siteId, siteIds))
        .groupBy(enquiries.siteId)
    : [];

  const totalUnread = enquiryCounts.reduce((n, e) => n + e.unread, 0);
  const livePages = pageCounts.reduce((n, p) => n + p.live, 0);
  const publishedSites = mySites.filter((s) => s.published).length;

  const stats = [
    { label: "Sites", value: mySites.length },
    { label: "Published", value: publishedSites },
    { label: "Live pages", value: livePages },
    { label: "New enquiries", value: totalUnread, highlight: totalUnread > 0 },
  ];

  return (
    <main className="min-h-screen flex-1 bg-[#050914] bg-[radial-gradient(circle_at_15%_0%,rgba(96,165,250,0.12),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(168,85,247,0.1),transparent_40%)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
            Your sites
          </h1>
          <p className="mt-2 text-slate-400">
            {mySites.length === 0
              ? "Nothing here yet — pick a template below to make your first one."
              : "Everything you've built, and how it's doing."}
          </p>
        </div>

        {mySites.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5"
              >
                <p
                  className={`text-2xl font-bold tracking-tight ${
                    s.highlight ? "text-blue-300" : "text-slate-100"
                  }`}
                >
                  {s.value}
                </p>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {mySites.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mySites.map((site) => {
              const url = getSiteUrl(site);
              const counts = pageCounts.find((p) => p.siteId === site.id);
              const unread =
                enquiryCounts.find((e) => e.siteId === site.id)?.unread ?? 0;
              const theme = getTheme(site.themeId);

              return (
                <div
                  key={site.id}
                  className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-white/20"
                >
                  {/* The site itself, not a coloured band — so you can tell
                      your sites apart without reading the names. */}
                  <div
                    className="relative h-44 w-full overflow-hidden bg-white"
                    style={{ containerType: "inline-size" }}
                  >
                    {site.published ? (
                      <iframe
                        src={url}
                        title={`${site.name} preview`}
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
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-900 text-center">
                        <span className="text-sm font-medium text-slate-400">
                          Not published yet
                        </span>
                        <span className="text-xs text-slate-600">
                          Publish to see it here
                        </span>
                      </div>
                    )}

                    <div className="absolute left-3 top-3 flex gap-2">
                      {site.published ? (
                        <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-emerald-950">
                          Live
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-400/90 px-2.5 py-1 text-xs font-semibold text-amber-950">
                          Draft
                        </span>
                      )}
                      {unread > 0 ? (
                        <span className="rounded-full bg-blue-500/90 px-2.5 py-1 text-xs font-semibold text-white">
                          {unread} new
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className="flex h-4 w-4 shrink-0 overflow-hidden rounded border border-white/15"
                        >
                          {theme.swatch.map((colour) => (
                            <span
                              key={colour}
                              className="h-full w-1/3"
                              style={{ backgroundColor: colour }}
                            />
                          ))}
                        </span>
                        <p className="truncate font-medium text-slate-100">
                          {site.name}
                        </p>
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block truncate text-sm text-slate-400 underline decoration-slate-700 underline-offset-4 hover:text-slate-200"
                      >
                        {url.replace(/^https?:\/\//, "")}
                      </a>
                      <p className="mt-1.5 text-xs text-slate-500">
                        {counts?.live ?? 0} of {counts?.total ?? 0} pages live
                        {site.customDomain && !site.customDomainVerified
                          ? " · domain unverified"
                          : ""}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/editor/${site.id}`}
                        className="flex-1 rounded-full bg-blue-500 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-blue-400"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/dashboard/${site.id}`}
                        className="flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-center text-sm font-medium text-slate-200 transition hover:bg-white/10"
                      >
                        Settings
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <CreateSiteForm initialTemplateId={preselectedTemplate} />
      </div>
    </main>
  );
}
