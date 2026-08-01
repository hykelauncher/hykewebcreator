import { H2, LegalTitle, P, UL } from "@/components/legal-prose";

export const metadata = { title: "Report a site" };

export default function ReportPage() {
  return (
    <>
      <LegalTitle>Report a site</LegalTitle>

      <P>
        If a site built with Hyke is a scam, is pretending to be someone else,
        or is being used to take money it will not honour, tell us. You do not
        need an account, and the owner is never told who reported them.
      </P>

      <H2>The fastest way</H2>
      <P>
        Every published site has a <strong>Report this site</strong> link in its
        footer. Use that — it tells us exactly which site you mean, which
        matters more than anything you can write.
      </P>

      <H2>What happens next</H2>
      <UL>
        <li>Reports are read. Not all of them get a reply</li>
        <li>
          Sites that put people at risk of losing money are taken offline first
          and reviewed after
        </li>
        <li>
          We keep a record of who created the site, when, and from which
          address, and will provide it to the police, a bank or a regulator
          where they lawfully ask
        </li>
      </UL>

      <H2>If you have lost money</H2>
      <P>
        Report it to us, and also to your bank and to the police. In the UK
        that is Action Fraud. We can take a site down and preserve what we
        hold, but we cannot recover a payment — your bank can sometimes act
        quickly if you tell them straight away.
      </P>
    </>
  );
}
