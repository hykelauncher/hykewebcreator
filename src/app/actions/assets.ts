"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { assets, sites } from "@/db/schema";

/**
 * Records an upload against its site.
 *
 * Called from the client once `upload()` resolves rather than from Blob's
 * `onUploadCompleted` webhook, because that webhook can't reach a machine
 * running on localhost — this way asset tracking works in local development
 * and in production alike.
 */
export async function recordAsset(input: {
  siteId: string;
  url: string;
  pathname: string;
  contentType?: string | null;
  size?: number | null;
}): Promise<{ ok: boolean }> {
  const { userId } = await auth();
  if (!userId) return { ok: false };

  if (!input.siteId || !input.url) return { ok: false };

  const db = getDb();
  const site = await db.query.sites.findFirst({
    where: and(eq(sites.id, input.siteId), eq(sites.ownerId, userId)),
  });
  if (!site) return { ok: false };

  await db.insert(assets).values({
    siteId: site.id,
    url: input.url,
    pathname: input.pathname,
    contentType: input.contentType ?? null,
    size: input.size != null ? String(input.size) : null,
  });

  return { ok: true };
}
