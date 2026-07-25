import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
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

  return (
    <EditorClient
      siteId={siteId}
      pageId={pageId}
      initialData={page.content as object}
      siteUrl={getSiteUrl(site)}
    />
  );
}
