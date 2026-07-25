"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { sites } from "@/db/schema";

export async function updateCustomDomain(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const siteId = String(formData.get("siteId") || "");
  const rawDomain = String(formData.get("customDomain") || "")
    .trim()
    .toLowerCase();
  const customDomain = rawDomain === "" ? null : rawDomain;

  if (customDomain && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(customDomain)) {
    throw new Error("Enter a valid domain, e.g. www.example.com");
  }

  const db = getDb();
  const site = await db.query.sites.findFirst({
    where: and(eq(sites.id, siteId), eq(sites.ownerId, userId)),
  });
  if (!site) throw new Error("Site not found");

  try {
    await db
      .update(sites)
      .set({ customDomain, updatedAt: new Date() })
      .where(eq(sites.id, siteId));
  } catch {
    throw new Error(`Domain "${customDomain}" is already in use.`);
  }

  revalidatePath(`/dashboard/${siteId}`);
}
