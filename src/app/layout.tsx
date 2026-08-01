import type { Metadata } from "next";
import {
  Outfit,
  Work_Sans,
  Space_Grotesk,
  DM_Sans,
  Baloo_2,
  Nunito,
  Cormorant_Garamond,
  Inter,
} from "next/font/google";
import "./globals.css";

/**
 * Typefaces available to site themes (see src/lib/themes.ts).
 *
 * Loaded through next/font rather than a CSS @import: self-hosted, no
 * render-blocking request to Google, no layout shift. Only the default pair
 * is preloaded — the alternates are fetched when a theme actually references
 * them, so a site pays for the two faces it uses rather than all four.
 */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  preload: false,
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  preload: false,
});

// Rounded, friendly pair used by the catering theme.
const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  preload: false,
});

// Serif display over a neutral grotesque — the luxury fashion pairing.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  preload: false,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  preload: false,
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  preload: false,
});

// Deliberately neutral: this layout is also the shell for published tenant
// sites, so the default that shows through on any page without its own
// metadata (a 404, say) must not brand a customer's domain with ours. The
// builder app sets its own title in `(platform)/layout.tsx`.
export const metadata: Metadata = {
  title: "Website",
};

const fontVariables = [
  outfit.variable,
  workSans.variable,
  spaceGrotesk.variable,
  dmSans.variable,
  baloo.variable,
  nunito.variable,
  cormorant.variable,
  inter.variable,
].join(" ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      {/* Browser extensions (Grammarly and friends) inject attributes onto
          <body> before React hydrates, which reads as a mismatch. Suppressing
          here covers only this element's attributes, not its subtree. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
