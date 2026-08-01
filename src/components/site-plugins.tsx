import Script from "next/script";
import { readPluginConfig } from "@/lib/plugins";
import { CartDrawer } from "@/components/cart-drawer";
import { ReportSite } from "@/components/report-site";

/**
 * Renders a published site's enabled plugins.
 *
 * Mounted once by the render route, outside the page content, so it applies to
 * every page without the owner having to place anything. Every config value is
 * re-validated by `readPluginConfig` before it reaches the DOM.
 */

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

/**
 * The announcement bar sits above everything, so it renders separately from
 * the rest — those hang off the bottom of the page.
 */
export function SiteAnnouncement({ plugins }: { plugins: unknown }) {
  const announcement = readPluginConfig(plugins, "announcement");
  if (!announcement) return null;

  return (
    <div className="bg-foreground px-6 py-2.5 text-center text-sm text-background">
      <span>{announcement.message}</span>
      {announcement.linkLabel && announcement.linkHref ? (
        <a
          href={announcement.linkHref}
          className="ml-3 font-semibold underline underline-offset-4"
        >
          {announcement.linkLabel}
        </a>
      ) : null}
    </div>
  );
}

export function SitePlugins({ plugins }: { plugins: unknown }) {
  const whatsapp = readPluginConfig(plugins, "whatsapp");
  const call = readPluginConfig(plugins, "call");
  const social = readPluginConfig(plugins, "social");
  const analytics = readPluginConfig(plugins, "analytics");

  const shop = readPluginConfig(plugins, "shop");

  const socialLinks = social
    ? Object.entries(social).filter(([, url]) => Boolean(url))
    : [];

  const whatsappUrl = whatsapp
    ? `https://wa.me/${whatsapp.phone}${
        whatsapp.message ? `?text=${encodeURIComponent(whatsapp.message)}` : ""
      }`
    : null;

  return (
    <>
      {socialLinks.length > 0 ? (
        <div className="border-t border-line px-6 py-8">
          <ul className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {socialLinks.map(([key, url]) => (
              <li key={key}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm font-medium text-muted underline decoration-line underline-offset-4 transition hover:text-foreground"
                >
                  {SOCIAL_LABELS[key] ?? key}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Floating actions, stacked so two enabled plugins don't overlap. */}
      {whatsapp || call ? (
        <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 print:hidden">
          {call ? (
            <a
              href={`tel:${call.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 rounded-pill bg-foreground px-4 py-3 font-semibold text-background shadow-lifted transition duration-200 hover:-translate-y-0.5"
              aria-label={call.label || `Call ${call.phone}`}
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2Z" />
              </svg>
              {call.label ? (
                <span className="hidden sm:inline">{call.label}</span>
              ) : null}
            </a>
          ) : null}

          {whatsapp ? (
            <a
              href={`https://wa.me/${whatsapp.phone}${
                whatsapp.message
                  ? `?text=${encodeURIComponent(whatsapp.message)}`
                  : ""
              }`}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2 rounded-pill bg-[#25d366] px-4 py-3 font-semibold text-[#0b3d24] shadow-lifted transition duration-200 hover:-translate-y-0.5"
              aria-label={whatsapp.label || "Chat on WhatsApp"}
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5c.1-.1.1-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3a3 3 0 0 0-1 2.3c0 1.3 1 2.6 1.1 2.8a10.4 10.4 0 0 0 4 3.5c1.4.6 2 .6 2.7.5.4 0 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.5-.2Z" />
              </svg>
              {whatsapp.label ? (
                <span className="hidden sm:inline">{whatsapp.label}</span>
              ) : null}
            </a>
          ) : null}
        </div>
      ) : null}

      {/* Not optional: a site that could hide the report link is exactly the
          site that would. */}
      <ReportSite platformName="Hyke" />

      {shop ? (
        <CartDrawer
          currency={shop.currency}
          method={shop.method as "message" | "whatsapp" | "both"}
          whatsappUrl={whatsappUrl}
          note={shop.note}
        />
      ) : null}

      {analytics?.provider === "plausible" ? (
        <Script
          defer
          data-domain={analytics.id}
          src="https://plausible.io/js/script.js"
        />
      ) : null}

      {analytics?.provider === "ga4" ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${analytics.id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${analytics.id}');`}
          </Script>
        </>
      ) : null}
    </>
  );
}
