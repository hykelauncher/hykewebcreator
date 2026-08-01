import type { Data, DefaultComponents } from "@puckeditor/core";
import { GRADIENTS, type GradientTheme } from "@/lib/gradients";

/**
 * Puck's default root props only cover `title`. This app's config adds a meta
 * description field (see `puckConfig.root`), so templates are typed against
 * that instead of the library default.
 */
type TemplateData = Data<
  DefaultComponents,
  { title?: string; metaDescription?: string }
>;

export type Template = {
  id: string;
  name: string;
  description: string;
  /** Gradient used for this template's card in the picker. */
  theme: GradientTheme;
  /** Visual theme the new site starts on (see src/lib/themes.ts). */
  themeId?: string;
  /** Seeds the site's home page. */
  data: TemplateData;
  /**
   * Extra pages created alongside the home page. Templates that describe a
   * whole site (rather than a single landing page) use this — the owner can
   * rename, reorder or delete any of them from site settings afterwards.
   */
  pages?: { slug: string; title: string; data: TemplateData }[];
};

function hero(props: {
  heading: string;
  subheading: string;
  theme: GradientTheme;
  buttonLabel: string;
  buttonHref: string;
}) {
  return {
    type: "Hero" as const,
    props: { id: "hero-1", backgroundImage: "", ...props },
  };
}

function heading(id: string, text: string, level: "h1" | "h2" | "h3" = "h2") {
  return { type: "Heading" as const, props: { id, text, level } };
}

function text(id: string, value: string) {
  return { type: "Text" as const, props: { id, text: value } };
}

function spacer(id: string, height: "sm" | "md" | "lg" = "md") {
  return { type: "Spacer" as const, props: { id, height } };
}

function nav(id: string) {
  return { type: "Nav" as const, props: { id } };
}

function button(id: string, label: string, href: string) {
  return { type: "Button" as const, props: { id, label, href } };
}

function profileHero(props: {
  id: string;
  eyebrow: string;
  heading: string;
  intro: string;
  theme: GradientTheme;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}) {
  return { type: "ProfileHero" as const, props: { photo: "", ...props } };
}

function stats(id: string, items: { value: string; label: string }[]) {
  return { type: "Stats" as const, props: { id, items } };
}

function projectCard(props: {
  id: string;
  title: string;
  category: string;
  summary: string;
  theme: GradientTheme;
  tags: string;
  layout?: "featured" | "compact";
}) {
  return {
    type: "ProjectCard" as const,
    props: {
      image: "",
      liveLabel: "Visit",
      liveHref: "#",
      sourceLabel: "Source",
      sourceHref: "",
      layout: "featured" as const,
      ...props,
    },
  };
}

function articleList(
  id: string,
  items: { title: string; summary: string; date: string; href: string }[],
) {
  return { type: "ArticleList" as const, props: { id, items } };
}

function headingAt(
  id: string,
  text: string,
  level: "h1" | "h2" | "h3" = "h2",
  align: "left" | "center" = "left",
) {
  return { type: "Heading" as const, props: { id, text, level, align } };
}

function textAt(
  id: string,
  value: string,
  align: "left" | "center" = "left",
) {
  return { type: "Text" as const, props: { id, text: value, align } };
}

function buttonAt(
  id: string,
  label: string,
  href: string,
  variant: "solid" | "outline" = "solid",
) {
  return { type: "Button" as const, props: { id, label, href, variant } };
}

function image(
  id: string,
  ratio: "wide" | "square" | "portrait" | "original",
  caption = "",
) {
  return { type: "Image" as const, props: { id, src: "", alt: "", ratio, caption } };
}

function testimonial(props: {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
}) {
  return { type: "Testimonial" as const, props: { avatar: "", ...props } };
}

function faq(id: string, items: { question: string; answer: string }[]) {
  return { type: "FAQAccordion" as const, props: { id, items } };
}

/** Photography ported from the B&C Resource design system (see public/templates/catering). */
const CATERING_IMG = "/templates/catering";

function cateringHero(props: {
  id: string;
  badge: string;
  heading: string;
  subheading: string;
  buttonLabel: string;
  buttonHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  bullets: string;
  backgroundImage?: string;
}) {
  return {
    type: "Hero" as const,
    props: { theme: "midnight" as GradientTheme, backgroundImage: "", ...props },
  };
}

function menuGrid(
  id: string,
  items: {
    name: string;
    description: string;
    price: string;
    image: string;
    badge?: string;
  }[],
) {
  return {
    type: "MenuGrid" as const,
    props: { id, items: items.map((i) => ({ badge: "", ...i })) },
  };
}

function band(props: {
  id: string;
  tone?: "band" | "accent" | "inverse";
  eyebrow: string;
  heading: string;
  text: string;
  buttonLabel: string;
  buttonHref: string;
  note?: string;
}) {
  return {
    type: "Band" as const,
    props: { tone: "band" as const, note: "", ...props },
  };
}

function pricing(id: string) {
  return {
    type: "PricingTable" as const,
    props: {
      id,
      plans: [
        {
          name: "Starter",
          price: "£X",
          period: " project",
          features: "Scope one\nScope two\nScope three",
          buttonLabel: "Enquire",
          buttonHref: "#contact",
          highlighted: "no" as const,
        },
        {
          name: "Full engagement",
          price: "£XX",
          period: " project",
          features:
            "Everything in Starter\nExtended scope\nOngoing support",
          buttonLabel: "Enquire",
          buttonHref: "#contact",
          highlighted: "yes" as const,
        },
      ],
    },
  };
}

function gallery(id: string, count: number) {
  return {
    type: "Gallery" as const,
    props: { id, images: Array.from({ length: count }, () => ({ src: "", alt: "" })) },
  };
}

export const TEMPLATES: Template[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Start from an empty page and build it your way.",
    theme: "midnight",
    data: { root: { props: {} }, content: [] },
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "A bold intro plus a space to showcase your work.",
    theme: "grape",
    data: {
      root: { props: {} },
      content: [
        hero({
          heading: "Hi, I'm [Your Name]",
          subheading: "I design and build things for the web.",
          theme: "grape",
          buttonLabel: "See my work",
          buttonHref: "#work",
        }),
        spacer("spacer-1", "md"),
        heading("heading-1", "Selected work"),
        text(
          "text-1",
          "Add a short project description here — what you built, for whom, and what made it interesting.",
        ),
        spacer("spacer-2", "lg"),
      ],
    },
  },
  {
    id: "business",
    name: "Business",
    description: "A clean landing page for a company or service.",
    theme: "ocean",
    data: {
      root: { props: {} },
      content: [
        hero({
          heading: "Your business, online in minutes",
          subheading: "Tell visitors what you do and why it matters.",
          theme: "ocean",
          buttonLabel: "Get in touch",
          buttonHref: "#contact",
        }),
        spacer("spacer-1", "md"),
        heading("heading-1", "What we do"),
        text(
          "text-1",
          "Describe your product or service in a couple of sentences that make it easy to understand at a glance.",
        ),
        spacer("spacer-2", "md"),
        heading("heading-2", "Get in touch", "h3"),
        text("text-2", "Add your contact details or a link to a contact form."),
        spacer("spacer-3", "lg"),
      ],
    },
  },
  {
    id: "dev-portfolio",
    name: "Developer portfolio",
    description:
      "A four-page portfolio: intro, work, writing and about. Every section is editable.",
    theme: "midnight",
    data: {
      root: {
        props: {
          title: "Home",
          metaDescription:
            "Developer portfolio — selected work, writing and how to get in touch.",
        },
      },
      content: [
        nav("home-nav"),
        profileHero({
          id: "home-hero",
          eyebrow: "Developer & designer",
          heading: "Turning ideas into things people can actually use.",
          intro:
            "I'm [Your Name]. I build web products end to end — replace this with a couple of sentences about what you do and who you do it for.",
          theme: "midnight",
          primaryLabel: "See my work",
          primaryHref: "/projects",
          secondaryLabel: "Get in touch",
          secondaryHref: "#contact",
        }),
        stats("home-stats", [
          { value: "5+", label: "Years experience" },
          { value: "20+", label: "Projects shipped" },
          { value: "12", label: "Happy clients" },
        ]),
        spacer("home-spacer-1", "md"),
        heading("home-work-heading", "Selected work"),
        projectCard({
          id: "home-project-1",
          title: "Project name",
          category: "Featured project",
          summary:
            "What it does, what you built, and what made it interesting. Swap the screenshot for your own.",
          theme: "ocean",
          tags: "Next.js, TypeScript, Tailwind",
        }),
        projectCard({
          id: "home-project-2",
          title: "Another project",
          category: "Featured project",
          summary:
            "Add as many project cards as you like, or move them onto the Projects page.",
          theme: "grape",
          tags: "React, Node, Postgres",
        }),
        spacer("home-spacer-2", "md"),
        heading("home-writing-heading", "Writing"),
        articleList("home-articles", [
          {
            title: "Write your first post",
            summary:
              "Swap this for something you've written — a build log, a lesson learned, a teardown.",
            date: "",
            href: "/articles",
          },
        ]),
        spacer("home-spacer-3", "md"),
        heading("home-contact-heading", "Let's work together"),
        text(
          "home-contact-text",
          "Tell people how to reach you — an email address, a booking link, or the social account you actually check.",
        ),
        button("home-contact-button", "Email me", "mailto:you@example.com"),
        spacer("home-spacer-4", "lg"),
      ],
    },
    pages: [
      {
        slug: "projects",
        title: "Projects",
        data: {
          root: {
            props: {
              title: "Projects",
              metaDescription: "Things I've designed and built.",
            },
          },
          content: [
            nav("projects-nav"),
            spacer("projects-spacer-0", "md"),
            heading("projects-heading", "Projects", "h1"),
            text(
              "projects-intro",
              "A longer list of what you've built. Each card takes a screenshot, a summary, tags and links.",
            ),
            projectCard({
              id: "projects-card-1",
              title: "Project name",
              category: "Web app",
              summary:
                "What the project does and the part you played in it.",
              theme: "ocean",
              tags: "Next.js, TypeScript",
            }),
            projectCard({
              id: "projects-card-2",
              title: "Project name",
              category: "Client work",
              summary:
                "Another one — duplicate this card for each project you want to show.",
              theme: "forest",
              tags: "React, Tailwind",
            }),
            projectCard({
              id: "projects-card-3",
              title: "Project name",
              category: "Side project",
              summary:
                "Switch a card to the compact layout if you'd rather show more of them at once.",
              theme: "sunset",
              tags: "Design, Prototyping",
              layout: "compact",
            }),
            spacer("projects-spacer-1", "lg"),
          ],
        },
      },
      {
        slug: "articles",
        title: "Articles",
        data: {
          root: {
            props: {
              title: "Articles",
              metaDescription: "Notes, build logs and things I'm learning.",
            },
          },
          content: [
            nav("articles-nav"),
            spacer("articles-spacer-0", "md"),
            heading("articles-heading", "Articles", "h1"),
            text(
              "articles-intro",
              "Notes, build logs, and things worth writing down.",
            ),
            articleList("articles-list", [
              {
                title: "Write your first post",
                summary:
                  "Each entry links wherever you want — a page on this site, or somewhere else entirely.",
                date: "",
                href: "#",
              },
              {
                title: "A second piece",
                summary:
                  "Add, reorder and remove entries from the block's settings panel.",
                date: "",
                href: "#",
              },
            ]),
            spacer("articles-spacer-1", "lg"),
          ],
        },
      },
      {
        slug: "about",
        title: "About",
        data: {
          root: {
            props: {
              title: "About",
              metaDescription: "A bit more about me and how I work.",
            },
          },
          content: [
            nav("about-nav"),
            spacer("about-spacer-0", "md"),
            heading("about-heading", "About me", "h1"),
            text(
              "about-bio",
              "Write the longer version here — how you got into this, what you care about in the work, and the kind of projects you want more of.",
            ),
            stats("about-stats", [
              { value: "5+", label: "Years experience" },
              { value: "20+", label: "Projects shipped" },
              { value: "12", label: "Happy clients" },
            ]),
            spacer("about-spacer-1", "md"),
            heading("about-contact-heading", "Get in touch", "h3"),
            text(
              "about-contact-text",
              "The best way to reach you, and what you're currently open to.",
            ),
            button("about-contact-button", "Email me", "mailto:you@example.com"),
            spacer("about-spacer-2", "lg"),
          ],
        },
      },
    ],
  },
  {
    // Direction: disciplined editorial grid, oversized type, hairline rules,
    // tiny uppercase metadata, almost no chrome. The Agency grid theme drops
    // shadows and radii so structure comes from alignment and rules alone.
    id: "agency",
    name: "Agency grid",
    description:
      "Editorial and architectural. Oversized type, hairline rules, generous space.",
    theme: "midnight",
    themeId: "agency",
    data: {
      root: {
        props: {
          title: "Studio",
          metaDescription:
            "An independent design and strategy studio working across brand, product and space.",
        },
      },
      content: [
        nav("agency-nav"),
        headingAt(
          "agency-hero",
          "We build brands with structure, restraint and a point of view.",
          "h1",
        ),
        textAt(
          "agency-hero-sub",
          "An independent studio working across brand, product and space. Replace this with the one sentence you want remembered.",
        ),
        buttonAt("agency-hero-cta", "Selected work", "/work", "outline"),
        spacer("agency-sp-1", "lg"),
        image("agency-hero-image", "wide", "Replace with a wide, architectural image."),
        spacer("agency-sp-2", "lg"),
        headingAt("agency-cap", "Capabilities"),
        stats("agency-stats", [
          { value: "01", label: "Brand & identity" },
          { value: "02", label: "Digital product" },
          { value: "03", label: "Art direction" },
        ]),
        spacer("agency-sp-3", "md"),
        projectCard({
          id: "agency-project-1",
          title: "Project name",
          category: "Brand identity — 2026",
          summary:
            "One paragraph on the brief, the thinking, and what changed as a result.",
          theme: "midnight",
          tags: "Identity, Art direction",
        }),
        projectCard({
          id: "agency-project-2",
          title: "Project name",
          category: "Digital product — 2025",
          summary:
            "Keep the writing plain. The grid and the type are doing the work.",
          theme: "ocean",
          tags: "Product, Design system",
        }),
        spacer("agency-sp-4", "lg"),
        headingAt("agency-contact", "Start a project", "h2"),
        textAt(
          "agency-contact-text",
          "Tell people how to begin — an email address and what you need from a first message.",
        ),
        buttonAt("agency-contact-cta", "hello@yourstudio.com", "mailto:hello@yourstudio.com", "outline"),
        spacer("agency-sp-5", "lg"),
      ],
    },
    pages: [
      {
        slug: "work",
        title: "Work",
        data: {
          root: {
            props: {
              title: "Work",
              metaDescription: "Selected projects.",
            },
          },
          content: [
            nav("work-nav"),
            headingAt("work-heading", "Selected work", "h1"),
            textAt(
              "work-intro",
              "A short line about how you choose what to show.",
            ),
            projectCard({
              id: "work-project-1",
              title: "Project name",
              category: "Brand identity — 2026",
              summary: "What the brief asked for and what you made.",
              theme: "grape",
              tags: "Identity, Print",
            }),
            projectCard({
              id: "work-project-2",
              title: "Project name",
              category: "Exhibition — 2025",
              summary: "Duplicate this card for each project.",
              theme: "forest",
              tags: "Spatial, Art direction",
            }),
            spacer("work-sp-1", "lg"),
          ],
        },
      },
      {
        slug: "studio",
        title: "Studio",
        data: {
          root: {
            props: {
              title: "Studio",
              metaDescription: "How the studio works and who it's for.",
            },
          },
          content: [
            nav("studio-nav"),
            headingAt("studio-heading", "Studio", "h1"),
            textAt(
              "studio-text",
              "Who you are, how you work, and the kind of problem you want next. Keep it to two short paragraphs.",
            ),
            image("studio-image", "wide", "A working shot, not a stock portrait."),
            spacer("studio-sp-1", "md"),
            headingAt("studio-clients", "Selected clients", "h3"),
            textAt(
              "studio-clients-text",
              "List them plainly, separated by commas. Only real ones.",
            ),
            spacer("studio-sp-2", "lg"),
          ],
        },
      },
    ],
  },
  {
    // Direction: near-black shell, work first, each project treated as its own
    // chapter. Studio voice comes only after the work has earned attention.
    id: "editorial",
    name: "Editorial chapters",
    description:
      "Dark, work-led storytelling. Each project reads as its own chapter.",
    theme: "midnight",
    themeId: "editorial",
    data: {
      root: {
        props: {
          title: "Home",
          metaDescription:
            "A creative studio. Selected work, told one chapter at a time.",
        },
      },
      content: [
        nav("ed-nav"),
        image("ed-hero-image", "wide", ""),
        headingAt(
          "ed-hero",
          "Work that earns a second look.",
          "h1",
        ),
        textAt(
          "ed-hero-sub",
          "One line that positions the studio. Say what you make and who for — nothing else yet.",
        ),
        spacer("ed-sp-1", "lg"),
        projectCard({
          id: "ed-project-1",
          title: "Project name",
          category: "Campaign — 2026",
          summary:
            "Open with the strongest piece. Title, role, year, and one action — no hover required to understand it.",
          theme: "grape",
          tags: "Campaign, Film",
        }),
        projectCard({
          id: "ed-project-2",
          title: "Project name",
          category: "Identity — 2025",
          summary:
            "Alternate the pacing. Let the strongest proof change scale rather than making every section a hero.",
          theme: "sunset",
          tags: "Identity, Editorial",
        }),
        spacer("ed-sp-2", "lg"),
        headingAt("ed-studio", "The studio"),
        textAt(
          "ed-studio-text",
          "Now the point of view: how you work, what you refuse, who it suits. Two paragraphs at most.",
        ),
        spacer("ed-sp-3", "md"),
        headingAt("ed-services", "What we do"),
        articleList("ed-services-list", [
          {
            title: "Brand & identity",
            summary: "Naming, identity systems, art direction.",
            date: "",
            href: "#",
          },
          {
            title: "Digital product",
            summary: "Design systems, interface design, prototypes.",
            date: "",
            href: "#",
          },
          {
            title: "Film & motion",
            summary: "Direction, edit, sound.",
            date: "",
            href: "#",
          },
        ]),
        spacer("ed-sp-4", "lg"),
        headingAt("ed-contact", "Work with us", "h2", "center"),
        textAt(
          "ed-contact-text",
          "One clear ask, one address. Make the ending feel deliberate rather than tacked on.",
          "center",
        ),
        buttonAt("ed-contact-cta", "Start a conversation", "mailto:hello@example.com"),
        spacer("ed-sp-5", "lg"),
      ],
    },
    pages: [
      {
        slug: "work",
        title: "Work",
        data: {
          root: {
            props: { title: "Work", metaDescription: "Selected projects." },
          },
          content: [
            nav("edwork-nav"),
            headingAt("edwork-heading", "Work", "h1"),
            projectCard({
              id: "edwork-1",
              title: "Project name",
              category: "Campaign — 2026",
              summary: "The brief, the idea, the result.",
              theme: "ocean",
              tags: "Campaign",
            }),
            projectCard({
              id: "edwork-2",
              title: "Project name",
              category: "Identity — 2025",
              summary: "Add one card per project.",
              theme: "rose",
              tags: "Identity",
            }),
            spacer("edwork-sp", "lg"),
          ],
        },
      },
      {
        slug: "contact",
        title: "Contact",
        data: {
          root: {
            props: {
              title: "Contact",
              metaDescription: "Start a project with the studio.",
            },
          },
          content: [
            nav("edcontact-nav"),
            headingAt("edcontact-heading", "Let's talk", "h1", "center"),
            textAt(
              "edcontact-text",
              "Where to reach you, what you need in a first message, and how quickly you reply.",
              "center",
            ),
            buttonAt("edcontact-cta", "hello@example.com", "mailto:hello@example.com"),
            spacer("edcontact-sp", "lg"),
          ],
        },
      },
    ],
  },
  {
    // Direction: warm neutral surfaces, calm modular grid, restrained accent.
    // Light mode only — the Warm minimal theme fixes its palette.
    id: "warm-service",
    name: "Warm minimal",
    description:
      "Calm beige service site with a quiet process grid. Light mode by design.",
    theme: "sunset",
    themeId: "warm",
    data: {
      root: {
        props: {
          title: "Home",
          metaDescription:
            "A calm, considered service — what it is, how it works, and what it costs.",
        },
      },
      content: [
        nav("warm-nav"),
        headingAt("warm-hero", "Considered work, calmly delivered.", "h1", "center"),
        textAt(
          "warm-hero-sub",
          "One or two sentences on what you offer and who it suits. Warm, plain, unhurried.",
          "center",
        ),
        buttonAt("warm-hero-cta", "Book an intro call", "#contact"),
        spacer("warm-sp-1", "md"),
        image("warm-hero-image", "wide", ""),
        spacer("warm-sp-2", "md"),
        headingAt("warm-process", "How it works"),
        stats("warm-steps", [
          { value: "01", label: "Introduction" },
          { value: "02", label: "Proposal" },
          { value: "03", label: "Delivery" },
        ]),
        textAt(
          "warm-process-text",
          "A sentence per step, written so someone can picture what happens and when.",
        ),
        spacer("warm-sp-3", "md"),
        headingAt("warm-work", "Recent work"),
        gallery("warm-gallery", 3),
        spacer("warm-sp-4", "md"),
        testimonial({
          id: "warm-testimonial",
          quote:
            "Replace this with something a real client said. One specific sentence beats three vague ones.",
          authorName: "Client name",
          authorRole: "Role, Company",
        }),
        spacer("warm-sp-5", "md"),
        headingAt("warm-faq", "Questions"),
        faq("warm-faq-list", [
          {
            question: "How long does a project take?",
            answer: "Answer honestly, with a range rather than a promise.",
          },
          {
            question: "What does it cost?",
            answer:
              "Give a starting figure. People filter themselves out, which saves you both time.",
          },
          {
            question: "How do we start?",
            answer: "Describe the very first step and how to take it.",
          },
        ]),
        spacer("warm-sp-6", "md"),
        headingAt("warm-contact", "Get in touch", "h2", "center"),
        textAt(
          "warm-contact-text",
          "Your email address, and what to include so you can reply properly.",
          "center",
        ),
        buttonAt("warm-contact-cta", "hello@example.com", "mailto:hello@example.com"),
        spacer("warm-sp-7", "lg"),
      ],
    },
    pages: [
      {
        slug: "services",
        title: "Services",
        data: {
          root: {
            props: {
              title: "Services",
              metaDescription: "What's on offer, and what each thing includes.",
            },
          },
          content: [
            nav("warmsvc-nav"),
            headingAt("warmsvc-heading", "Services", "h1"),
            textAt(
              "warmsvc-intro",
              "A short line framing how you like to work with people.",
            ),
            pricing("warmsvc-pricing"),
            spacer("warmsvc-sp", "lg"),
          ],
        },
      },
      {
        slug: "about",
        title: "About",
        data: {
          root: {
            props: {
              title: "About",
              metaDescription: "Who's behind the work.",
            },
          },
          content: [
            nav("warmabout-nav"),
            headingAt("warmabout-heading", "About", "h1"),
            textAt(
              "warmabout-text",
              "The longer version: background, approach, and what you care about in the work.",
            ),
            image("warmabout-image", "portrait", ""),
            spacer("warmabout-sp", "lg"),
          ],
        },
      },
    ],
  },
  {
    // Ported from the B&C Resource design system: chocolate brown and cream
    // with amber gold, an emerald events band, and rounded appetising cards.
    // Photography and menu content come from that project.
    id: "catering",
    name: "Catering & events",
    description:
      "Warm brown and cream. Menu grid, events band and quote form — built for caterers.",
    theme: "sunset",
    themeId: "catering",
    data: {
      root: {
        props: {
          title: "Home",
          metaDescription:
            "Home-cooked Nigerian catering by the tray for weddings, parties and corporate events.",
        },
      },
      content: [
        nav("cat-nav"),
        cateringHero({
          id: "cat-hero",
          badge: "Authentic Nigerian Cuisine",
          heading: "Great taste, for your occasion.",
          subheading:
            "Home-cooked Nigerian soups, rice, proteins and small chops — catered by the tray for weddings, parties and corporate events.",
          buttonLabel: "Browse the menu",
          buttonHref: "/menu",
          secondaryLabel: "Plan an event",
          secondaryHref: "/events",
          bullets:
            "Cooked fresh to order, Weddings · parties · corporate, Great taste, excellent service",
          backgroundImage: `${CATERING_IMG}/hero.webp`,
        }),
        headingAt("cat-menu-eyebrow", "Our menu", "h2"),
        textAt(
          "cat-menu-intro",
          "Soups & stews, rice, proteins and more — choose a tray size and add to your order. Custom packages available on request.",
        ),
        menuGrid("cat-menu", [
          {
            name: "Egusi Soup",
            description:
              "Rich melon-seed soup with assorted meat and leafy veg.",
            price: "From £45",
            image: `${CATERING_IMG}/egusi.webp`,
            badge: "Popular",
          },
          {
            name: "Jollof Rice",
            description: "Smoky party jollof in a rich tomato and pepper base.",
            price: "From £40",
            image: `${CATERING_IMG}/jollof.webp`,
            badge: "Popular",
          },
          {
            name: "Fried Rice",
            description: "Seasoned fried rice with liver, peas and mixed veg.",
            price: "From £45",
            image: `${CATERING_IMG}/friedrice.webp`,
          },
          {
            name: "Peppered Chicken",
            description: "Grilled chicken tossed in a peppered sauce.",
            price: "From £50",
            image: `${CATERING_IMG}/peppered_chicken.webp`,
          },
          {
            name: "Ofada Rice",
            description: "Local rice served with rich ayamase pepper sauce.",
            price: "From £50",
            image: `${CATERING_IMG}/ofada.webp`,
          },
          {
            name: "Moi Moi",
            description: "Steamed bean pudding, soft and lightly spiced.",
            price: "From £35",
            image: `${CATERING_IMG}/moimoi.webp`,
          },
        ]),
        band({
          id: "cat-events-band",
          eyebrow: "We cater for all events",
          heading: "Weddings, birthdays, corporate & private parties",
          text: "Tell us your headcount and date — we'll build a custom package and bring great taste to your occasion.",
          buttonLabel: "Request a quote",
          buttonHref: "/events",
          note: "Call us on 000 0000 0000",
        }),
        spacer("cat-sp-1", "md"),
        headingAt("cat-why", "Why choose us", "h2"),
        stats("cat-stats", [
          { value: "Fresh", label: "Cooked to order" },
          { value: "By the tray", label: "2L · 4L · 5L" },
          { value: "UK-wide", label: "Delivery & setup" },
        ]),
        spacer("cat-sp-2", "lg"),
      ],
    },
    pages: [
      {
        slug: "menu",
        title: "Menu",
        data: {
          root: {
            props: {
              title: "Menu",
              metaDescription:
                "Soups and stews, rice dishes, proteins, sides and small chops — by the tray.",
            },
          },
          content: [
            nav("catmenu-nav"),
            spacer("catmenu-sp-0", "md"),
            headingAt("catmenu-heading", "Order by the tray", "h1"),
            textAt(
              "catmenu-intro",
              "Every dish comes in 2L, 4L and 5L trays. Prices shown are a starting point — tell us your headcount and we'll confirm.",
            ),
            headingAt("catmenu-soups", "Soups & stews", "h3"),
            menuGrid("catmenu-soups-grid", [
              {
                name: "Egusi Soup",
                description: "Rich melon-seed soup with assorted meat and leafy veg.",
                price: "From £45",
                image: `${CATERING_IMG}/egusi.webp`,
                badge: "Popular",
              },
              {
                name: "Ogbono Soup",
                description: "Draw soup of ground ogbono seeds and tender meat.",
                price: "From £45",
                image: `${CATERING_IMG}/ogbono.webp`,
              },
              {
                name: "Efo Riro (Vegetable)",
                description: "Spinach stew with peppers, locust bean and assorted meat.",
                price: "From £50",
                image: `${CATERING_IMG}/eforiro.webp`,
              },
              {
                name: "Okra Soup",
                description: "Classic draw soup with okra, palm oil and meat.",
                price: "From £45",
                image: `${CATERING_IMG}/okra.webp`,
              },
              {
                name: "Banga Soup",
                description: "Palm-fruit soup with rich spices and assorted meat.",
                price: "From £55",
                image: `${CATERING_IMG}/banga.webp`,
              },
              {
                name: "Oha Soup",
                description: "Eastern delicacy with oha leaf and cocoyam thickener.",
                price: "From £55",
                image: `${CATERING_IMG}/oha.webp`,
              },
              {
                name: "Bitterleaf Soup",
                description: "Onugbu soup, well-washed bitterleaf and assorted meat.",
                price: "From £55",
                image: `${CATERING_IMG}/bitterleaf.webp`,
              },
              {
                name: "Edikankong Soup",
                description: "Calabar vegetable soup with waterleaf and ugu.",
                price: "From £50",
                image: `${CATERING_IMG}/edikankong.webp`,
              },
              {
                name: "Afamang Soup",
                description: "Hearty Efik soup, premium assorted meat and fish.",
                price: "From £60",
                image: `${CATERING_IMG}/afamang.webp`,
                badge: "Signature",
              },
            ]),
            headingAt("catmenu-rice", "Rice dishes", "h3"),
            menuGrid("catmenu-rice-grid", [
              {
                name: "Jollof Rice",
                description: "Smoky party jollof in a rich tomato and pepper base.",
                price: "From £40",
                image: `${CATERING_IMG}/jollof.webp`,
                badge: "Popular",
              },
              {
                name: "Fried Rice",
                description: "Seasoned fried rice with liver, peas and mixed veg.",
                price: "From £45",
                image: `${CATERING_IMG}/friedrice.webp`,
              },
              {
                name: "Coconut Rice",
                description: "Fragrant rice simmered in fresh coconut milk.",
                price: "From £50",
                image: `${CATERING_IMG}/coconut.webp`,
              },
              {
                name: "Ofada Rice & Ayamase",
                description: "Local brown rice with spicy green pepper sauce.",
                price: "From £55",
                image: `${CATERING_IMG}/ofada.webp`,
              },
            ]),
            headingAt("catmenu-proteins", "Proteins", "h3"),
            menuGrid("catmenu-proteins-grid", [
              {
                name: "Chicken Stew",
                description: "Tender chicken in seasoned tomato stew.",
                price: "From £50",
                image: `${CATERING_IMG}/chicken.webp`,
              },
              {
                name: "Beef Stew",
                description: "Slow-cooked beef in rich pepper stew.",
                price: "From £50",
                image: `${CATERING_IMG}/beef.webp`,
              },
              {
                name: "Goat Meat Stew",
                description: "Spiced goat meat simmered until tender.",
                price: "From £60",
                image: `${CATERING_IMG}/goat.webp`,
                badge: "Popular",
              },
              {
                name: "Assorted Meat Stew",
                description: "Mixed cuts and offal in a deep, savoury stew.",
                price: "From £60",
                image: `${CATERING_IMG}/assorted.webp`,
              },
              {
                name: "Turkey Stew",
                description: "Meaty turkey portions in tomato pepper stew.",
                price: "From £60",
                image: `${CATERING_IMG}/turkey.webp`,
              },
              {
                name: "Fish Stew (Mackerel)",
                description: "Fresh mackerel in a tangy pepper stew.",
                price: "From £50",
                image: `${CATERING_IMG}/fish.webp`,
              },
            ]),
            headingAt("catmenu-sides", "Sides", "h3"),
            menuGrid("catmenu-sides-grid", [
              {
                name: "Beans (Ewa Riro)",
                description: "Soft mashed beans in spiced palm-oil sauce.",
                price: "From £40",
                image: `${CATERING_IMG}/ewa.webp`,
              },
              {
                name: "Yam Porridge",
                description: "Diced yam in a rich, peppery pottage.",
                price: "From £45",
                image: `${CATERING_IMG}/yam.webp`,
              },
              {
                name: "Fried Plantain (Dodo)",
                description: "Sweet ripe plantain, golden-fried.",
                price: "From £30",
                image: `${CATERING_IMG}/plantain.webp`,
                badge: "Loved",
              },
            ]),
            headingAt("catmenu-extras", "Small chops & extras", "h3"),
            textAt(
              "catmenu-extras-note",
              "Priced per piece or wrap rather than by the tray.",
            ),
            menuGrid("catmenu-extras-grid", [
              {
                name: "Moi Moi (Fish)",
                description: "Steamed bean pudding with fish.",
                price: "£2.50 per wrap",
                image: `${CATERING_IMG}/moimoi.webp`,
              },
              {
                name: "Moi Moi (Fish & Egg)",
                description: "Steamed bean pudding, fish and egg.",
                price: "£3.00 per wrap",
                image: `${CATERING_IMG}/moimoi.webp`,
              },
              {
                name: "Moi Moi (Fish, Corned Beef & Egg)",
                description: "Loaded moi moi.",
                price: "£4.00 per wrap",
                image: `${CATERING_IMG}/moimoi.webp`,
              },
              {
                name: "Peppered Chicken",
                description: "Grilled and peppered.",
                price: "£5.00 per piece",
                image: `${CATERING_IMG}/peppered_chicken.webp`,
              },
              {
                name: "Peppered Turkey",
                description: "Grilled and peppered.",
                price: "£6.00 per piece",
                image: `${CATERING_IMG}/peppered_turkey.webp`,
              },
              {
                name: "Peppered Beef",
                description: "Spicy peppered beef.",
                price: "£5.00 per portion",
                image: `${CATERING_IMG}/peppered.webp`,
              },
              {
                name: "Peppered Fish",
                description: "Spicy peppered fish.",
                price: "£6.00 per piece",
                image: `${CATERING_IMG}/peppered_fish.webp`,
              },
              {
                name: "Peppered Goat Meat",
                description: "Spicy peppered goat.",
                price: "£6.00 per portion",
                image: `${CATERING_IMG}/peppered.webp`,
              },
            ]),
            band({
              id: "catmenu-band",
              tone: "accent",
              eyebrow: "Not sure what you need?",
              heading: "We'll build a package around your headcount",
              text: "Send us the date and numbers and we'll come back with a quote.",
              buttonLabel: "Request a quote",
              buttonHref: "/events",
            }),
            spacer("catmenu-sp-1", "lg"),
          ],
        },
      },
      {
        slug: "events",
        title: "Events",
        data: {
          root: {
            props: {
              title: "Events",
              metaDescription:
                "Catering for weddings, birthdays, corporate and private parties.",
            },
          },
          content: [
            nav("catev-nav"),
            band({
              id: "catev-hero",
              eyebrow: "Events & catering",
              heading: "Let us cater your next occasion.",
              text: "Tell us the date, the headcount and the kind of event, and we'll put together a package.",
              buttonLabel: "Call us",
              buttonHref: "tel:00000000000",
              note: "000 0000 0000",
            }),
            spacer("catev-sp-0", "md"),
            headingAt("catev-heading", "What we cater", "h2"),
            stats("catev-stats", [
              { value: "Weddings", label: "Full-day service" },
              { value: "Corporate", label: "Office & conference" },
              { value: "Private", label: "Birthdays & naming" },
            ]),
            headingAt("catev-how", "How it works", "h3"),
            faq("catev-faq", [
              {
                question: "How far in advance should I book?",
                answer:
                  "Two to three weeks is comfortable for most events. Get in touch sooner for large weddings.",
              },
              {
                question: "Do you deliver and set up?",
                answer:
                  "Yes — tell us the venue and access times and we'll handle delivery and setup.",
              },
              {
                question: "Can you build a custom package?",
                answer:
                  "That's most of what we do. Send your headcount and preferences and we'll price it up.",
              },
            ]),
            spacer("catev-sp-1", "lg"),
          ],
        },
      },
      {
        slug: "contact",
        title: "Contact",
        data: {
          root: {
            props: {
              title: "Contact",
              metaDescription: "Get in touch about catering for your event.",
            },
          },
          content: [
            nav("catcon-nav"),
            spacer("catcon-sp-0", "md"),
            headingAt("catcon-heading", "We'd love to hear from you.", "h1"),
            textAt(
              "catcon-text",
              "Call, message or email — whichever is easiest. Tell us your date, headcount and venue and we'll come straight back to you.",
            ),
            buttonAt("catcon-call", "Call 000 0000 0000", "tel:00000000000"),
            buttonAt(
              "catcon-email",
              "hello@example.com",
              "mailto:hello@example.com",
              "outline",
            ),
            spacer("catcon-sp-1", "md"),
            headingAt("catcon-hours", "Opening hours", "h3"),
            textAt(
              "catcon-hours-text",
              "Monday to Saturday, 9am — 7pm\nSunday, by arrangement",
            ),
            spacer("catcon-sp-2", "lg"),
          ],
        },
      },
    ],
  },
  {
    id: "blog",
    name: "Blog",
    description: "A simple header and article layout for writing.",
    theme: "sunset",
    data: {
      root: { props: {} },
      content: [
        hero({
          heading: "Welcome to my blog",
          subheading: "Thoughts, notes, and things I'm learning.",
          theme: "sunset",
          buttonLabel: "",
          buttonHref: "",
        }),
        spacer("spacer-1", "md"),
        heading("heading-1", "Your first post title"),
        text(
          "text-1",
          "Start writing here. Replace this with your first post, and add more Heading + Text blocks for each new entry.",
        ),
        spacer("spacer-2", "lg"),
      ],
    },
  },
];

export function getTemplate(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export { GRADIENTS };
