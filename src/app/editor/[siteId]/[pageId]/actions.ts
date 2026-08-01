"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { pageVersions, pages, sites } from "@/db/schema";
import { extractPageMeta, parsePuckData } from "@/lib/puck-data";
import { revalidateSite } from "@/lib/publish";
import { recordAudit } from "@/lib/audit";

export type PublishResult = { ok: true; publishedAt: string } | { ok: false; error: string };

/**
 * Promotes the current draft to live.
 *
 * Runs as a Server Function rather than through the API route so the
 * revalidation lands immediately — in a Route Handler, `revalidatePath` only
 * marks the path for the next visit.
 */
export async function publishPage(
  pageId: string,
  content: unknown,
): Promise<PublishResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "You need to sign in again." };

  const parsed = parsePuckData(content);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const db = getDb();
  const page = await db.query.pages.findFirst({ where: eq(pages.id, pageId) });
  if (!page) return { ok: false, error: "This page no longer exists." };

  const site = await db.query.sites.findFirst({
    where: and(eq(sites.id, page.siteId), eq(sites.ownerId, userId)),
  });
  if (!site) return { ok: false, error: "You don't have access to this site." };

  const { title, metaDescription } = extractPageMeta(parsed.data);
  const publishedAt = new Date();

  await db
    .update(pages)
    .set({
      content: parsed.data,
      publishedContent: parsed.data,
      publishedAt,
      title: title ?? page.title,
      metaDescription,
      updatedAt: publishedAt,
    })
    .where(eq(pages.id, pageId));

  // Snapshot what was just published, so this state can be restored later.
  await db.insert(pageVersions).values({
    pageId: page.id,
    content: parsed.data,
    title: title ?? page.title,
  });

  if (!site.published) {
    await db
      .update(sites)
      .set({ published: true, updatedAt: publishedAt })
      .where(eq(sites.id, site.id));
  }

  // The Nav block on every page renders the full page list, so a title change
  // here changes the header everywhere — invalidate the whole site.
  const sitePages = await db
    .select({ slug: pages.slug })
    .from(pages)
    .where(eq(pages.siteId, site.id));

  await recordAudit({
    userId,
    siteId: site.id,
    action: "site.publish",
    detail: `/${page.slug}`,
  });

  revalidateSite(site, sitePages.map((p) => p.slug));
  revalidatePath(`/dashboard/${site.id}`);
  revalidatePath("/dashboard");

  return { ok: true, publishedAt: publishedAt.toISOString() };
}
