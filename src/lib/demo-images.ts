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
 * Returns a copy of the page data with empty image fields filled, and a count
 * of how many were filled. Keyed off the block id, so a given slot keeps the
 * same picture between renders rather than flickering on every request.
 *
 * The count matters: a template that ships its own photography (the catering
 * one does) needs nothing injected, and telling someone its pictures are
 * placeholders would be wrong — they're part of what they'd get.
 */
export function withDemoImages(
  data: Template["data"],
  prefix: string,
): { data: Template["data"]; injected: number } {
  let injected = 0;
  const fill = (value: unknown, url: string) => {
    if (value) return value;
    injected += 1;
    return url;
  };

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
        props.src = fill(props.src, demoPhoto(seed, w, h));
        break;
      }
      case "ProfileHero":
        props.photo = fill(props.photo, demoPhoto(seed, 1000, 1000));
        break;
      case "ProjectCard":
        props.image = fill(props.image, demoPhoto(seed, 1200, 800));
        break;
      case "Testimonial":
        props.avatar = fill(props.avatar, demoPhoto(`${seed}-avatar`, 200, 200));
        break;
      case "Gallery": {
        const images = props.images as
          | { src: string; alt: string }[]
          | undefined;
        if (Array.isArray(images)) {
          props.images = images.map((image, i) => ({
            ...image,
            src: fill(image.src, demoPhoto(`${seed}-${i}`, 800, 800)) as string,
          }));
        }
        break;
      }
      case "MenuGrid": {
        const items = props.items as { image: string }[] | undefined;
        if (Array.isArray(items)) {
          props.items = items.map((item, i) => ({
            ...item,
            image: fill(item.image, demoPhoto(`${seed}-${i}`, 800, 600)) as string,
          }));
        }
        break;
      }
      case "ProductGrid": {
        const items = props.items as { image: string }[] | undefined;
        if (Array.isArray(items)) {
          props.items = items.map((item, i) => ({
            ...item,
            // Portrait, since product cards are 3:4.
            image: fill(item.image, demoPhoto(`${seed}-${i}`, 800, 1067)) as string,
          }));
        }
        break;
      }
      case "CategoryTiles": {
        const items = props.items as { image: string }[] | undefined;
        if (Array.isArray(items)) {
          props.items = items.map((item, i) => ({
            ...item,
            image: fill(item.image, demoPhoto(`${seed}-${i}`, 800, 1000)) as string,
          }));
        }
        break;
      }
      case "PromoBanner":
        props.image = fill(props.image, demoPhoto(seed, 1600, 900));
        break;
      case "Hero":
        props.backgroundImage = fill(props.backgroundImage, demoPhoto(seed, 1600, 900));
        break;
    }

    return { ...block, props };
  });

  return { data: { ...data, content } as Template["data"], injected };
}
