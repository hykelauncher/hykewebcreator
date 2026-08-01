import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { and, asc, eq, isNotNull, or } from "drizzle-orm";
import { Render } from "@puckeditor/core/rsc";
import { getDb } from "@/db";
import { pages, sites } from "@/db/schema";
import { puckConfig } from "@/lib/puck-config";
import { getSiteUrl } from "@/lib/tenant";
import { themeStyle } from "@/lib/themes";
import { SitePlugins } from "@/components/site-plugins";

export const revalidate = 60;

/**
 * Resolves a tenant host to a live page.
 *
 * A custom domain only resolves once it has been verified, so an unverified
 * claim on someone else's domain never serves content. Pages are matched on
 * `publishedContent` — a draft that has never been published is not public.
 */
async function loadSiteAndPage(domain: string, slug?: string[]) {
  const db = getDb();
  const site = await db.query.sites.findFirst({
    where: or(
      eq(sites.subdomain, domain),
      and(eq(sites.customDomain, domain), eq(sites.customDomainVerified, true)),
    ),
  });
  if (!site || !site.published) return null;

  const pageSlug = (slug || []).join("/");
  const page = await db.query.pages.findFirst({
    where: and(eq(pages.siteId, site.id), eq(pages.slug, pageSlug)),
  });
  if (!page || page.publishedContent == null) return null;

  return { site, page, pageSlug };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; slug?: string[] }>;
}): Promise<Metadata> {
  const { domain, slug } = await params;
  const result = await loadSiteAndPage(domain, slug);
  if (!result) return {};

  const { site, page, pageSlug } = result;
  const base = getSiteUrl(site);
  const canonical = pageSlug ? `${base}/${pageSlug}` : base;
  // Served from the tenant host (see the `/api/og` carve-out in proxy.ts) so
  // the URL is one a social crawler can actually fetch.
  const ogImage = `${base}/api/og?slug=${encodeURIComponent(pageSlug)}`;

  return {
    metadataBase: new URL(base),
    title: page.title ? `${page.title} — ${site.name}` : site.name,
    description: page.metaDescription ?? undefined,
    icons: site.faviconUrl ? [{ url: site.faviconUrl }] : undefined,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: site.name,
      title: page.title || site.name,
      description: page.metaDescription ?? undefined,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title || site.name,
      description: page.metaDescription ?? undefined,
      images: [ogImage],
    },
  };
}

export default async function TenantSitePage({
  params,
}: {
  params: Promise<{ domain: string; slug?: string[] }>;
}) {
  const { domain, slug } = await params;

  const result = await loadSiteAndPage(domain, slug);
  if (!result) notFound();
  const { site, page, pageSlug } = result;

  const db = getDb();
  // Only published pages the owner kept in the nav, in their chosen order.
  const sitePages = await db
    .select({ title: pages.title, slug: pages.slug })
    .from(pages)
    .where(
      and(
        eq(pages.siteId, site.id),
        eq(pages.showInNav, true),
        isNotNull(pages.publishedContent),
      ),
    )
    .orderBy(asc(pages.sortOrder), asc(pages.createdAt));

  // `data-theme` both carries the palette and opts the site out of the
  // OS-driven dark mode that only the default theme responds to.
  return (
    <div data-theme={site.themeId} style={themeStyle(site.themeId)}>
      <Render
        config={puckConfig}
        data={page.publishedContent as never}
        metadata={{ pages: sitePages, currentSlug: pageSlug }}
      />
      {/* Site-wide add-ons, outside the page content so they apply everywhere. */}
      <SitePlugins plugins={site.plugins} />
    </div>
  );
}
