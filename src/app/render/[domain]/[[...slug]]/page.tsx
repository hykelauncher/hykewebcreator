import { notFound } from "next/navigation";
import { and, eq, or } from "drizzle-orm";
import { Render } from "@puckeditor/core/rsc";
import { getDb } from "@/db";
import { pages, sites } from "@/db/schema";
import { puckConfig } from "@/lib/puck-config";

export const revalidate = 60;

export default async function TenantSitePage({
  params,
}: {
  params: Promise<{ domain: string; slug?: string[] }>;
}) {
  const { domain, slug } = await params;

  const db = getDb();
  const site = await db.query.sites.findFirst({
    where: or(eq(sites.subdomain, domain), eq(sites.customDomain, domain)),
  });
  if (!site || !site.published) notFound();

  const pageSlug = (slug || []).join("/");
  const page = await db.query.pages.findFirst({
    where: and(eq(pages.siteId, site.id), eq(pages.slug, pageSlug)),
  });
  if (!page) notFound();

  return <Render config={puckConfig} data={page.content as never} />;
}
