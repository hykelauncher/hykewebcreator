import { H2, LegalTitle, NeedsReview, P, UL } from "@/components/legal-prose";

export const metadata = { title: "Privacy" };

/**
 * Written to describe what the code actually does, rather than as a generic
 * template. If a data flow changes, this page changes with it — a privacy
 * notice that doesn't match the system is worse than none, because it is a
 * statement you can be held to.
 */
export default function PrivacyPage() {
  return (
    <>
      <LegalTitle updated="1 August 2026">Privacy</LegalTitle>

      <NeedsReview>
        This describes what Hyke genuinely does with data today, which is the
        hard part — but it is not legal advice. Before you take real users you
        need to name the legal entity acting as data controller, give a contact
        address, confirm your lawful bases, and check whether you must register
        with the ICO (most UK organisations processing personal data must, for
        a small annual fee).
      </NeedsReview>

      <H2>Two different roles</H2>
      <P>
        This matters more than anything else here. Hyke plays two roles, and
        they carry different responsibilities.
      </P>
      <UL>
        <li>
          <strong>For people who build sites</strong> — Hyke is the controller.
          We decide what account data to hold and why.
        </li>
        <li>
          <strong>For visitors to a site somebody built</strong> — the person
          who built it is the controller, and Hyke only processes on their
          behalf. If you filled in a form on someone&apos;s site, they hold
          that information and your questions go to them.
        </li>
      </UL>

      <H2>If you build sites here</H2>
      <P>We hold:</P>
      <UL>
        <li>
          <strong>Your account</strong> — handled by Clerk, our authentication
          provider. Email address, sign-in method, and the sessions and devices
          you are signed in on.
        </li>
        <li>
          <strong>What you build</strong> — sites, pages, drafts, published
          versions, uploaded images, theme and plugin settings.
        </li>
        <li>
          <strong>An audit trail of consequential actions</strong> — creating,
          publishing, unpublishing or deleting a site, and claiming or
          verifying a domain. Each entry records the account, the action, the
          time, the IP address it came from and the browser string.
        </li>
      </UL>
      <P>
        We keep the audit trail to investigate fraud and abuse, to answer a
        lawful request, and to work out what happened when something goes
        wrong. We do not track which pages you visit, we do not fingerprint
        your device, and we do not build a profile of you. The lawful basis is
        legitimate interests: running a hosting platform that cannot be used
        anonymously to defraud people.
      </P>

      <H2>If you visit a site built here</H2>
      <P>
        What a site collects is set by whoever built it. It may include a
        contact form, a newsletter signup, or an order sent by message. That
        information belongs to the site owner; we store it for them.
      </P>
      <P>
        If you report a site, we record the reason, anything you wrote, your
        IP address, and your email address if you chose to give one. The site
        owner is not told who reported them.
      </P>
      <P>
        Analytics only run on a site if its owner switched them on. That is
        their decision and their responsibility to disclose, including any
        consent their own users are owed.
      </P>

      <H2>Who else touches the data</H2>
      <UL>
        <li>Clerk — accounts and authentication</li>
        <li>Neon — the database</li>
        <li>Vercel — hosting, and Vercel Blob for uploaded files</li>
        <li>
          Plausible or Google, but only on a site whose owner enabled analytics
        </li>
      </UL>

      <H2>How long we keep things</H2>
      <UL>
        <li>Sites and their content: until you delete them or close your account</li>
        <li>Audit entries: 12 months</li>
        <li>
          Closed abuse reports, and any evidence kept alongside them: 24 months,
          since patterns matter for repeat offenders
        </li>
        <li>
          Open abuse reports: kept until they are closed. A report nobody has
          finished looking at is not deleted for reaching an age
        </li>
        <li>
          Enquiries and subscribers: until the site owner deletes them or
          deletes the site
        </li>
      </UL>
      <P>
        This is enforced, not just stated: a scheduled job runs daily and
        deletes whatever is past its window.
      </P>
      <NeedsReview>
        The periods themselves are sensible defaults rather than legal
        requirements — worth confirming against your obligations, particularly
        if you later handle payments.
      </NeedsReview>

      <H2>Your rights</H2>
      <P>
        Under UK GDPR you can ask for a copy of your data, ask for it to be
        corrected or deleted, and object to how it is used. Deleting a site
        removes its pages, drafts and uploaded images. Audit entries about that
        site survive deletion, because a record that can be erased by the
        person it concerns is not an audit trail.
      </P>
    </>
  );
}
