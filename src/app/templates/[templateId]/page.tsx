import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Render } from "@puckeditor/core/rsc";
import { puckConfig } from "@/lib/puck-config";
import { TEMPLATES } from "@/lib/templates";
import { withDemoImages } from "@/lib/demo-images";
import { getTheme, themeStyle } from "@/lib/themes";

/**
 * Live template preview.
 *
 * Renders straight from the template definitions rather than from a seeded
 * site, so previews work in production without anything in the database and
 * can never drift from what site creation will actually produce.
 *
 * Sits outside the (platform) route group for the same reason /editor does:
 * the preview needs the site's own theme and chrome, not the builder's
 * navigation and background.
 */
export function generateStaticParams() {
  return TEMPLATES.filter((t) => t.id !== "blank").map((t) => ({
    templateId: t.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ templateId: string }>;
}): Promise<Metadata> {
  const { templateId } = await params;
  const template = TEMPLATES.find((t) => t.id === templateId);
  if (!template) return {};
  return {
    title: `${template.name} template — preview`,
    description: template.description,
  };
}

export default async function TemplatePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ templateId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { templateId } = await params;
  const { page: requestedSlug } = await searchParams;

  const template = TEMPLATES.find((t) => t.id === templateId);
  if (!template || template.id === "blank") notFound();

  const theme = getTheme(template.themeId);

  // Home plus any extra pages the template seeds, in the order they'd be created.
  const allPages = [
    { slug: "", title: "Home", data: template.data },
    ...(template.pages ?? []),
  ];
  const current =
    allPages.find((p) => p.slug === (requestedSlug ?? "")) ?? allPages[0];

  const data = withDemoImages(current.data, `preview-${template.id}`);
  const previewBase = `/templates/${template.id}?page=`;

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Builder chrome, deliberately styled to sit apart from the preview so
          it never reads as part of the template being shown. */}
      <header className="sticky top-0 z-[100] border-b border-white/10 bg-[#0b1220] text-slate-100">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-4 px-6 py-3">
          <Link
            href="/dashboard"
            className="text-sm text-slate-400 transition hover:text-slate-200"
          >
            ← Back
          </Link>

          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              className="flex h-6 w-6 shrink-0 overflow-hidden rounded border border-white/15"
            >
              {theme.swatch.map((colour) => (
                <span
                  key={colour}
                  className="h-full w-1/3"
                  style={{ backgroundColor: colour }}
                />
              ))}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{template.name}</p>
              <p className="truncate text-xs text-slate-400">
                {template.description}
              </p>
            </div>
          </div>

          {/* No page switcher here: multi-page templates carry their own Nav
              block, which is part of what's being previewed and already moves
              between pages via navPrefix. A second set of tabs just competes
              with it. */}
          <Link
            href={`/dashboard?template=${template.id}`}
            className="ml-auto rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white shadow-[0_0_24px_rgba(96,165,250,0.35)] transition hover:bg-blue-400"
          >
            Use this template
          </Link>
        </div>
        <p className="border-t border-white/10 bg-black/20 px-6 py-1.5 text-center text-xs text-slate-400">
          Preview only — photos are placeholders and won&apos;t be added to your
          site.
        </p>
      </header>

      <div
        className="flex-1"
        data-theme={template.themeId ?? "studio"}
        style={themeStyle(template.themeId)}
      >
        <Render
          config={puckConfig}
          data={data as never}
          metadata={{
            pages: allPages.map((p) => ({ title: p.title, slug: p.slug })),
            currentSlug: current.slug,
            navPrefix: previewBase,
          }}
        />
      </div>
    </div>
  );
}
