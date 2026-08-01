import type { Template } from "@/lib/templates";

/**
 * Demo photography for template previews and seeded demo sites.
 *
 * Templates ship with empty image slots on purpose — anything baked into a
 * default gets published on a customer's domain, and this project avoids
 * putting imagery it doesn't own onto sites its users publish. But an empty
 * template previews as a wall of "Click to upload" boxes, which tells a person
 * nothing about whether they'd like the design. So the pictures are filled in
 * at preview time and never written into a real site's content.
 */
function demoPhoto(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

type Block = { type: string; props: Record<string, unknown> };

/**
 * Returns a copy of the page data with empty image fields filled. Keyed off
 * the block id, so a given slot keeps the same picture between renders rather
 * than flickering to a new photo on every request.
 */
export function withDemoImages(
  data: Template["data"],
  prefix: string,
): Template["data"] {
  const content = (data.content as unknown as Block[]).map((block) => {
    const id = String(block.props.id ?? "");
    const seed = `${prefix}-${id}`;
    const props = { ...block.props };

    switch (block.type) {
      case "Image": {
        const ratio = props.ratio;
        const [w, h] =
          ratio === "portrait"
            ? [900, 1125]
            : ratio === "square"
              ? [1000, 1000]
              : [1600, 900];
        if (!props.src) props.src = demoPhoto(seed, w, h);
        break;
      }
      case "ProfileHero":
        if (!props.photo) props.photo = demoPhoto(seed, 1000, 1000);
        break;
      case "ProjectCard":
        if (!props.image) props.image = demoPhoto(seed, 1200, 800);
        break;
      case "Testimonial":
        if (!props.avatar) props.avatar = demoPhoto(`${seed}-avatar`, 200, 200);
        break;
      case "Gallery": {
        const images = props.images as
          | { src: string; alt: string }[]
          | undefined;
        if (Array.isArray(images)) {
          props.images = images.map((image, i) =>
            image.src
              ? image
              : { ...image, src: demoPhoto(`${seed}-${i}`, 800, 800) },
          );
        }
        break;
      }
      case "Hero":
        if (!props.backgroundImage) {
          props.backgroundImage = demoPhoto(seed, 1600, 900);
        }
        break;
    }

    return { ...block, props };
  });

  return { ...data, content } as Template["data"];
}
