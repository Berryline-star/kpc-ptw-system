import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { LegalSection, LegalList, Placeholder } from "@/components/legal/legal-section";

export const metadata: Metadata = {
  title: "Privacy Policy | KPC Digital PtW",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="19 July 2026">
      <LegalSection title="1. Who this policy covers">
        <p>
          This policy applies to everyone who uses the KPC Digital
          Permit-to-Work system — employees, contractors, and any other
          personnel with an account. It explains what personal data the
          system collects, why, and what rights you have over it.
        </p>
      </LegalSection>

      <LegalSection title="2. Data controller">
        <p>
          <Placeholder>Kenya Pipeline Company Limited</Placeholder>,
          registered address <Placeholder>company registered address</Placeholder>,
          is the data controller for personal data processed through
          this system. Our Data Protection Officer can be reached at{" "}
          <Placeholder>dpo@kpc.co.ke or real contact</Placeholder>.
        </p>
      </LegalSection>

      <LegalSection title="3. What we collect">
        <p>Specifically, and only, the following:</p>
        <LegalList
          items={[
            "Account information: full name, email address, department/company, and assigned role.",
            "Permit records: permit type, location, work description, dates, hazard and risk assessment data, and any files you attach (e.g. method statements, contractor certifications).",
            "Approval and activity history: who approved, rejected, or commented on a permit, and when.",
            "Login security data: failed sign-in attempts and account lockout timestamps, kept only to protect your account from unauthorized access.",
            "Technical logs: IP address and timestamp on security-relevant actions (e.g. rate-limit and lockout enforcement), kept for abuse prevention.",
          ]}
        />
        <p>
          We do not collect payment information, biometric data, or use
          any third-party advertising or analytics trackers — there
          aren&rsquo;t any in this system.
        </p>
      </LegalSection>

      <LegalSection title="4. Why we process it">
        <p>
          Under Kenya&rsquo;s Data Protection Act, 2019, our basis for
          processing this data is:
        </p>
        <LegalList
          items={[
            "Legal obligation and legitimate interest — maintaining a safe worksite and an auditable permit-to-work record is a workplace safety requirement.",
            "Contractual necessity — for contractor personnel, to administer the permit and approval relationship with KPC.",
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Who we share it with">
        <p>
          Internally, only with KPC personnel whose role requires it — the
          system&rsquo;s Role &amp; Permissions matrix (Administration →
          Role &amp; Permissions) governs who can view what.
        </p>
        <p>Externally, only with the infrastructure providers that run this system, strictly to operate it:</p>
        <LegalList
          items={[
            "Neon (database hosting)",
            "Vercel (application hosting and file storage)",
            "Resend (transactional email — password resets and account invitations only)",
          ]}
        />
        <p>
          We do not sell personal data, and do not share it with any
          party for marketing purposes.
        </p>
      </LegalSection>

      <LegalSection title="6. How long we keep it">
        <p>
          Permit and approval records are retained for{" "}
          <Placeholder>retention period — align with KPC&rsquo;s
          regulatory record-keeping requirements</Placeholder>{" "}
          for safety-audit purposes. Account data is retained while your
          account is active and for{" "}
          <Placeholder>period, e.g. 12 months</Placeholder> after
          deactivation, then deleted or anonymized.
        </p>
      </LegalSection>

      <LegalSection title="7. Security">
        <p>Measures actually in place to protect your data:</p>
        <LegalList
          items={[
            "Passwords are hashed (bcrypt), never stored or logged in plain text.",
            "Accounts lock temporarily after repeated failed sign-in attempts.",
            "Access to every page and action is checked server-side, not just hidden in the interface.",
            "Uploaded files are validated against their actual content, not just their claimed file type.",
            "All traffic is encrypted in transit (HTTPS).",
          ]}
        />
      </LegalSection>

      <LegalSection title="8. Your rights">
        <p>Under the Data Protection Act, 2019, you can request to:</p>
        <LegalList
          items={[
            "Access the personal data we hold about you",
            "Correct inaccurate data (or update it yourself via your profile)",
            "Request deletion, where we're not required to retain it for safety-audit purposes",
            "Object to processing, or request your data in a portable format",
          ]}
        />
        <p>
          To exercise any of these, contact{" "}
          <Placeholder>DPO contact</Placeholder>. You can also lodge a
          complaint with the Office of the Data Protection Commissioner
          (ODPC) Kenya.
        </p>
      </LegalSection>

      <LegalSection title="9. Cookies">
        <p>
          This system uses a single session cookie to keep you signed in.
          No third-party cookies, ad-tracking, or cross-site analytics
          are used.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes to this policy">
        <p>
          We&rsquo;ll update the &ldquo;Last updated&rdquo; date above
          when this policy changes, and notify active users of material
          changes.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
