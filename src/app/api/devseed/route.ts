/**
 * Development-only demo site seeder.
 *
 * Creates a published site per template so every design can be viewed without
 * clicking through the builder each time. Sites are owned by DEMO_OWNER_ID and
 * are never touched by normal app code — delete them from the dashboard or by
 * calling this route with ?reset=1.
 *
 * Demo photography comes from lib/demo-images.ts, shared with the template
 * preview route so the two can never drift apart.
 *
 *   GET /api/devseed              -> seed every template
 *   GET /api/devseed?template=x   -> seed one
 *   GET /api/devseed?reset=1      -> remove all demo sites
 */
import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { pages, sites } from "@/db/schema";
import { TEMPLATES, getTemplate, type Template } from "@/lib/templates";
import { DEFAULT_THEME_ID } from "@/lib/themes";
import { withDemoImages } from "@/lib/demo-images";

export const dynamic = "force-dynamic";

const DEMO_OWNER_ID = "__demo__";

async function seedTemplate(template: Template) {
  const db = getDb();
  const subdomain = `demo-${template.id}`;

  await db.delete(sites).where(eq(sites.subdomain, subdomain));

  const [site] = await db
    .insert(sites)
    .values({
      ownerId: DEMO_OWNER_ID,
      name: `${template.name} (demo)`,
      subdomain,
      template: template.id,
      themeId: template.themeId ?? DEFAULT_THEME_ID,
      published: true,
    })
    .returning();

  const now = new Date();
  const { data: home } = withDemoImages(template.data, subdomain);
  const rows = [
    {
      siteId: site.id,
      slug: "",
      title: "Home",
      isHome: true,
      sortOrder: 0,
      content: home,
      publishedContent: home,
      publishedAt: now,
    },
    ...(template.pages ?? []).map((page, index) => {
      const { data } = withDemoImages(page.data, subdomain);
      return {
        siteId: site.id,
        slug: page.slug,
        title: page.title,
        isHome: false,
        sortOrder: index + 1,
        content: data,
        publishedContent: data,
        publishedAt: now,
      };
    }),
  ];
  await db.insert(pages).values(rows);

  return { subdomain, theme: site.themeId, pages: rows.map((r) => `/${r.slug}`) };
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const db = getDb();

  if (url.searchParams.get("reset")) {
    const removed = await db
      .delete(sites)
      .where(eq(sites.ownerId, DEMO_OWNER_ID))
      .returning({ subdomain: sites.subdomain });
    return NextResponse.json({ removed: removed.map((r) => r.subdomain) });
  }

  const requested = url.searchParams.get("template");
  const targets = requested ? [getTemplate(requested)] : TEMPLATES;

  const seeded = [];
  for (const template of targets) {
    // A blank template has nothing to look at.
    if (template.id === "blank") continue;
    seeded.push(await seedTemplate(template));
  }

  // Report anything left behind from an earlier naming scheme.
  const stale = await db
    .select({ subdomain: sites.subdomain })
    .from(sites)
    .where(inArray(sites.ownerId, ["__devseed__"]));

  return NextResponse.json({ seeded, stale: stale.map((s) => s.subdomain) });
}
