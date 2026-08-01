"use server";

import { clerkClient } from "@clerk/nextjs/server";
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

export type OwnerDetail = {
  email: string | null;
  createdAt: string | null;
  lastActiveAt: string | null;
  sessions: {
    ip: string | null;
    location: string | null;
    browser: string | null;
    status: string;
  }[];
};

export type OwnerLookupResult =
  | { ok: true; owner: OwnerDetail }
  | { ok: false; error: string };

/**
 * Resolves a site owner to a person, on demand.
 *
 * Clerk already holds accounts, sessions, devices and the IPs they were used
 * from, so this reads from there rather than duplicating any of it into our
 * database. Nothing returned here is stored — it is fetched when an admin asks
 * and forgotten after, which keeps the data where it already is and out of our
 * retention obligations.
 *
 * Called per row rather than for the whole table: user lookups count against
 * Clerk's rate limit (100 requests per 10s in development).
 */
export async function lookupOwner(userId: string): Promise<OwnerLookupResult> {
  await requireAdmin();

  // Seeded demo sites carry a placeholder owner that is not a real account.
  if (!userId.startsWith("user_")) {
    return { ok: false, error: "Not a real account (seeded demo site)." };
  }

  try {
    const clerk = await clerkClient();
    const [user, sessions] = await Promise.all([
      clerk.users.getUser(userId),
      clerk.sessions.getSessionList({ userId, limit: 5 }),
    ]);

    const format = (ms: number | null | undefined) =>
      ms ? new Date(ms).toLocaleDateString() : null;

    return {
      ok: true,
      owner: {
        email:
          user.primaryEmailAddress?.emailAddress ??
          user.emailAddresses[0]?.emailAddress ??
          null,
        createdAt: format(user.createdAt),
        lastActiveAt: format(user.lastActiveAt),
        sessions: sessions.data.map((s) => {
          const a = s.latestActivity;
          const place = [a?.city, a?.country].filter(Boolean).join(", ");
          const browser = [a?.browserName, a?.deviceType]
            .filter(Boolean)
            .join(" · ");
          return {
            ip: a?.ipAddress ?? null,
            location: place || null,
            browser: browser || null,
            status: s.status,
          };
        }),
      },
    };
  } catch {
    // Usually a deleted account or a rate limit; neither is worth a stack
    // trace in an admin panel.
    return {
      ok: false,
      error: "Couldn't reach Clerk for that account.",
    };
  }
}

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
