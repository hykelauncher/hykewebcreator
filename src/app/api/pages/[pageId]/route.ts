import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { pages, sites } from "@/db/schema";
import { extractPageMeta, parsePuckData } from "@/lib/puck-data";

/**
 * Draft autosave. This only ever writes `pages.content` — the draft column —
 * so nothing a visitor sees changes until the owner hits Publish (see
 * `publishPage` in the editor's actions).
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pageId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parsePuckData((body as { content?: unknown })?.content);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

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

  const { title, metaDescription } = extractPageMeta(parsed.data);

  await db
    .update(pages)
    .set({
      content: parsed.data,
      title: title ?? page.title,
      metaDescription,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, pageId));

  return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
}
