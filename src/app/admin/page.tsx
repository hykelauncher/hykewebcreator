import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq, isNotNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  auditLog,
  enquiries,
  pages,
  preservedSites,
  reports,
  sites,
  subscribers,
} from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { getSiteUrl } from "@/lib/tenant";
import { getTheme } from "@/lib/themes";
import { AdminSiteActions } from "./site-actions";
import { OwnerLookup } from "./owner-lookup";
import { EvidenceExport } from "./evidence-export";
import { ReportActions } from "./report-actions";

/**
 * Platform admin.
 *
 * Read-mostly on purpose: it answers "what is on my platform and is any of it
 * a problem", and the only write is taking a site offline — which is
 * reversible. Deleting someone's work from here would be a bigger hammer than
 * moderation needs.
 */
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // 404 rather than a 403: a page that says "forbidden" confirms it exists.
  if (!(await isAdmin())) notFound();

  const db = getDb();

  const allSites = await db
    .select()
    .from(sites)
    .orderBy(desc(sites.createdAt))
    .limit(200);

  const [{ siteCount }] = await db
    .select({ siteCount: sql<number>`count(*)::int` })
    .from(sites);
  const [{ publishedCount }] = await db
    .select({ publishedCount: sql<number>`count(*)::int` })
    .from(sites)
    .where(eq(sites.published, true));
  const [{ ownerCount }] = await db
    .select({ ownerCount: sql<number>`count(distinct ${sites.ownerId})::int` })
    .from(sites);
  const [{ livePages }] = await db
    .select({ livePages: sql<number>`count(*)::int` })
    .from(pages)
    .where(isNotNull(pages.publishedContent));
  const [{ enquiryCount }] = await db
    .select({ enquiryCount: sql<number>`count(*)::int` })
    .from(enquiries);
  const [{ subscriberCount }] = await db
    .select({ subscriberCount: sql<number>`count(*)::int` })
    .from(subscribers);

  // LEFT join, and identity read from the report itself. An inner join would
  // drop every report whose site has been deleted — which is precisely the
  // report you most need to see, and would quietly undo the reason reports
  // outlive their sites at all.
  const openReports = await db
    .select({
      id: reports.id,
      siteId: reports.siteId,
      reason: reports.reason,
      detail: reports.detail,
      createdAt: reports.createdAt,
      status: reports.status,
      subdomain: sql<string>`coalesce(${sites.subdomain}, ${reports.siteSubdomain}, 'unknown')`,
      siteName: sql<string>`coalesce(${sites.name}, ${reports.siteName}, 'Deleted site')`,
      ownerId: sql<string>`coalesce(${sites.ownerId}, ${reports.siteOwnerId}, '')`,
    })
    .from(reports)
    .leftJoin(sites, eq(sites.id, reports.siteId))
    .orderBy(desc(reports.createdAt))
    .limit(25);

  const stillOpen = openReports.filter((r) => r.status === "open");
  const recentlyClosed = openReports.filter((r) => r.status !== "open");

  const preserved = await db
    .select()
    .from(preservedSites)
    .orderBy(desc(preservedSites.deletedAt))
    .limit(20);

  const recentAudit = await db
    .select()
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(20);

  const perSite = await db
    .select({
      siteId: enquiries.siteId,
      total: sql<number>`count(*)::int`,
    })
    .from(enquiries)
    .groupBy(enquiries.siteId);

  const stats = [
    { label: "Sites", value: siteCount },
    { label: "Published", value: publishedCount },
    { label: "Owners", value: ownerCount },
    { label: "Live pages", value: livePages },
    { label: "Enquiries", value: enquiryCount },
    { label: "Subscribers", value: subscriberCount },
    { label: "Open reports", value: stillOpen.length },
  ];

  return (
    <main className="min-h-screen bg-[#050914] bg-[radial-gradient(circle_at_15%_0%,rgba(96,165,250,0.1),transparent_45%)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100">
              Platform admin
            </h1>
            <p className="mt-2 text-slate-400">
              Everything on Hyke. Only people listed in{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-slate-300">
                ADMIN_USER_IDS
              </code>{" "}
              can see this.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            ← My dashboard
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5"
            >
              <p className="text-2xl font-bold tracking-tight text-slate-100">
                {s.value}
              </p>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Reports first: they are the only thing here that might be urgent. */}
        <div className="glass-panel border-gradient p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">
            Open reports
          </h2>
          {stillOpen.length === 0 ? (
            <p className="text-sm text-slate-400">
              Nothing reported. Every published site carries a report link in
              its footer.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {stillOpen.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-amber-400/25 bg-amber-400/5 p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium text-slate-100">
                      {r.siteName}{" "}
                      <span className="text-sm text-slate-400">
                        ({r.subdomain})
                      </span>
                    </p>
                    <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
                      {r.reason}
                    </span>
                  </div>
                  {r.detail ? (
                    <p className="mt-2 whitespace-pre-line text-sm text-slate-300">
                      {r.detail}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(r.createdAt).toLocaleString()} · owner{" "}
                    <code>{r.ownerId.slice(0, 16)}…</code>
                  </p>
                  <div className="mt-2 flex flex-wrap items-start gap-2">
                    <OwnerLookup userId={r.ownerId} />
                    {/* A report outlives its site, so there may be nothing
                        live left to export — what was published is in
                        "Deleted, but preserved" below. */}
                    {r.siteId ? (
                      <EvidenceExport
                        siteId={r.siteId}
                        subdomain={r.subdomain}
                      />
                    ) : (
                      <span className="text-xs text-amber-300">
                        Site deleted — see preserved evidence
                      </span>
                    )}
                    <ReportActions reportId={r.id} status={r.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-panel border-gradient overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-100">All sites</h2>
            <span className="text-sm text-slate-500">
              {allSites.length} shown{siteCount > allSites.length ? ` of ${siteCount}` : ""}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left text-sm">
              <thead className="border-y border-white/10 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Site</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Theme</th>
                  <th className="px-4 py-3 font-medium">Enquiries</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {allSites.map((site) => {
                  const theme = getTheme(site.themeId);
                  const total =
                    perSite.find((p) => p.siteId === site.id)?.total ?? 0;
                  return (
                    <tr
                      key={site.id}
                      className="border-b border-white/5 last:border-b-0"
                    >
                      <td className="px-6 py-3">
                        <p className="font-medium text-slate-100">
                          {site.name}
                        </p>
                        <a
                          href={getSiteUrl(site)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-400 underline decoration-slate-700 underline-offset-4 hover:text-slate-200"
                        >
                          {site.subdomain}
                        </a>
                        {site.customDomain ? (
                          <span
                            className={`ml-2 text-xs ${
                              site.customDomainVerified
                                ? "text-emerald-400"
                                : "text-amber-400"
                            }`}
                          >
                            {site.customDomain}
                            {site.customDomainVerified ? " ✓" : " (unverified)"}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <code className="block text-xs text-slate-500">
                          {site.ownerId.slice(0, 16)}…
                        </code>
                        <div className="mt-1.5">
                          <OwnerLookup userId={site.ownerId} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 text-slate-300">
                          <span
                            aria-hidden
                            className="flex h-4 w-4 overflow-hidden rounded border border-white/15"
                          >
                            {theme.swatch.map((c) => (
                              <span
                                key={c}
                                className="h-full w-1/3"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </span>
                          {theme.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{total}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(site.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 align-top">
                        <AdminSiteActions
                          siteId={site.id}
                          published={site.published}
                        />
                        <div className="mt-2">
                          <EvidenceExport
                            siteId={site.id}
                            subdomain={site.subdomain}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {recentlyClosed.length > 0 ? (
          <div className="glass-panel border-gradient p-6">
            <h2 className="mb-1 text-lg font-semibold text-slate-100">
              Recently closed
            </h2>
            <p className="mb-4 text-sm text-slate-400">
              Nothing is deleted — a closed report stays as evidence, and can be
              reopened.
            </p>
            <ul className="flex flex-col gap-2">
              {recentlyClosed.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm"
                >
                  <span className="min-w-0">
                    <span className="text-slate-300">{r.siteName}</span>{" "}
                    <span className="text-slate-500">
                      ({r.subdomain}) · {r.reason}
                    </span>
                  </span>
                  <ReportActions reportId={r.id} status={r.status} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {preserved.length > 0 ? (
          <div className="glass-panel border-gradient p-6">
            <h2 className="mb-1 text-lg font-semibold text-slate-100">
              Deleted, but preserved
            </h2>
            <p className="mb-4 text-sm text-slate-400">
              These sites were reported and then deleted by their owner. What
              they published was kept.
            </p>
            <ul className="flex flex-col gap-2">
              {preserved.map((p) => (
                <li
                  key={p.id}
                  className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm"
                >
                  <p className="font-medium text-slate-100">
                    {p.name}{" "}
                    <span className="text-slate-400">({p.subdomain})</span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    deleted {new Date(p.deletedAt).toLocaleString()} ·{" "}
                    {p.reportCount} report(s) · owner{" "}
                    <code>{p.ownerId.slice(0, 16)}…</code>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="glass-panel border-gradient p-6">
          <h2 className="mb-1 text-lg font-semibold text-slate-100">
            Recent activity
          </h2>
          <p className="mb-4 text-sm text-slate-400">
            Consequential actions only, kept for 12 months. This is what you
            would hand to a bank or the police.
          </p>
          {recentAudit.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing recorded yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {recentAudit.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm"
                >
                  <code className="text-xs text-blue-300">{a.action}</code>
                  <span className="text-slate-300">{a.detail}</span>
                  <span className="ml-auto text-xs text-slate-500">
                    {a.ip ?? "no ip"} · {new Date(a.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
