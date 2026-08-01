"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { pages, sites } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { revalidateSite } from "@/lib/publish";
import { recordAudit } from "@/lib/audit";

/**
 * Admin actions.
 *
 * Every one re-checks admin status itself. A Server Function is a public
 * endpoint — gating only the page that renders the buttons would leave these
 * callable by anyone who knows they exist.
 */

async function siteSlugs(siteId: string) {
  const db = getDb();
  const rows = await db
    .select({ slug: pages.slug })
    .from(pages)
    .where(eq(pages.siteId, siteId));
  return rows.map((r) => r.slug);
}

/**
 * Takes a site offline. Deliberately not a delete: moderation should be
 * reversible, and destroying someone's work on a report is not.
 */
export async function adminSetPublished(formData: FormData) {
  const adminId = await requireAdmin();

  const siteId = String(formData.get("siteId") || "");
  const published = String(formData.get("published") || "") === "true";

  const db = getDb();
  const site = await db.query.sites.findFirst({
    where: eq(sites.id, siteId),
  });
  if (!site) throw new Error("Site not found");

  await db
    .update(sites)
    .set({ published, updatedAt: new Date() })
    .where(eq(sites.id, site.id));

  // Moderation is the action most worth being able to account for later.
  await recordAudit({
    userId: adminId,
    siteId: site.id,
    action: published ? "admin.restore" : "admin.unpublish",
    detail: `${site.subdomain} (owner ${site.ownerId})`,
  });

  revalidateSite(site, await siteSlugs(site.id));
  revalidatePath("/admin");
}
