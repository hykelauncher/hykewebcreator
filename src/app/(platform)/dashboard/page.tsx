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
    <main className="min-h-screen flex-1 bg-[#020617] bg-[radial-gradient(circle_at_15%_0%,rgba(96,165,250,0.14),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.12),transparent_40%)]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-100">Your sites</h1>

        <div className="grid gap-4 sm:grid-cols-2">
          {mySites.length === 0 ? (
            <p className="text-slate-400 sm:col-span-2">
              You haven&apos;t created a site yet — start with a template
              below.
            </p>
          ) : (
            mySites.map((site) => {
              const theme = getTemplate(site.template).theme;
              return (
                <div
                  key={site.id}
                  className="glass-panel border-gradient overflow-hidden"
                >
                  <div
                    className="h-20 w-full"
                    style={{ backgroundImage: GRADIENTS[theme] }}
                  />
                  <div className="flex items-center justify-between p-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-100">
                        {site.name}
                      </p>
                      <a
                        href={getSiteUrl(site)}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-sm text-slate-400 underline decoration-slate-600 hover:text-slate-300"
                      >
                        {getSiteUrl(site)}
                      </a>
                      {!site.published ? (
                        <span className="ml-2 text-xs text-amber-400">
                          not published
                        </span>
                      ) : null}
                      {site.customDomain && !site.customDomainVerified ? (
                        <span className="ml-2 text-xs text-amber-400">
                          domain unverified
                        </span>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Link
                        href={`/dashboard/${site.id}`}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                      >
                        Domain
                      </Link>
                      <Link
                        href={`/editor/${site.id}`}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10"
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
      </div>
    </main>
  );
}
