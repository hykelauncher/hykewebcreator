import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { pages, sites } from "@/db/schema";

export default async function EditorSitePage({
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

  const homePage = await db.query.pages.findFirst({
    where: and(eq(pages.siteId, siteId), eq(pages.isHome, true)),
  });
  if (!homePage) notFound();

  redirect(`/editor/${siteId}/${homePage.id}`);
}
