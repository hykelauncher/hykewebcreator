import Link from "next/link";

/**
 * The 404 for published tenant sites.
 *
 * Deliberately carries no Hyke branding and links nowhere — this renders on a
 * customer's own domain, where the builder that made the site is not something
 * their visitors should be shown.
 */
export default function TenantNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-white px-6 text-center">
      <h1 className="text-5xl font-semibold tracking-tight text-gray-900">
        404
      </h1>
      <p className="text-base text-gray-600">
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="mt-2 text-sm font-medium text-gray-900 underline underline-offset-4"
      >
        Go to the homepage
      </Link>
    </main>
  );
}
