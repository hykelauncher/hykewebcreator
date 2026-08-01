import Link from "next/link";
import { H2, LegalTitle, P, UL } from "@/components/legal-prose";

export const metadata = { title: "How to use Hyke" };

export default function HowItWorksPage() {
  return (
    <>
      <LegalTitle>How to use Hyke</LegalTitle>

      <P>
        Start to finish is about ten minutes. The only step people get caught
        out by is publishing, so it is worth reading that bit.
      </P>

      <H2>1. Pick a template</H2>
      <P>
        From your dashboard, choose a template and open its preview. You will
        see the real design, every page, exactly as it will look. Photos in a
        preview are placeholders unless the template says otherwise.
      </P>

      <H2>2. Name your site</H2>
      <P>
        Your subdomain is your free address. It must be at least three
        characters, and a few names are reserved because the platform itself
        uses them.
      </P>

      <H2>3. Edit it</H2>
      <P>
        The editor opens on your home page. Drag blocks in from the left, click
        one to change its settings on the right. Edits save automatically as a
        draft — the header shows <em>Draft saved</em> — and visitors keep seeing
        the old version until you publish.
      </P>

      <H2>4. Publish</H2>
      <P>
        This is the step to get right. Publishing is <strong>per page</strong>:
        pressing Publish in the editor makes that one page live. A four-page
        template needs all four published, or the pages you skipped will
        404 from your own navigation.
      </P>
      <P>
        The quick way: site settings → <strong>Publish all</strong>. It puts
        every page that has content live at once, and skips empty ones.
      </P>

      <H2>5. Set up your plugins</H2>
      <UL>
        <li>
          <strong>WhatsApp</strong> — a floating button, and any call-to-action
          set to use WhatsApp will point at the same number
        </li>
        <li>
          <strong>Shopping bag</strong> — adds Add to bag to product cards.
          Orders arrive as a message in your dashboard or as a WhatsApp chat.
          Nothing is charged on the site
        </li>
        <li>
          <strong>Announcement bar</strong>, <strong>social links</strong>,{" "}
          <strong>analytics</strong> — switch on, fill in, save
        </li>
      </UL>

      <H2>6. Use your own domain</H2>
      <P>
        In site settings, save the domain, add the TXT record shown at your DNS
        provider, then press Verify. Nothing is served on the domain until it
        is verified, which stops anyone claiming a name that is not theirs. The
        final step — pointing the domain at the platform — is done by whoever
        manages the deployment.
      </P>

      <H2>Things worth knowing</H2>
      <UL>
        <li>
          <strong>Enquiries and orders</strong> land in site settings. There is
          no email alert yet, so check it
        </li>
        <li>
          <strong>Every publish is snapshotted.</strong> Version history restores
          an old version into your draft, so restoring is itself undoable
        </li>
        <li>
          <strong>Take offline</strong> hides a site without deleting anything.
          Deleting is permanent and removes uploaded images too
        </li>
        <li>
          <strong>You are responsible for what you publish</strong> — see{" "}
          <Link
            href="/legal/acceptable-use"
            className="text-blue-300 underline underline-offset-4"
          >
            acceptable use
          </Link>
        </li>
      </UL>
    </>
  );
}
