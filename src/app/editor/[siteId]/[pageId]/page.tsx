import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { pages, sites } from "@/db/schema";
import { getSiteUrl } from "@/lib/tenant";
import { EditorClient } from "./editor-client";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ siteId: string; pageId: string }>;
}) {
  const { siteId, pageId } = await params;
  const { userId } = await auth();
  if (!userId) notFound();

  const db = getDb();
  const site = await db.query.sites.findFirst({
    where: and(eq(sites.id, siteId), eq(sites.ownerId, userId)),
  });
  if (!site) notFound();

  const page = await db.query.pages.findFirst({
    where: and(eq(pages.id, pageId), eq(pages.siteId, siteId)),
  });
  if (!page) notFound();

  const sitePages = await db
    .select({ id: pages.id, title: pages.title, slug: pages.slug })
    .from(pages)
    .where(eq(pages.siteId, siteId))
    .orderBy(asc(pages.sortOrder), asc(pages.createdAt));

  const hasPublished = page.publishedContent != null;

  return (
    <EditorClient
      siteId={siteId}
      pageId={pageId}
      initialData={page.content as object}
      siteUrl={getSiteUrl(site)}
      pages={sitePages}
      currentSlug={page.slug}
      themeId={site.themeId}
      hasPublished={hasPublished}
      initiallyUnpublished={
        hasPublished &&
        JSON.stringify(page.content) !== JSON.stringify(page.publishedContent)
      }
    />
  );
}
