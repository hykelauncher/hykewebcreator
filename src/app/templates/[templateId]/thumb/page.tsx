import { notFound } from "next/navigation";
import { Render } from "@puckeditor/core/rsc";
import { puckConfig } from "@/lib/puck-config";
import { TEMPLATES } from "@/lib/templates";
import { withDemoImages } from "@/lib/demo-images";
import { themeStyle } from "@/lib/themes";

/**
 * A template's home page with no builder chrome, sized for embedding in the
 * picker cards.
 *
 * Separate from the preview route so it can be statically generated: it takes
 * no search params, so every thumbnail is rendered once at build rather than
 * on each dashboard visit. Cards embed it in a scaled iframe, which keeps the
 * thumbnails honest — they are the template, not a screenshot that can go
 * stale when the design changes.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return TEMPLATES.filter((t) => t.id !== "blank").map((t) => ({
    templateId: t.id,
  }));
}

export default async function TemplateThumbPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const template = TEMPLATES.find((t) => t.id === templateId);
  if (!template || template.id === "blank") notFound();

  const { data } = withDemoImages(template.data, `preview-${template.id}`);

  return (
    <div
      data-theme={template.themeId ?? "studio"}
      style={themeStyle(template.themeId)}
    >
      <Render
        config={puckConfig}
        data={data as never}
        metadata={{
          pages: [
            { title: "Home", slug: "" },
            ...(template.pages ?? []).map((p) => ({
              title: p.title,
              slug: p.slug,
            })),
          ],
          currentSlug: "",
          // Nothing in a thumbnail should be clickable.
          navPrefix: "#",
        }}
      />
    </div>
  );
}
