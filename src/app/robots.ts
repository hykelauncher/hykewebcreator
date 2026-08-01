import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { and, eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { sites } from "@/db/schema";
import { getSiteUrl, resolveTenantHost } from "@/lib/tenant";

// Reads the Host header, so it has to run per request rather than be baked in
// at build time — one deployment answers for every tenant.
export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host") || "";
  const tenant = resolveTenantHost(host);

  // The builder app itself: keep the dashboard, editor and auth pages out of
  // search results, allow the marketing page.
  if (!tenant) {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/editor",
          "/admin",
          "/sign-in",
          "/sign-up",
          "/api",
        ],
      },
    };
  }

  const db = getDb();
  const site = await db.query.sites.findFirst({
    where: or(
      eq(sites.subdomain, tenant),
      and(eq(sites.customDomain, tenant), eq(sites.customDomainVerified, true)),
    ),
  });

  // Unknown or unpublished host — don't invite crawlers to index a 404.
  if (!site || !site.published) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${getSiteUrl(site)}/sitemap.xml`,
  };
}
