import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { pages, sites } from "@/db/schema";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pageId } = await params;
  const { content } = await request.json();

  const db = getDb();
  const page = await db.query.pages.findFirst({
    where: eq(pages.id, pageId),
  });
  if (!page) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const site = await db.query.sites.findFirst({
    where: and(eq(sites.id, page.siteId), eq(sites.ownerId, userId)),
  });
  if (!site) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db
    .update(pages)
    .set({ content, updatedAt: new Date() })
    .where(eq(pages.id, pageId));

  if (!site.published) {
    await db
      .update(sites)
      .set({ published: true, updatedAt: new Date() })
      .where(eq(sites.id, site.id));
  }

  return NextResponse.json({ ok: true });
}
