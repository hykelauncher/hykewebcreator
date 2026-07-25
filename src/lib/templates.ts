import type { Data } from "@puckeditor/core";
import { GRADIENTS, type GradientTheme } from "@/lib/gradients";

export type Template = {
  id: string;
  name: string;
  description: string;
  theme: GradientTheme;
  data: Data;
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
