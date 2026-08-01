/**
 * Development-only demo site seeder.
 *
 * Creates a published site per template so every design can be viewed without
 * clicking through the builder each time. Sites are owned by DEMO_OWNER_ID and
 * are never touched by normal app code — delete them from the dashboard or by
 * calling this route with ?reset=1.
 *
 * Demo photography is filled in here rather than in the templates themselves:
 * template defaults ship as empty upload slots on purpose, so no site
 * published by a real user carries imagery someone else owns.
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

export const dynamic = "force-dynamic";

const DEMO_OWNER_ID = "__demo__";

/** Stable, seeded photos — the same seed always returns the same image. */
function demoPhoto(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

type Block = { type: string; props: Record<string, unknown> };

/**
 * Walks a template's blocks and fills empty image fields with demo photos.
 * Keyed off the block id so a given slot keeps the same picture between runs.
 */
function withDemoImages(data: Template["data"], prefix: string): Template["data"] {
  const content = (data.content as unknown as Block[]).map((block) => {
    const id = String(block.props.id ?? "");
    const seed = `${prefix}-${id}`;
    const props = { ...block.props };

    switch (block.type) {
      case "Image": {
        const ratio = props.ratio;
        const [w, h] =
          ratio === "portrait"
            ? [900, 1125]
            : ratio === "square"
              ? [1000, 1000]
              : [1600, 900];
        if (!props.src) props.src = demoPhoto(seed, w, h);
        break;
      }
      case "ProfileHero":
        if (!props.photo) props.photo = demoPhoto(seed, 1000, 1000);
        break;
      case "ProjectCard":
        if (!props.image) props.image = demoPhoto(seed, 1200, 800);
        break;
      case "Testimonial":
        if (!props.avatar) props.avatar = demoPhoto(`${seed}-avatar`, 200, 200);
        break;
      case "Gallery": {
        const images = props.images as { src: string; alt: string }[] | undefined;
        if (Array.isArray(images)) {
          props.images = images.map((image, i) =>
            image.src ? image : { ...image, src: demoPhoto(`${seed}-${i}`, 800, 800) },
          );
        }
        break;
      }
      case "Hero":
        if (!props.backgroundImage) {
          props.backgroundImage = demoPhoto(seed, 1600, 900);
        }
        break;
    }

    return { ...block, props };
  });

  return { ...data, content } as Template["data"];
}

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
  const home = withDemoImages(template.data, subdomain);
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
      const data = withDemoImages(page.data, subdomain);
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
