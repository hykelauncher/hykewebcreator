import { ImageResponse } from "next/og";
import { and, eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { pages, sites } from "@/db/schema";
import { resolveTenantHost } from "@/lib/tenant";
import { GRADIENTS } from "@/lib/gradients";
import { getTemplate } from "@/lib/templates";

/**
 * Social share images for published tenant pages.
 *
 * This lives at a fixed path rather than using the `opengraph-image` file
 * convention because that convention generates a URL under `/render/...` — the
 * rewrite *destination*, which no visitor (or crawler) can reach. `proxy.ts`
 * exempts `/api/og` from the tenant rewrite so this route sees the real Host,
 * which also means tenant sites can't have a page at that path.
 */
export const dynamic = "force-dynamic";

const SIZE = { width: 1200, height: 630 };

export async function GET(request: Request) {
  const host = request.headers.get("host") || "";
  const tenant = resolveTenantHost(host);
  if (!tenant) return new Response("Not found", { status: 404 });

  const slug = new URL(request.url).searchParams.get("slug") ?? "";

  const db = getDb();
  const site = await db.query.sites.findFirst({
    where: or(
      eq(sites.subdomain, tenant),
      and(eq(sites.customDomain, tenant), eq(sites.customDomainVerified, true)),
    ),
  });
  if (!site || !site.published) {
    return new Response("Not found", { status: 404 });
  }

  const page = await db.query.pages.findFirst({
    where: and(eq(pages.siteId, site.id), eq(pages.slug, slug)),
  });
  if (!page || page.publishedContent == null) {
    return new Response("Not found", { status: 404 });
  }

  const theme = getTemplate(site.template).theme;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          backgroundImage: GRADIENTS[theme],
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: 1,
          }}
        >
          {site.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: page.title.length > 40 ? 72 : 92,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.1,
          }}
        >
          {page.title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          {page.metaDescription
            ? page.metaDescription.slice(0, 110)
            : host}
        </div>
      </div>
    ),
    {
      ...SIZE,
      headers: {
        "cache-control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
