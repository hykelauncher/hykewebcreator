import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { sites } from "@/db/schema";
import { getSiteUrl } from "@/lib/tenant";
import { DomainForm } from "./domain-form";

export default async function SiteSettingsPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const { userId } = await auth();
  if (!userId) notFound();

  const db = getDb();
  const site = await db.query.sites.findFirst({
    where: and(eq(sites.id, siteId), eq(sites.ownerId, userId)),
  });
  if (!site) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div>
        <Link href="/dashboard" className="text-sm text-gray-500">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {site.name} — settings
        </h1>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Free address</p>
        <a
          href={getSiteUrl(site)}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-gray-900 underline"
        >
          {getSiteUrl(site)}
        </a>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6">
        <DomainForm siteId={site.id} customDomain={site.customDomain} />
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <p className="font-medium text-gray-800">To connect this domain:</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Save the domain above.</li>
            <li>
              Point its DNS at this platform (a CNAME to{" "}
              <code className="rounded bg-gray-200 px-1">
                cname.vercel-dns.com
              </code>{" "}
              for a subdomain, or an A record for a root domain).
            </li>
            <li>
              Add the domain to the hosting project so traffic reaches it —
              ask whoever manages the platform deployment to run{" "}
              <code className="rounded bg-gray-200 px-1">
                vercel domains add {site.customDomain || "yourdomain.com"}
              </code>
              .
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}
