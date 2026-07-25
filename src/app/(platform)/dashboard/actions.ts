"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { pages, sites } from "@/db/schema";
import { getTemplate } from "@/lib/templates";

export async function createSite(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const name = String(formData.get("name") || "").trim();
  const subdomain = String(formData.get("subdomain") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  const template = getTemplate(String(formData.get("template") || "blank"));

  if (!name || !subdomain) {
    throw new Error("Site name and subdomain are required.");
  }

  const db = getDb();

  let siteId: string;
  try {
    const [site] = await db
      .insert(sites)
      .values({ ownerId: userId, name, subdomain, template: template.id })
      .returning();
    siteId = site.id;
  } catch {
    throw new Error(`Subdomain "${subdomain}" is already taken.`);
  }

  await db.insert(pages).values({
    siteId,
    slug: "",
    title: "Home",
    isHome: true,
    content: template.data,
  });

  redirect(`/editor/${siteId}`);
}
