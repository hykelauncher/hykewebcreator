import Link from "next/link";
import { H2, LegalTitle, P, UL } from "@/components/legal-prose";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <LegalTitle>About Hyke</LegalTitle>

      <P>
        Hyke is a website builder. You pick a design that already looks
        finished, change the words and pictures, and publish it to your own
        address. No code, no hosting to arrange, no build step.
      </P>

      <H2>Who it&apos;s for</H2>
      <P>
        Small businesses and independent people who need a site that looks
        credible and can take an enquiry — caterers, studios, shops,
        freelancers. The kind of site that used to mean paying someone a few
        hundred pounds and waiting a fortnight.
      </P>

      <H2>What it does today</H2>
      <UL>
        <li>Nine templates across six visual themes, previewable before you choose</li>
        <li>A drag-and-drop editor with drafts, so nothing goes live by accident</li>
        <li>A free address the moment you publish, and custom domains once verified</li>
        <li>Contact forms with attachments, and a shopping bag that sends orders to you</li>
        <li>Plugins for WhatsApp, calls, socials, announcements and analytics</li>
        <li>Version history, so a bad edit is never permanent</li>
      </UL>

      <H2>What it doesn&apos;t do yet</H2>
      <P>
        No card payments — the shopping bag sends you the order and you take
        payment however you already do. No email notifications yet either, so
        enquiries wait in your dashboard until you look. Both are being worked
        on, and being straight about the gaps seems better than discovering them
        after you have built something.
      </P>

      <H2>Free while in beta</H2>
      <P>
        There is no charge and no card required. If that changes we will say so
        first, and you will be able to take your work elsewhere rather than pay.
      </P>

      <H2>Getting started</H2>
      <P>
        <Link
          href="/legal/how-it-works"
          className="text-blue-300 underline underline-offset-4"
        >
          How to use Hyke
        </Link>{" "}
        walks through building and publishing a site.
      </P>
    </>
  );
}
