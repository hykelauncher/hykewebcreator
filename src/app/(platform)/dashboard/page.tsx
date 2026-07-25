import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { getDb } from "@/db";
import { sites } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSiteUrl } from "@/lib/tenant";
import { GRADIENTS } from "@/lib/gradients";
import { getTemplate } from "@/lib/templates";
import { CreateSiteForm } from "./create-site-form";

export default async function DashboardPage() {
  const { userId } = await auth();
  const db = getDb();
  const mySites = userId
    ? await db.select().from(sites).where(eq(sites.ownerId, userId))
    : [];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Your sites</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {mySites.length === 0 ? (
          <p className="text-gray-500 sm:col-span-2">
            You haven&apos;t created a site yet — start with a template below.
          </p>
        ) : (
          mySites.map((site) => {
            const theme = getTemplate(site.template).theme;
            return (
              <div
                key={site.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div
                  className="h-20 w-full"
                  style={{ backgroundImage: GRADIENTS[theme] }}
                />
                <div className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {site.name}
                    </p>
                    <a
                      href={getSiteUrl(site)}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-sm text-gray-500 underline"
                    >
                      {getSiteUrl(site)}
                    </a>
                    {!site.published ? (
                      <span className="ml-2 text-xs text-amber-600">
                        not published
                      </span>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/dashboard/${site.id}`}
                      className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      Domain
                    </Link>
                    <Link
                      href={`/editor/${site.id}`}
                      className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <CreateSiteForm />
    </main>
  );
}
