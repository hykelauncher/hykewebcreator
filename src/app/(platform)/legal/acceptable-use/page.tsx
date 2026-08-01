import Link from "next/link";
import { H2, LegalTitle, NeedsReview, P, UL } from "@/components/legal-prose";

export const metadata = { title: "Acceptable use" };

/**
 * The rules that make enforcement possible.
 *
 * Kept short and specific on purpose: a policy nobody reads is a policy you
 * cannot point to when you take a site down.
 */
export default function AcceptableUsePage() {
  return (
    <>
      <LegalTitle updated="1 August 2026">Acceptable use</LegalTitle>

      <P>
        Hyke is free to use and easy to publish with. That combination attracts
        people building things they shouldn&apos;t, so these rules are short,
        specific, and enforced.
      </P>

      <H2>You may not use Hyke to</H2>
      <UL>
        <li>
          Defraud anyone — fake shops, fake investment schemes, advance-fee
          scams, or collecting payments for goods and services you have no
          intention of providing
        </li>
        <li>
          Impersonate a person, business, bank or public body, or imply an
          endorsement you do not have
        </li>
        <li>
          Phish — collecting passwords, card numbers, one-time codes or
          identity documents by pretending to be someone else
        </li>
        <li>Sell what you may not lawfully sell, including counterfeits</li>
        <li>Publish content that is illegal, or that sexualises children</li>
        <li>Harass a person or incite violence against anyone</li>
        <li>
          Publish malware, or use a site to attack other systems
        </li>
        <li>Send bulk unsolicited messages using contacts collected here</li>
      </UL>

      <H2>You are responsible for your site</H2>
      <P>
        Everything published on a site you create is yours: the words, the
        images, the claims, the prices and the promises. You are responsible for
        having the right to use the content you upload, for the accuracy of what
        you say, and for meeting the obligations that come with what you do —
        consumer rights, refunds, data protection, licensing, tax.
      </P>
      <P>
        If you take enquiries or orders through your site, the people who
        contact you are your customers, not ours. Their information is yours to
        look after.
      </P>

      <H2>What happens when a site breaks these rules</H2>
      <UL>
        <li>
          <strong>We take it offline.</strong> Usually first, and usually
          without warning where there is a risk of someone losing money.
        </li>
        <li>
          <strong>We keep the record.</strong> Who created it, when, from which
          address, and what was published.
        </li>
        <li>
          <strong>We may report it.</strong> Where there is evidence of a crime
          we will co-operate with the police, a bank, or the relevant regulator,
          and provide what they lawfully ask for.
        </li>
        <li>
          <strong>We may close the account</strong> and any other sites on it.
        </li>
      </UL>
      <P>
        Taking a site offline is reversible and we will tell you why. If we got
        it wrong, say so and we will look again.
      </P>

      <H2>Reporting a site</H2>
      <P>
        Every published site carries a report link in its footer. You do not
        need an account, and the owner is never told who reported them. You can
        also{" "}
        <Link
          href="/legal/report"
          className="text-blue-300 underline underline-offset-4"
        >
          report a site here
        </Link>
        .
      </P>

      <NeedsReview>
        Sanctions, takedown procedure and any appeal route should be checked
        against the consumer and platform obligations that apply where you
        operate — the UK Online Safety Act in particular has duties that scale
        with how big the service gets.
      </NeedsReview>
    </>
  );
}
