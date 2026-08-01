import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { pages, sites } from "@/db/schema";
import { getSiteUrl } from "@/lib/tenant";
import { verificationRecordName } from "@/lib/domain";
import { DomainForm } from "./domain-form";
import { PagesManager } from "./pages-manager";
import { FaviconForm } from "./favicon-form";
import { ThemeForm } from "./theme-form";
import { SiteDangerZone } from "./site-danger-zone";

export default async function SiteSettingsPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const { userId } = await auth();
  if (!userId) notFound();

  const db = getDb();
  const site = await db.query.sites.findFirst({
    where: and(eq(sites.id, siteId), eq(sites.ownerId, userId)),
  });
  if (!site) notFound();

  const sitePages = await db
    .select()
    .from(pages)
    .where(eq(pages.siteId, siteId))
    .orderBy(asc(pages.sortOrder), asc(pages.createdAt));

  return (
    <main className="min-h-screen flex-1 bg-[#020617] bg-[radial-gradient(circle_at_15%_0%,rgba(96,165,250,0.14),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.12),transparent_40%)]">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
        <div>
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-300">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-100">
            {site.name} — settings
          </h1>
        </div>

        <div className="glass-panel border-gradient p-6">
          <p className="text-sm text-slate-400">Free address</p>
          <a
            href={getSiteUrl(site)}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-slate-100 underline decoration-slate-600 hover:text-slate-200"
          >
            {getSiteUrl(site)}
          </a>
        </div>

        <div className="glass-panel border-gradient p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Pages</h2>
          <PagesManager
            siteId={site.id}
            pages={sitePages.map((page) => ({
              id: page.id,
              title: page.title,
              slug: page.slug,
              isHome: page.isHome,
              showInNav: page.showInNav,
              publishedAt: page.publishedAt,
            }))}
          />
        </div>

        <div className="glass-panel border-gradient p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Theme</h2>
          <ThemeForm siteId={site.id} themeId={site.themeId} />
        </div>

        <div className="glass-panel border-gradient p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">
            Branding
          </h2>
          <FaviconForm siteId={site.id} faviconUrl={site.faviconUrl} />
        </div>

        <div className="glass-panel border-gradient flex flex-col gap-4 p-6">
          <DomainForm
            siteId={site.id}
            customDomain={site.customDomain}
            verified={site.customDomainVerified}
            verificationToken={site.domainVerificationToken}
            recordName={
              site.customDomain
                ? verificationRecordName(site.customDomain)
                : null
            }
          />
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <p className="font-medium text-slate-100">To connect this domain:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Save the domain above.</li>
              <li>Add the TXT record shown, then hit Verify.</li>
              <li>
                Point its DNS at this platform (a CNAME to{" "}
                <code className="rounded bg-white/10 px-1 text-slate-200">
                  cname.vercel-dns.com
                </code>{" "}
                for a subdomain, or an A record for a root domain).
              </li>
              <li>
                Add the domain to the hosting project so traffic reaches it —
                ask whoever manages the platform deployment to run{" "}
                <code className="rounded bg-white/10 px-1 text-slate-200">
                  vercel domains add {site.customDomain || "yourdomain.com"}
                </code>
                .
              </li>
            </ol>
          </div>
        </div>

        <div className="glass-panel border-gradient p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">
            Site status
          </h2>
          <SiteDangerZone
            siteId={site.id}
            subdomain={site.subdomain}
            published={site.published}
          />
        </div>
      </div>
    </main>
  );
}
