import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { and, asc, eq, isNotNull, or } from "drizzle-orm";
import { getDb } from "@/db";
import { pages, sites } from "@/db/schema";
import { getSiteUrl, resolveTenantHost } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (await headers()).get("host") || "";
  const tenant = resolveTenantHost(host);
  if (!tenant) return [];

  const db = getDb();
  const site = await db.query.sites.findFirst({
    where: or(
      eq(sites.subdomain, tenant),
      and(eq(sites.customDomain, tenant), eq(sites.customDomainVerified, true)),
    ),
  });
  if (!site || !site.published) return [];

  // Only pages that are actually live — a draft that has never been published
  // would 404 for anyone following the sitemap.
  const sitePages = await db
    .select({
      slug: pages.slug,
      publishedAt: pages.publishedAt,
      updatedAt: pages.updatedAt,
    })
    .from(pages)
    .where(
      and(eq(pages.siteId, site.id), isNotNull(pages.publishedContent)),
    )
    .orderBy(asc(pages.sortOrder), asc(pages.createdAt));

  const base = getSiteUrl(site);

  return sitePages.map((page) => ({
    url: page.slug ? `${base}/${page.slug}` : base,
    lastModified: page.publishedAt ?? page.updatedAt,
  }));
}
