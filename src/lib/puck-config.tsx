import type { Config, Slot } from "@puckeditor/core";
import { ImageUploadField } from "@/components/image-upload-field";
import { EnquiryForm, type EnquiryField } from "@/components/enquiry-form";
import {
  GRADIENT_OPTIONS,
  GRADIENTS,
  heroBackground,
  type GradientTheme,
} from "@/lib/gradients";

function embedSrc(url: string): string {
  if (!url) return "";
  const youtubeWatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
  );
  if (youtubeWatch) return `https://www.youtube.com/embed/${youtubeWatch[1]}`;
  return url;
}

/* ---------------------------------------------------------------------------
   Shared layout primitives.

   Every block renders inside the same container and vertical rhythm, which is
   what makes a page built from mixed blocks read as one designed thing rather
   than a stack of unrelated sections. Colours, radii and shadows come from the
   tokens in globals.css so the whole system restyles from one place.
--------------------------------------------------------------------------- */

/** Centred content column shared by every block. */
const SECTION = "mx-auto w-full max-w-5xl px-6";

/** Standard vertical rhythm between sections. */
const SECTION_Y = "py-8 sm:py-12";

/** Elevated surface used by cards and panels. */
const CARD =
  "rounded-card border border-line bg-surface shadow-raised";

/** Motion shared by anything interactive. Reduced-motion is handled globally. */
const LIFT =
  "transition duration-300 ease-out hover:-translate-y-1 hover:shadow-lifted";

const EYEBROW =
  "text-eyebrow font-semibold uppercase tracking-[0.18em] text-muted";

/**
 * Resolves a call-to-action link.
 *
 * A button set to use WhatsApp points at whatever number the site's WhatsApp
 * plugin holds, so the template never carries a phone number and one setting
 * updates every button. If the plugin is off, the button quietly falls back to
 * its normal link rather than breaking.
 */
function ctaHref(
  useWhatsApp: string | undefined,
  href: string,
  puck: { metadata?: Record<string, unknown> } | undefined,
): { href: string; external: boolean } {
  const whatsappUrl = puck?.metadata?.whatsappUrl as string | undefined;
  if (useWhatsApp === "yes" && whatsappUrl) {
    return { href: whatsappUrl, external: true };
  }
  return { href, external: false };
}

const WHATSAPP_FIELD = {
  type: "radio" as const,
  label: "Send to WhatsApp instead",
  options: [
    { label: "No", value: "no" },
    { label: "Yes", value: "yes" },
  ],
};

/**
 * Empty upload slot. Deliberately neutral rather than a coloured gradient —
 * a fixed bright placeholder fights any theme that isn't cool-toned, and it
 * reads as content rather than as an empty slot waiting for a file.
 */
const PLACEHOLDER =
  "flex items-center justify-center rounded-card border border-dashed border-line-strong bg-surface-subtle text-sm font-medium text-muted";

/** Soft dot grid drawn from the current text colour, so it works on any background. */
const DOT_GRID: React.CSSProperties = {
  backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

type Components = {
  Heading: { text: string; level: "h1" | "h2" | "h3"; align: "left" | "center" };
  Text: { text: string; align: "left" | "center" };
  Button: {
    label: string;
    href: string;
    variant: "solid" | "outline";
    useWhatsApp: "yes" | "no";
  };
  Image: {
    src: string;
    alt: string;
    ratio: "original" | "wide" | "square" | "portrait";
    caption: string;
  };
  Hero: {
    heading: string;
    subheading: string;
    theme: GradientTheme;
    backgroundImage: string;
    buttonLabel: string;
    buttonHref: string;
    // Optional extras. Content saved before these existed has no value, so
    // every one of them renders nothing when empty.
    badge: string;
    secondaryLabel: string;
    secondaryHref: string;
    bullets: string;
  };
  MenuGrid: {
    items: {
      name: string;
      description: string;
      price: string;
      image: string;
      badge: string;
    }[];
  };
  EnquiryForm: {
    heading: string;
    description: string;
    askName: "yes" | "no";
    askEmail: "yes" | "no";
    askPhone: "yes" | "no";
    askSubject: "yes" | "no";
    buttonLabel: string;
    successMessage: string;
  };
  Band: {
    tone: "band" | "accent" | "inverse";
    eyebrow: string;
    heading: string;
    text: string;
    buttonLabel: string;
    buttonHref: string;
    useWhatsApp: "yes" | "no";
    note: string;
  };
  Spacer: { height: "sm" | "md" | "lg" };
  Nav: Record<string, never>;
  Columns: {
    columnCount: "2" | "3";
    left: Slot;
    middle: Slot;
    right: Slot;
  };
  Gallery: { images: { src: string; alt: string }[] };
  Testimonial: {
    quote: string;
    authorName: string;
    authorRole: string;
    avatar: string;
  };
  FAQAccordion: { items: { question: string; answer: string }[] };
  PricingTable: {
    plans: {
      name: string;
      price: string;
      period: string;
      features: string;
      buttonLabel: string;
      buttonHref: string;
      highlighted: "yes" | "no";
    }[];
  };
  Embed: { url: string; caption: string };
  ProfileHero: {
    eyebrow: string;
    heading: string;
    intro: string;
    photo: string;
    theme: GradientTheme;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
  Stats: {
    items: { value: string; label: string }[];
  };
  ProjectCard: {
    title: string;
    category: string;
    summary: string;
    image: string;
    theme: GradientTheme;
    tags: string;
    liveLabel: string;
    liveHref: string;
    sourceLabel: string;
    sourceHref: string;
    layout: "featured" | "compact";
  };
  ArticleList: {
    items: { title: string; summary: string; date: string; href: string }[];
  };
};

const ALIGN_FIELD = {
  type: "radio" as const,
  options: [
    { label: "Left", value: "left" },
    { label: "Centre", value: "center" },
  ],
};

export const puckConfig: Config<{ components: Components }> = {
  root: {
    fields: {
      title: { type: "text" },
      metaDescription: {
        type: "textarea",
        label: "Meta description (for search & sharing)",
      },
    },
    defaultProps: {
      title: "",
      metaDescription: "",
    },
  },
  components: {
    Heading: {
      fields: {
        text: { type: "text" },
        level: {
          type: "select",
          options: [
            { label: "Large (H1)", value: "h1" },
            { label: "Medium (H2)", value: "h2" },
            { label: "Small (H3)", value: "h3" },
          ],
        },
        align: ALIGN_FIELD,
      },
      defaultProps: { text: "Heading", level: "h2", align: "left" },
      render: ({ text, level, align }) => {
        const Tag = level;
        // A real scale: every level used to render at the same size, so the
        // selector changed the HTML tag and nothing visual.
        const size = {
          h1: "text-h1 leading-[1.05] tracking-[-0.03em] font-bold",
          h2: "text-h2 leading-[1.15] tracking-[-0.02em] font-semibold",
          h3: "text-h3 leading-[1.25] tracking-[-0.01em] font-semibold",
        }[level];
        return (
          <div className={`${SECTION} pt-10 pb-3`}>
            <Tag
              className={`font-display text-balance ${size} ${
                align === "center" ? "mx-auto text-center" : ""
              }`}
            >
              {text}
            </Tag>
          </div>
        );
      },
    },
    Text: {
      fields: { text: { type: "textarea" }, align: ALIGN_FIELD },
      defaultProps: { text: "Write something here.", align: "left" },
      render: ({ text, align }) => (
        <div className={`${SECTION} py-2`}>
          <p
            className={`max-w-[65ch] whitespace-pre-line text-lead leading-[1.7] text-muted ${
              align === "center" ? "mx-auto text-center" : ""
            }`}
          >
            {text}
          </p>
        </div>
      ),
    },
    Button: {
      fields: {
        label: { type: "text" },
        href: { type: "text" },
        variant: {
          type: "radio",
          options: [
            { label: "Solid", value: "solid" },
            { label: "Outline", value: "outline" },
          ],
        },
        useWhatsApp: WHATSAPP_FIELD,
      },
      defaultProps: {
        label: "Click me",
        href: "#",
        variant: "solid",
        useWhatsApp: "no",
      },
      render: ({ label, href, variant, useWhatsApp, puck }) => {
        const link = ctaHref(useWhatsApp, href, puck);
        return (
        <div className={`${SECTION} py-3`}>
          {/* Theme-aware rather than hardcoded black-on-white: a black pill is
              nearly invisible on a site rendering in dark mode. */}
          <a
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noreferrer noopener" : undefined}
            // Content saved before this field existed has no `variant`, so
            // solid must be the fallback rather than the explicit match.
            className={
              variant === "outline"
                ? "inline-flex items-center rounded-pill border border-line-strong px-7 py-3.5 font-medium transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-subtle"
                : "inline-flex items-center rounded-pill bg-foreground px-7 py-3.5 font-medium text-background shadow-soft transition duration-200 ease-out hover:-translate-y-0.5 hover:opacity-90"
            }
          >
            {label}
          </a>
        </div>
        );
      },
    },
    Image: {
      fields: {
        src: { type: "custom", render: ImageUploadField },
        alt: { type: "text" },
        ratio: {
          type: "select",
          label: "Shape",
          options: [
            { label: "Wide (16:9)", value: "wide" },
            { label: "Square", value: "square" },
            { label: "Portrait (4:5)", value: "portrait" },
            { label: "Original proportions", value: "original" },
          ],
        },
        caption: { type: "text" },
      },
      defaultProps: { src: "", alt: "", ratio: "wide", caption: "" },
      render: ({ src, alt, ratio, caption }) => {
        // Without a shape, a tall photo expanded to the full width of the page
        // and pushed everything else off screen.
        const shape =
          {
            wide: "aspect-video",
            square: "aspect-square",
            portrait: "aspect-[4/5]",
            original: "",
          }[ratio ?? "wide"] ?? "aspect-video";

        return (
          <figure className={`${SECTION} py-4`}>
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={alt}
                className={`w-full rounded-card object-cover shadow-raised ${shape}`}
              />
            ) : (
              <div className={`aspect-video ${PLACEHOLDER}`}>
                Click to upload an image
              </div>
            )}
            {caption ? (
              <figcaption className="mt-3 text-sm text-muted">
                {caption}
              </figcaption>
            ) : null}
          </figure>
        );
      },
    },
    Hero: {
      fields: {
        heading: { type: "text" },
        subheading: { type: "textarea" },
        theme: { type: "select", options: GRADIENT_OPTIONS },
        backgroundImage: { type: "custom", render: ImageUploadField },
        badge: { type: "text", label: "Badge (optional)" },
        buttonLabel: { type: "text" },
        buttonHref: { type: "text" },
        secondaryLabel: { type: "text", label: "Second button (optional)" },
        secondaryHref: { type: "text" },
        bullets: {
          type: "text",
          label: "Points below the buttons (comma separated)",
        },
      },
      defaultProps: {
        heading: "Your headline goes here",
        subheading: "A short supporting line about your site.",
        theme: "midnight",
        backgroundImage: "",
        badge: "",
        buttonLabel: "Get started",
        buttonHref: "#",
        secondaryLabel: "",
        secondaryHref: "",
        bullets: "",
      },
      render: ({
        heading,
        subheading,
        theme,
        backgroundImage,
        badge,
        buttonLabel,
        buttonHref,
        secondaryLabel,
        secondaryHref,
        bullets,
      }) => (
        <section
          className="relative isolate overflow-hidden bg-cover bg-center px-6 py-28 text-white sm:py-36"
          style={heroBackground(theme, backgroundImage)}
        >
          {/* Keeps text legible over a busy uploaded photo. */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-transparent to-black/35" />
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            {badge ? (
              <span className="rounded-pill bg-accent px-4 py-1.5 text-eyebrow font-bold uppercase tracking-[0.12em] text-neutral-900">
                {badge}
              </span>
            ) : null}
            <h1 className="font-display text-h1 font-bold leading-[1.05] tracking-[-0.03em] text-balance drop-shadow-sm">
              {heading}
            </h1>
            <p className="max-w-xl text-lead leading-[1.6] text-white/85">
              {subheading}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              {buttonLabel ? (
                <a
                  href={buttonHref}
                  className="inline-flex items-center rounded-pill bg-white px-8 py-4 font-medium text-neutral-900 shadow-lifted transition duration-200 ease-out hover:-translate-y-0.5"
                >
                  {buttonLabel}
                </a>
              ) : null}
              {secondaryLabel ? (
                <a
                  href={secondaryHref}
                  className="inline-flex items-center rounded-pill border-2 border-white/60 px-8 py-4 font-medium text-white transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/10"
                >
                  {secondaryLabel}
                </a>
              ) : null}
            </div>
            {bullets ? (
              <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
                {bullets
                  .split(",")
                  .map((b) => b.trim())
                  .filter(Boolean)
                  .map((b, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm font-bold text-white/90"
                    >
                      <span aria-hidden className="text-accent">
                        ●
                      </span>
                      {b}
                    </li>
                  ))}
              </ul>
            ) : null}
          </div>
        </section>
      ),
    },
    MenuGrid: {
      fields: {
        items: {
          type: "array",
          arrayFields: {
            name: { type: "text" },
            description: { type: "textarea" },
            price: { type: "text" },
            image: { type: "custom", render: ImageUploadField },
            badge: { type: "text", label: "Badge (optional)" },
          },
          defaultItemProps: {
            name: "Dish name",
            description: "A short line describing the dish.",
            price: "From £45",
            image: "",
            badge: "",
          },
          getItemSummary: (item) => item.name || "Item",
        },
      },
      defaultProps: {
        items: [
          {
            name: "Dish name",
            description: "A short line describing the dish.",
            price: "From £45",
            image: "",
            badge: "Popular",
          },
          {
            name: "Dish name",
            description: "A short line describing the dish.",
            price: "From £40",
            image: "",
            badge: "",
          },
          {
            name: "Dish name",
            description: "A short line describing the dish.",
            price: "From £50",
            image: "",
            badge: "",
          },
        ],
      },
      render: ({ items }) => (
        <div className={`${SECTION} ${SECTION_Y}`}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <article
                key={i}
                className={`group flex flex-col overflow-hidden ${CARD} ${LIFT}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className={`h-full w-full rounded-none ${PLACEHOLDER}`}>
                      Upload a photo
                    </div>
                  )}
                  {item.badge ? (
                    <span className="absolute left-3 top-3 rounded-pill bg-accent px-3 py-1 text-eyebrow font-bold uppercase tracking-wider text-neutral-900 shadow-soft">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-5">
                  <h3 className="font-display text-lead font-bold leading-snug">
                    {item.name}
                  </h3>
                  <p className="flex-1 text-sm leading-[1.6] text-muted">
                    {item.description}
                  </p>
                  {item.price ? (
                    <p className="mt-2 font-display text-lead font-bold text-accent">
                      {item.price}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      ),
    },
    EnquiryForm: {
      fields: {
        heading: { type: "text" },
        description: { type: "textarea" },
        askName: {
          type: "radio",
          label: "Ask for a name",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        askEmail: {
          type: "radio",
          label: "Ask for an email",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        askPhone: {
          type: "radio",
          label: "Ask for a phone number",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        askSubject: {
          type: "radio",
          label: "Ask for a subject",
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
        buttonLabel: { type: "text" },
        successMessage: { type: "text" },
      },
      defaultProps: {
        heading: "Send us a message",
        description:
          "Tell us what you need and we'll come back to you.",
        askName: "yes",
        askEmail: "yes",
        askPhone: "no",
        askSubject: "no",
        buttonLabel: "Send enquiry",
        successMessage: "Thanks — we've got your message and will be in touch.",
      },
      render: ({
        heading,
        description,
        askName,
        askEmail,
        askPhone,
        askSubject,
        buttonLabel,
        successMessage,
        puck,
      }) => {
        // Anything saved before a field existed reads as undefined, so each
        // one opts out only on an explicit "no".
        const fields: EnquiryField[] = [
          ...(askName !== "no" ? (["name"] as const) : []),
          ...(askEmail !== "no" ? (["email"] as const) : []),
          ...(askPhone === "yes" ? (["phone"] as const) : []),
          ...(askSubject === "yes" ? (["subject"] as const) : []),
        ];
        const pageSlug = (puck?.metadata?.currentSlug as string) ?? "";

        return (
          <div className={`${SECTION} ${SECTION_Y}`}>
            <div className={`${CARD} max-w-2xl p-7 sm:p-9`}>
              {heading ? (
                <h2 className="font-display text-h3 font-bold tracking-[-0.01em]">
                  {heading}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-2 mb-6 leading-[1.7] text-muted">
                  {description}
                </p>
              ) : null}
              <EnquiryForm
                fields={fields}
                buttonLabel={buttonLabel}
                successMessage={successMessage}
                pageSlug={pageSlug}
              />
            </div>
          </div>
        );
      },
    },
    Band: {
      fields: {
        tone: {
          type: "radio",
          options: [
            { label: "Brand", value: "band" },
            { label: "Accent", value: "accent" },
            { label: "Inverse", value: "inverse" },
          ],
        },
        eyebrow: { type: "text" },
        heading: { type: "text" },
        text: { type: "textarea" },
        buttonLabel: { type: "text" },
        buttonHref: { type: "text" },
        useWhatsApp: WHATSAPP_FIELD,
        note: { type: "text", label: "Line under the button (optional)" },
      },
      defaultProps: {
        tone: "band",
        eyebrow: "",
        heading: "A full-width message worth stopping for",
        text: "One or two lines that earn the click.",
        buttonLabel: "Get in touch",
        buttonHref: "#contact",
        useWhatsApp: "no",
        note: "",
      },
      render: ({
        tone,
        eyebrow,
        heading,
        text,
        buttonLabel,
        buttonHref,
        useWhatsApp,
        note,
        puck,
      }) => {
        const link = ctaHref(useWhatsApp, buttonHref, puck);
        // `band` uses the theme's own band colour where it defines one and
        // falls back to the accent, so this works in every theme.
        const background =
          tone === "accent"
            ? "var(--site-accent)"
            : tone === "inverse"
              ? "var(--site-foreground)"
              : "var(--site-band, var(--site-accent))";
        const colour =
          tone === "inverse" ? "var(--site-background)" : "var(--site-band-on, #fffaf2)";

        return (
          <section style={{ background, color: colour }}>
            <div
              className={`${SECTION} flex flex-wrap items-center justify-between gap-8 py-12 sm:py-16`}
            >
              <div className="max-w-xl">
                {eyebrow ? (
                  <p className="text-eyebrow font-bold uppercase tracking-[0.14em] opacity-80">
                    {eyebrow}
                  </p>
                ) : null}
                <h2 className="mt-2 font-display text-h2 font-bold leading-[1.15] tracking-[-0.02em] text-balance">
                  {heading}
                </h2>
                {text ? (
                  <p className="mt-3 text-lead leading-[1.6] opacity-90">{text}</p>
                ) : null}
              </div>
              <div className="flex min-w-[220px] flex-col items-start gap-3">
                {buttonLabel ? (
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer noopener" : undefined}
                    className="inline-flex items-center rounded-pill bg-accent px-7 py-3.5 font-bold text-neutral-900 shadow-soft transition duration-200 ease-out hover:-translate-y-0.5"
                  >
                    {buttonLabel}
                  </a>
                ) : null}
                {note ? (
                  <p className="text-lead font-bold opacity-95">{note}</p>
                ) : null}
              </div>
            </div>
          </section>
        );
      },
    },
    Spacer: {
      fields: {
        height: {
          type: "select",
          options: [
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
      },
      defaultProps: { height: "md" },
      render: ({ height }) => (
        <div
          className={
            height === "sm" ? "h-8" : height === "lg" ? "h-28" : "h-16"
          }
        />
      ),
    },
    Nav: {
      fields: {},
      defaultProps: {},
      render: ({ puck }) => {
        const pages =
          (puck?.metadata?.pages as
            | { title: string; slug: string }[]
            | undefined) ?? [];
        const currentSlug = puck?.metadata?.currentSlug as string | undefined;
        // Template previews live under /templates/<id>, so they pass a prefix
        // to keep nav links inside the preview instead of jumping to a path
        // that only exists on a published site.
        const navPrefix = puck?.metadata?.navPrefix as string | undefined;
        return (
          <nav className="sticky top-0 z-50 border-b border-line bg-background/80 backdrop-blur-md">
            <div className={`${SECTION} flex flex-wrap items-center gap-1 py-3.5`}>
              {pages.map((page) => {
                const active = page.slug === currentSlug;
                return (
                  <a
                    key={page.slug}
                    href={
                      navPrefix
                        ? `${navPrefix}${page.slug}`
                        : page.slug
                          ? `/${page.slug}`
                          : "/"
                    }
                    aria-current={active ? "page" : undefined}
                    className={`rounded-pill px-3.5 py-2 text-sm font-medium transition duration-200 ${
                      active
                        ? "bg-surface-subtle text-foreground"
                        : "text-muted hover:bg-surface-subtle hover:text-foreground"
                    }`}
                  >
                    {page.title || "Home"}
                  </a>
                );
              })}
            </div>
          </nav>
        );
      },
    },
    Columns: {
      fields: {
        columnCount: {
          type: "radio",
          options: [
            { label: "2 columns", value: "2" },
            { label: "3 columns", value: "3" },
          ],
        },
        left: { type: "slot" },
        middle: { type: "slot" },
        right: { type: "slot" },
      },
      defaultProps: {
        columnCount: "2",
        left: [],
        middle: [],
        right: [],
      },
      render: ({ columnCount, left: Left, middle: Middle, right: Right }) => (
        <div className={`${SECTION} ${SECTION_Y}`}>
          <div
            className={`grid gap-8 ${
              columnCount === "3" ? "sm:grid-cols-3" : "sm:grid-cols-2"
            }`}
          >
            <Left />
            <Middle />
            {columnCount === "3" ? <Right /> : null}
          </div>
        </div>
      ),
    },
    Gallery: {
      fields: {
        images: {
          type: "array",
          arrayFields: {
            src: { type: "custom", render: ImageUploadField },
            alt: { type: "text" },
          },
          defaultItemProps: { src: "", alt: "" },
          getItemSummary: (item, i) => item.alt || `Image ${(i ?? 0) + 1}`,
        },
      },
      defaultProps: {
        images: [
          { src: "", alt: "" },
          { src: "", alt: "" },
          { src: "", alt: "" },
        ],
      },
      render: ({ images }) => (
        <div className={`${SECTION} ${SECTION_Y}`}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {images.map((image, i) =>
              image.src ? (
                <div
                  key={i}
                  className="group overflow-hidden rounded-card shadow-soft"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="aspect-square w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                  />
                </div>
              ) : (
                <div key={i} className={`aspect-square ${PLACEHOLDER}`}>
                  Upload image
                </div>
              ),
            )}
          </div>
        </div>
      ),
    },
    Testimonial: {
      fields: {
        quote: { type: "textarea" },
        authorName: { type: "text" },
        authorRole: { type: "text" },
        avatar: { type: "custom", render: ImageUploadField },
      },
      defaultProps: {
        quote: "This product changed how we work — highly recommended.",
        authorName: "Jane Doe",
        authorRole: "Founder, Acme Co",
        avatar: "",
      },
      render: ({ quote, authorName, authorRole, avatar }) => (
        <div className={`${SECTION} ${SECTION_Y}`}>
          <figure className={`${CARD} p-8 sm:p-10`}>
            <blockquote className="font-display text-h3 leading-[1.4] tracking-[-0.01em] text-balance">
              &ldquo;{quote}&rdquo;
            </blockquote>
            <figcaption className="mt-7 flex items-center gap-3.5">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt={authorName}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div
                  className="h-11 w-11 rounded-full"
                  style={{ backgroundImage: GRADIENTS.grape }}
                />
              )}
              <div>
                <p className="font-medium">{authorName}</p>
                <p className="text-sm text-muted">{authorRole}</p>
              </div>
            </figcaption>
          </figure>
        </div>
      ),
    },
    FAQAccordion: {
      fields: {
        items: {
          type: "array",
          arrayFields: {
            question: { type: "text" },
            answer: { type: "textarea" },
          },
          defaultItemProps: {
            question: "Question?",
            answer: "Answer goes here.",
          },
          getItemSummary: (item) => item.question || "Question",
        },
      },
      defaultProps: {
        items: [
          { question: "What is this?", answer: "Answer goes here." },
          { question: "How does it work?", answer: "Answer goes here." },
        ],
      },
      render: ({ items }) => (
        <div className={`${SECTION} ${SECTION_Y}`}>
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {items.map((item, i) => (
              <details
                key={i}
                className="group rounded-card border border-line bg-surface px-6 py-5 shadow-soft transition duration-200 open:shadow-raised"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span className="shrink-0 text-muted transition duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 leading-[1.7] text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      ),
    },
    PricingTable: {
      fields: {
        plans: {
          type: "array",
          arrayFields: {
            name: { type: "text" },
            price: { type: "text" },
            period: { type: "text" },
            features: { type: "textarea" },
            buttonLabel: { type: "text" },
            buttonHref: { type: "text" },
            highlighted: {
              type: "radio",
              options: [
                { label: "Normal", value: "no" },
                { label: "Highlighted", value: "yes" },
              ],
            },
          },
          defaultItemProps: {
            name: "Plan",
            price: "$19",
            period: "/mo",
            features: "Feature one\nFeature two\nFeature three",
            buttonLabel: "Choose plan",
            buttonHref: "#",
            highlighted: "no",
          },
          getItemSummary: (item) => item.name || "Plan",
        },
      },
      defaultProps: {
        plans: [
          {
            name: "Starter",
            price: "$9",
            period: "/mo",
            features: "1 site\nBasic support",
            buttonLabel: "Choose plan",
            buttonHref: "#",
            highlighted: "no",
          },
          {
            name: "Pro",
            price: "$29",
            period: "/mo",
            features: "Unlimited sites\nPriority support\nCustom domain",
            buttonLabel: "Choose plan",
            buttonHref: "#",
            highlighted: "yes",
          },
        ],
      },
      render: ({ plans }) => (
        <div className={`${SECTION} ${SECTION_Y}`}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, i) => {
              const featured = plan.highlighted === "yes";
              return (
                <div
                  key={i}
                  className={`flex flex-col gap-5 rounded-card border bg-surface p-7 ${LIFT} ${
                    featured
                      ? "border-foreground/25 shadow-lifted"
                      : "border-line shadow-soft"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{plan.name}</p>
                    {featured ? (
                      <span className="rounded-pill bg-foreground px-2.5 py-1 text-eyebrow font-semibold uppercase tracking-wider text-background">
                        Popular
                      </span>
                    ) : null}
                  </div>
                  <p className="font-display text-h2 font-bold tracking-[-0.02em]">
                    {plan.price}
                    <span className="text-lead font-normal text-muted">
                      {plan.period}
                    </span>
                  </p>
                  <ul className="flex flex-col gap-2.5 text-muted">
                    {plan.features
                      .split("\n")
                      .filter(Boolean)
                      .map((f, fi) => (
                        <li key={fi} className="flex gap-2.5">
                          <span aria-hidden className="text-foreground/40">
                            —
                          </span>
                          {f}
                        </li>
                      ))}
                  </ul>
                  <a
                    href={plan.buttonHref}
                    className={`mt-auto inline-flex items-center justify-center rounded-pill px-6 py-3 text-sm font-medium transition duration-200 ${
                      featured
                        ? "bg-foreground text-background hover:opacity-90"
                        : "border border-line-strong hover:bg-surface-subtle"
                    }`}
                  >
                    {plan.buttonLabel}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
    Embed: {
      fields: {
        url: { type: "text" },
        caption: { type: "text" },
      },
      defaultProps: { url: "", caption: "" },
      render: ({ url, caption }) => (
        <figure className={`${SECTION} py-4`}>
          {url ? (
            <div className="aspect-video w-full overflow-hidden rounded-card shadow-raised">
              <iframe
                src={embedSrc(url)}
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          ) : (
            <div className={`aspect-video ${PLACEHOLDER}`}>
              Paste a video or embed URL
            </div>
          )}
          {caption ? (
            <figcaption className="mt-3 text-center text-sm text-muted">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      ),
    },
    ProfileHero: {
      fields: {
        eyebrow: { type: "text" },
        heading: { type: "textarea" },
        intro: { type: "textarea" },
        photo: { type: "custom", render: ImageUploadField },
        theme: {
          type: "select",
          label: "Photo placeholder colour",
          options: GRADIENT_OPTIONS,
        },
        primaryLabel: { type: "text" },
        primaryHref: { type: "text" },
        secondaryLabel: { type: "text" },
        secondaryHref: { type: "text" },
      },
      defaultProps: {
        eyebrow: "Developer & designer",
        heading: "Turning ideas into things people can actually use.",
        intro:
          "I build web products end to end — write a sentence or two about what you do and who you do it for.",
        photo: "",
        theme: "midnight",
        primaryLabel: "See my work",
        primaryHref: "#work",
        secondaryLabel: "Get in touch",
        secondaryHref: "#contact",
      },
      render: ({
        eyebrow,
        heading,
        intro,
        photo,
        theme,
        primaryLabel,
        primaryHref,
        secondaryLabel,
        secondaryHref,
      }) => (
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={DOT_GRID}
          />
          <div
            className={`relative ${SECTION} grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]`}
          >
            <div className="order-2 md:order-1">
              {eyebrow ? <p className={EYEBROW}>{eyebrow}</p> : null}
              <h1 className="mt-4 font-display text-h1 font-bold leading-[1.05] tracking-[-0.03em] text-balance">
                {heading}
              </h1>
              <p className="mt-6 max-w-[52ch] text-lead leading-[1.7] text-muted">
                {intro}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                {primaryLabel ? (
                  <a
                    href={primaryHref}
                    className="inline-flex items-center rounded-pill bg-foreground px-7 py-3.5 font-medium text-background shadow-soft transition duration-200 ease-out hover:-translate-y-0.5 hover:opacity-90"
                  >
                    {primaryLabel}
                  </a>
                ) : null}
                {secondaryLabel ? (
                  <a
                    href={secondaryHref}
                    className="inline-flex items-center rounded-pill border border-line-strong px-7 py-3.5 font-medium transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-surface-subtle"
                  >
                    {secondaryLabel}
                  </a>
                ) : null}
              </div>
            </div>

            <div className="order-1 md:order-2">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt=""
                  className="aspect-square w-full rounded-card object-cover shadow-lifted"
                />
              ) : (
                <div
                  className="flex aspect-square w-full items-center justify-center rounded-card text-sm font-medium text-white/75 shadow-lifted"
                  style={{ backgroundImage: GRADIENTS[theme] }}
                >
                  Upload your photo
                </div>
              )}
            </div>
          </div>
        </section>
      ),
    },
    Stats: {
      fields: {
        items: {
          type: "array",
          arrayFields: {
            value: { type: "text" },
            label: { type: "text" },
          },
          defaultItemProps: { value: "10+", label: "Projects shipped" },
          getItemSummary: (item) => item.label || "Stat",
        },
      },
      defaultProps: {
        items: [
          { value: "5+", label: "Years experience" },
          { value: "20+", label: "Projects shipped" },
          { value: "12", label: "Happy clients" },
        ],
      },
      render: ({ items }) => (
        <div className={`${SECTION} ${SECTION_Y}`}>
          <div className="grid gap-8 border-y border-line py-10 sm:grid-cols-3">
            {items.map((item, i) => (
              <div key={i}>
                <p className="font-display text-h2 font-bold tracking-[-0.02em]">
                  {item.value}
                </p>
                <p className={`mt-1.5 ${EYEBROW}`}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    ProjectCard: {
      fields: {
        title: { type: "text" },
        category: { type: "text" },
        summary: { type: "textarea" },
        image: { type: "custom", render: ImageUploadField },
        theme: {
          type: "select",
          label: "Image placeholder colour",
          options: GRADIENT_OPTIONS,
        },
        tags: { type: "text", label: "Tags (comma separated)" },
        liveLabel: { type: "text" },
        liveHref: { type: "text" },
        sourceLabel: { type: "text" },
        sourceHref: { type: "text" },
        layout: {
          type: "radio",
          options: [
            { label: "Featured (wide)", value: "featured" },
            { label: "Compact", value: "compact" },
          ],
        },
      },
      defaultProps: {
        title: "Project name",
        category: "Featured project",
        summary:
          "A sentence or two on what the project does, what you built, and why it was interesting.",
        image: "",
        theme: "ocean",
        tags: "Next.js, TypeScript, Tailwind",
        liveLabel: "Visit",
        liveHref: "#",
        sourceLabel: "Source",
        sourceHref: "",
        layout: "featured",
      },
      render: ({
        title,
        category,
        summary,
        image,
        theme,
        tags,
        liveLabel,
        liveHref,
        sourceLabel,
        sourceHref,
        layout,
      }) => {
        const tagList = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

        // Compact stacks image over text so several sit side by side (drop
        // them into a Columns block); featured runs wide, one per row.
        const compact = layout === "compact";

        const media = image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-full w-full rounded-[0.75rem] object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full min-h-44 w-full items-center justify-center rounded-[0.75rem] text-sm font-medium text-white/75"
            style={{ backgroundImage: GRADIENTS[theme] }}
          >
            Upload a screenshot
          </div>
        );

        return (
          <div className={`${SECTION} py-4`}>
            <div
              className={`group grid gap-6 p-5 ${CARD} ${LIFT} ${
                compact ? "max-w-sm" : "md:grid-cols-2 md:items-center"
              }`}
            >
              <div
                className={`overflow-hidden rounded-[0.75rem] ${
                  compact ? "aspect-video" : ""
                }`}
              >
                {media}
              </div>
              <div className={compact ? "" : "md:pr-2"}>
                {category ? <p className={EYEBROW}>{category}</p> : null}
                <h3 className="mt-2 font-display text-h3 font-semibold tracking-[-0.01em]">
                  {title}
                </h3>
                <p className="mt-3 leading-[1.7] text-muted">{summary}</p>
                {tagList.length > 0 ? (
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {tagList.map((tag, i) => (
                      <li
                        key={i}
                        className="rounded-pill border border-line px-3 py-1 text-sm text-muted"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-6 flex flex-wrap items-center gap-5">
                  {liveLabel ? (
                    <a
                      href={liveHref}
                      className="text-sm font-semibold underline decoration-line-strong underline-offset-4 transition hover:decoration-current"
                    >
                      {liveLabel}
                    </a>
                  ) : null}
                  {sourceLabel && sourceHref ? (
                    <a
                      href={sourceHref}
                      className="text-sm font-medium text-muted underline decoration-line underline-offset-4 transition hover:text-foreground"
                    >
                      {sourceLabel}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    ArticleList: {
      fields: {
        items: {
          type: "array",
          arrayFields: {
            title: { type: "text" },
            summary: { type: "textarea" },
            date: { type: "text" },
            href: { type: "text" },
          },
          defaultItemProps: {
            title: "Article title",
            summary: "A one-line summary of what the piece is about.",
            date: "",
            href: "#",
          },
          getItemSummary: (item) => item.title || "Article",
        },
      },
      defaultProps: {
        items: [
          {
            title: "Write your first post",
            summary:
              "Swap this for something you've written — a build log, a lesson learned, a teardown.",
            date: "",
            href: "#",
          },
          {
            title: "Another piece worth reading",
            summary: "Add as many as you like, or remove this block entirely.",
            date: "",
            href: "#",
          },
        ],
      },
      render: ({ items }) => (
        <div className={`${SECTION} ${SECTION_Y}`}>
          <div className="flex flex-col">
            {items.map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="group flex flex-col gap-1.5 border-b border-line py-6 transition duration-200 first:border-t hover:px-2"
              >
                <div className="flex items-baseline justify-between gap-6">
                  <h3 className="font-display text-h3 font-semibold tracking-[-0.01em]">
                    {item.title}
                  </h3>
                  {item.date ? (
                    <span className="shrink-0 text-sm text-muted">
                      {item.date}
                    </span>
                  ) : null}
                </div>
                <p className="leading-[1.7] text-muted">{item.summary}</p>
              </a>
            ))}
          </div>
        </div>
      ),
    },
  },
};
