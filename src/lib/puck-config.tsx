import type { Config } from "@puckeditor/core";
import { ImageUploadField } from "@/components/image-upload-field";
import { GRADIENT_OPTIONS, GRADIENTS, heroBackground, type GradientTheme } from "@/lib/gradients";

type Components = {
  Heading: { text: string; level: "h1" | "h2" | "h3" };
  Text: { text: string };
  Button: { label: string; href: string };
  Image: { src: string; alt: string };
  Hero: {
    heading: string;
    subheading: string;
    theme: GradientTheme;
    backgroundImage: string;
    buttonLabel: string;
    buttonHref: string;
  };
  Spacer: { height: "sm" | "md" | "lg" };
};

export const puckConfig: Config<{ components: Components }> = {
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
      },
      defaultProps: { text: "Heading", level: "h2" },
      render: ({ text, level }) => {
        const Tag = level;
        return (
          <Tag className="px-6 py-2 font-bold text-4xl tracking-tight">
            {text}
          </Tag>
        );
      },
    },
    Text: {
      fields: { text: { type: "textarea" } },
      defaultProps: { text: "Write something here." },
      render: ({ text }) => (
        <p className="px-6 py-2 max-w-3xl text-lg leading-relaxed">{text}</p>
      ),
    },
    Button: {
      fields: {
        label: { type: "text" },
        href: { type: "text" },
      },
      defaultProps: { label: "Click me", href: "#" },
      render: ({ label, href }) => (
        <div className="px-6 py-2">
          <a
            href={href}
            className="inline-block rounded-full bg-black px-6 py-3 font-medium text-white"
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
      },
      defaultProps: { src: "", alt: "" },
      render: ({ src, alt }) =>
        src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="w-full object-cover" />
        ) : (
          <div
            className="flex h-48 items-center justify-center text-sm font-medium text-white/70"
            style={{ backgroundImage: GRADIENTS.ocean }}
          >
            Click to upload an image
          </div>
        ),
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
      render: ({ heading, subheading, theme, backgroundImage, buttonLabel, buttonHref }) => (
        <div
          className="flex flex-col items-center justify-center gap-4 bg-cover bg-center px-6 py-24 text-center text-white"
          style={heroBackground(theme, backgroundImage)}
        >
          <h1 className="max-w-3xl text-5xl font-bold tracking-tight">
            {heading}
          </h1>
          <p className="max-w-xl text-lg text-white/80">{subheading}</p>
          {buttonLabel ? (
            <a
              href={buttonHref}
              className="mt-4 inline-block rounded-full bg-white px-6 py-3 font-medium text-black"
            >
              {buttonLabel}
            </a>
          ) : null}
        </div>
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
            height === "sm" ? "h-6" : height === "lg" ? "h-24" : "h-12"
          }
        />
      ),
    },
  },
};
