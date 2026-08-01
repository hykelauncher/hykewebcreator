"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { pages, sites } from "@/db/schema";
import { getTemplate } from "@/lib/templates";
import { validateSubdomain } from "@/lib/subdomain";
import { DEFAULT_THEME_ID } from "@/lib/themes";
import { recordAudit } from "@/lib/audit";

export async function createSite(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Give your site a name.");
  if (name.length > 120) throw new Error("That site name is too long.");

  const subdomain = validateSubdomain(String(formData.get("subdomain") || ""));
  if (!subdomain.ok) throw new Error(subdomain.error);

  const template = getTemplate(String(formData.get("template") || "blank"));

  const db = getDb();

  let siteId: string;
  try {
    const [site] = await db
      .insert(sites)
      .values({
        ownerId: userId,
        name,
        subdomain: subdomain.value,
        template: template.id,
        themeId: template.themeId ?? DEFAULT_THEME_ID,
      })
      .returning();
    siteId = site.id;
  } catch {
    throw new Error(`Subdomain "${subdomain.value}" is already taken.`);
  }

  // Some templates describe a whole site, not just a landing page. Everything
  // seeded here is an ordinary page the owner can rename, reorder or delete.
  await db.insert(pages).values([
    {
      siteId,
      slug: "",
      title: "Home",
      isHome: true,
      sortOrder: 0,
      content: template.data,
    },
    ...(template.pages ?? []).map((page, index) => ({
      siteId,
      slug: page.slug,
      title: page.title,
      isHome: false,
      sortOrder: index + 1,
      content: page.data,
    })),
  ]);

  await recordAudit({
    userId,
    siteId,
    action: "site.create",
    detail: `${subdomain.value} (${template.id})`,
  });

  revalidatePath("/dashboard");
  redirect(`/editor/${siteId}`);
}
