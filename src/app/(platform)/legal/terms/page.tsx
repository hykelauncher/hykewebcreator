import Link from "next/link";
import { H2, LegalTitle, NeedsReview, P, UL } from "@/components/legal-prose";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <>
      <LegalTitle updated="1 August 2026">Terms of use</LegalTitle>

      <NeedsReview>
        A working draft that matches how the product actually behaves. Before
        you take real users, have a lawyer check it, and fill in the legal
        entity, its address, and the governing law.
      </NeedsReview>

      <H2>The short version</H2>
      <UL>
        <li>Hyke is free while in beta, and may not always be</li>
        <li>Your content is yours; you are responsible for it</li>
        <li>
          Follow the{" "}
          <Link
            href="/legal/acceptable-use"
            className="text-blue-300 underline underline-offset-4"
          >
            acceptable use policy
          </Link>{" "}
          or we take the site down
        </li>
        <li>We keep an audit trail of who published what</li>
        <li>No uptime guarantee, and no liability for lost business</li>
      </UL>

      <H2>Your account</H2>
      <P>
        You need an account to build a site, you must give accurate details, and
        you are responsible for what happens under it. Tell us if you think
        someone else has access.
      </P>

      <H2>Your content</H2>
      <P>
        You keep ownership of everything you upload and write. You give us
        permission to store it, and to serve it to the public on the address you
        publish it to — which is what hosting is. That permission ends when you
        delete the content, apart from backups that age out on their own
        schedule.
      </P>

      <H2>Availability</H2>
      <P>
        Hyke is provided as it is. We try to keep it up and we do not promise
        to. There is no service level, no guaranteed uptime and no compensation
        for downtime, lost sales or lost data. Keep your own copy of anything
        you could not bear to lose.
      </P>

      <H2>Free while in beta</H2>
      <P>
        There is no charge today. There may be in future, and if there is we
        will say so before it applies to you, and you will be able to export or
        delete your work rather than pay.
      </P>

      <H2>Suspension</H2>
      <P>
        We can take a site offline or close an account that breaks the
        acceptable use policy, puts other people at risk, or is used to
        defraud. Where money is at risk we will act first and explain after.
      </P>

      <H2>Liability</H2>
      <P>
        Nothing here limits liability for death or personal injury caused by
        negligence, or for fraud. Beyond that, we are not liable for indirect
        or consequential loss, lost profit, lost goodwill or lost data.
      </P>

      <NeedsReview>
        Liability caps, governing law and jurisdiction, and how you notify
        people of changes all need proper drafting — this section in particular
        is where a template will let you down.
      </NeedsReview>
    </>
  );
}
