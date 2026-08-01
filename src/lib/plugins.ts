/**
 * Site plugins — add-ons that apply to a whole site rather than to one page.
 *
 * A block lives inside page content; a plugin is configured once in site
 * settings and renders on every page. That's the right shape for a floating
 * WhatsApp button or an analytics snippet, which shouldn't have to be dragged
 * onto each page individually and can't be, since content is per page.
 *
 * Config is stored as jsonb on `sites.plugins`, keyed by plugin id. Nothing
 * trusts that column's shape: every value is re-validated on save and again
 * before render, because some of these end up in a script tag.
 */

export type PluginFieldType = "text" | "tel" | "textarea" | "select";

export type PluginField = {
  name: string;
  label: string;
  type: PluginFieldType;
  placeholder?: string;
  help?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
};

export type PluginDefinition = {
  id: string;
  name: string;
  description: string;
  fields: PluginField[];
  /** Validates and normalises submitted config. Returns null to reject. */
  parse: (input: Record<string, string>) => Record<string, string> | null;
};

export type PluginConfig = {
  enabled?: boolean;
} & Record<string, string | boolean | undefined>;

export type SitePlugins = Record<string, PluginConfig>;

/** Digits only, so it can be dropped straight into a wa.me link. */
export function normalisePhone(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

export const PLUGINS: PluginDefinition[] = [
  {
    id: "whatsapp",
    name: "WhatsApp button",
    description:
      "A floating button that opens a WhatsApp chat with you, with a message already written.",
    fields: [
      {
        name: "phone",
        label: "WhatsApp number",
        type: "tel",
        placeholder: "+44 7700 900123",
        help: "Include the country code. Spaces and brackets are fine.",
        required: true,
      },
      {
        name: "message",
        label: "Pre-filled message",
        type: "textarea",
        placeholder: "Hi! I'd like to ask about…",
      },
      {
        name: "label",
        label: "Button label",
        type: "text",
        placeholder: "Chat with us",
        help: "Hidden on small screens, where only the icon shows.",
      },
    ],
    parse: (input) => {
      const phone = normalisePhone(input.phone ?? "");
      // Shortest plausible international number is ~8 digits.
      if (phone.length < 8 || phone.length > 15) return null;
      return {
        phone,
        message: (input.message ?? "").slice(0, 300),
        label: (input.label ?? "").slice(0, 40),
      };
    },
  },
  {
    id: "call",
    name: "Call button",
    description:
      "A floating call button. Useful on phones, where most visitors would rather ring than type.",
    fields: [
      {
        name: "phone",
        label: "Phone number",
        type: "tel",
        placeholder: "+44 20 7946 0000",
        required: true,
      },
      {
        name: "label",
        label: "Button label",
        type: "text",
        placeholder: "Call us",
      },
    ],
    parse: (input) => {
      const phone = (input.phone ?? "").trim();
      if (!/^[\d\s()+-]{7,24}$/.test(phone)) return null;
      return { phone, label: (input.label ?? "").slice(0, 40) };
    },
  },
  {
    id: "announcement",
    name: "Announcement bar",
    description:
      "A strip across the top of every page — delivery terms, a sale, opening hours.",
    fields: [
      {
        name: "message",
        label: "Message",
        type: "text",
        placeholder: "Free UK delivery on orders over £150",
        required: true,
      },
      { name: "linkLabel", label: "Link text (optional)", type: "text" },
      {
        name: "linkHref",
        label: "Link URL (optional)",
        type: "text",
        placeholder: "/shop",
      },
    ],
    parse: (input) => {
      const message = (input.message ?? "").trim().slice(0, 160);
      if (!message) return null;
      const linkHref = (input.linkHref ?? "").trim();
      // Same-site paths or http(s) only, so the bar can't carry a
      // javascript: URL onto every page of a site.
      if (linkHref && !/^(https?:\/\/[^\s"'<>]+|\/[^\s"'<>]*)$/i.test(linkHref)) {
        return null;
      }
      return {
        message,
        linkLabel: (input.linkLabel ?? "").trim().slice(0, 60),
        linkHref: linkHref.slice(0, 300),
      };
    },
  },
  {
    id: "shop",
    name: "Shopping bag",
    description:
      "Adds a bag to product cards. Orders are sent to you as a message or on WhatsApp — no card payments, nothing charged on the site.",
    fields: [
      {
        name: "currency",
        label: "Currency symbol",
        type: "text",
        placeholder: "£",
        required: true,
      },
      {
        name: "method",
        label: "How orders reach you",
        type: "select",
        options: [
          { label: "Message and WhatsApp", value: "both" },
          { label: "Message to my dashboard", value: "message" },
          { label: "WhatsApp only", value: "whatsapp" },
        ],
        help: "WhatsApp options need the WhatsApp plugin turned on as well.",
      },
      {
        name: "note",
        label: "Note shown in the bag",
        type: "textarea",
        placeholder:
          "Send your order and we'll confirm availability and payment.",
      },
    ],
    parse: (input) => {
      const currency = (input.currency ?? "£").trim().slice(0, 3);
      if (!currency) return null;
      const method = ["both", "message", "whatsapp"].includes(input.method ?? "")
        ? (input.method as string)
        : "both";
      return { currency, method, note: (input.note ?? "").slice(0, 240) };
    },
  },
  {
    id: "social",
    name: "Social links",
    description:
      "A row of links to your profiles, shown at the foot of every page.",
    fields: [
      { name: "instagram", label: "Instagram URL", type: "text" },
      { name: "facebook", label: "Facebook URL", type: "text" },
      { name: "x", label: "X / Twitter URL", type: "text" },
      { name: "tiktok", label: "TikTok URL", type: "text" },
      { name: "linkedin", label: "LinkedIn URL", type: "text" },
    ],
    parse: (input) => {
      const out: Record<string, string> = {};
      for (const key of ["instagram", "facebook", "x", "tiktok", "linkedin"]) {
        const value = (input[key] ?? "").trim();
        if (!value) continue;
        // Only http(s), so a link can't become a javascript: URL.
        if (!/^https?:\/\/[^\s"'<>]+$/i.test(value)) return null;
        out[key] = value.slice(0, 300);
      }
      return Object.keys(out).length > 0 ? out : null;
    },
  },
  {
    id: "analytics",
    name: "Analytics",
    description:
      "Count visitors with Plausible or Google Analytics. Check your local rules on consent before turning this on.",
    fields: [
      {
        name: "provider",
        label: "Provider",
        type: "select",
        options: [
          { label: "Plausible", value: "plausible" },
          { label: "Google Analytics 4", value: "ga4" },
        ],
      },
      {
        name: "id",
        label: "Site domain (Plausible) or Measurement ID (GA4)",
        type: "text",
        placeholder: "example.com  ·  G-XXXXXXXXXX",
        required: true,
      },
    ],
    parse: (input) => {
      const provider = input.provider === "ga4" ? "ga4" : "plausible";
      const id = (input.id ?? "").trim();
      // These values are interpolated into a script tag, so they are matched
      // against a strict pattern rather than merely escaped.
      const ok =
        provider === "ga4"
          ? /^G-[A-Z0-9]{4,20}$/.test(id)
          : /^[a-z0-9.-]{3,253}$/i.test(id);
      return ok ? { provider, id } : null;
    },
  },
];

export function getPlugin(id: string): PluginDefinition | undefined {
  return PLUGINS.find((p) => p.id === id);
}

/**
 * Re-validates stored config at render time. A column edited by hand, or by an
 * older version of this file, shouldn't be able to put anything unchecked into
 * a page.
 */
export function readPluginConfig(
  plugins: unknown,
  id: string,
): Record<string, string> | null {
  if (typeof plugins !== "object" || plugins === null) return null;
  const raw = (plugins as Record<string, unknown>)[id];
  if (typeof raw !== "object" || raw === null) return null;

  const record = raw as Record<string, unknown>;
  if (record.enabled !== true) return null;

  const definition = getPlugin(id);
  if (!definition) return null;

  const input: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string") input[key] = value;
  }
  return definition.parse(input);
}
