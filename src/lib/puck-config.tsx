import type { Config, Slot } from "@puckeditor/core";
import { ImageUploadField } from "@/components/image-upload-field";
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
  Button: { label: string; href: string; variant: "solid" | "outline" };
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
      },
      defaultProps: { label: "Click me", href: "#", variant: "solid" },
      render: ({ label, href, variant }) => (
        <div className={`${SECTION} py-3`}>
          {/* Theme-aware rather than hardcoded black-on-white: a black pill is
              nearly invisible on a site rendering in dark mode. */}
          <a
            href={href}
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
      ),
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
        buttonLabel: { type: "text" },
        buttonHref: { type: "text" },
      },
      defaultProps: {
        heading: "Your headline goes here",
        subheading: "A short supporting line about your site.",
        theme: "midnight",
        backgroundImage: "",
        buttonLabel: "Get started",
        buttonHref: "#",
      },
      render: ({
        heading,
        subheading,
        theme,
        backgroundImage,
        buttonLabel,
        buttonHref,
      }) => (
        <section
          className="relative isolate overflow-hidden bg-cover bg-center px-6 py-28 text-white sm:py-36"
          style={heroBackground(theme, backgroundImage)}
        >
          {/* Keeps text legible over a busy uploaded photo. */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-transparent to-black/35" />
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <h1 className="font-display text-h1 font-bold leading-[1.05] tracking-[-0.03em] text-balance drop-shadow-sm">
              {heading}
            </h1>
            <p className="max-w-xl text-lead leading-[1.6] text-white/85">
              {subheading}
            </p>
            {buttonLabel ? (
              <a
                href={buttonHref}
                className="mt-2 inline-flex items-center rounded-pill bg-white px-8 py-4 font-medium text-neutral-900 shadow-lifted transition duration-200 ease-out hover:-translate-y-0.5"
              >
                {buttonLabel}
              </a>
            ) : null}
          </div>
        </section>
      ),
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
        return (
          <nav className="sticky top-0 z-50 border-b border-line bg-background/80 backdrop-blur-md">
            <div className={`${SECTION} flex flex-wrap items-center gap-1 py-3.5`}>
              {pages.map((page) => {
                const active = page.slug === currentSlug;
                return (
                  <a
                    key={page.slug}
                    href={page.slug ? `/${page.slug}` : "/"}
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
