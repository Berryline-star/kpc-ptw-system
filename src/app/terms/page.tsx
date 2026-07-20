import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { LegalSection, LegalList, Placeholder } from "@/components/legal/legal-section";

export const metadata: Metadata = {
  title: "Terms of Service | KPC Digital PtW",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="19 July 2026">
      <LegalSection title="1. Acceptance">
        <p>
          By creating an account or using the KPC Digital
          Permit-to-Work system (&ldquo;the System&rdquo;), you agree to
          these terms. If you&rsquo;re using the System on behalf of a
          contracting company, you&rsquo;re confirming you have
          authority to accept these terms for that company.
        </p>
      </LegalSection>

      <LegalSection title="2. What the System is for">
        <p>
          The System manages permit-to-work requests, safety risk
          assessments, and approval workflows for work performed on KPC
          infrastructure. It is a safety-critical tool — permits
          represent authorization to perform physical work, and the
          accuracy of what you submit directly affects worker safety.
        </p>
      </LegalSection>

      <LegalSection title="3. Accounts">
        <LegalList
          items={[
            "You're responsible for keeping your password confidential and for all activity under your account.",
            "New self-registered accounts are reviewed and approved by a System Admin before they can sign in — this isn't a bug, it's deliberate.",
            "Accounts lock temporarily after repeated failed sign-in attempts, as a security measure, not a penalty.",
            "You must provide accurate information when registering or when submitting a permit. Submitting false information about a work permit — location, hazards, or personnel involved — may result in account suspension and, given the safety-critical nature of this system, could constitute a serious workplace safety violation independent of these terms.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Roles and permissions">
        <p>
          Your access is determined by the role assigned to your account
          (e.g. Contractor, Supervisor, Safety Officer, Depot Manager,
          System Admin). What each role can view, create, approve, or
          delete is governed by the Role &amp; Permissions matrix, which
          KPC administrators may change at any time.
        </p>
      </LegalSection>

      <LegalSection title="5. The demo account">
        <p>
          A shared public demo account is available for evaluating the
          System without registering. Its data is visible to everyone
          who uses the demo, is not private, and may be reset or altered
          without notice. The demo account cannot submit real permits —
          this is enforced by the System itself, not just requested of
          you.
        </p>
      </LegalSection>

      <LegalSection title="6. Acceptable use">
        <p>You agree not to:</p>
        <LegalList
          items={[
            "Attempt to access accounts, permits, or data you're not authorized to view",
            "Attempt to circumvent rate limits, account lockouts, or file upload restrictions",
            "Upload files that misrepresent their actual content or contain malicious code",
            "Use the System to submit fraudulent or knowingly inaccurate safety information",
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Intellectual property">
        <p>
          The System&rsquo;s software, design, and branding belong to{" "}
          <Placeholder>Kenya Pipeline Company Limited</Placeholder>.
          Data you submit (permit details, attachments) remains
          associated with your account and KPC&rsquo;s operational records as
          described in our{" "}
          <a href="/privacy" className="text-primary underline">
            Privacy Policy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="8. Availability and warranties">
        <p>
          The System is provided &ldquo;as is.&rdquo; We aim for high
          availability but don&rsquo;t guarantee uninterrupted access.{" "}
          <strong className="text-on-surface">
            The System is a workflow and record-keeping tool — it does
            not replace, and is not a substitute for, on-site safety
            judgment, physical safety inspections, or compliance with
            applicable occupational safety regulations.
          </strong>{" "}
          Approval within the System does not itself certify that work
          is safe to perform; it certifies that the required approval
          workflow was followed.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitation of liability">
        <p>
          <Placeholder>
            Standard limitation-of-liability language — have counsel
            draft this section specifically; liability terms for a
            safety-critical industrial system need to be reviewed
            against KPC&rsquo;s actual insurance and risk-management
            framework, not generic boilerplate.
          </Placeholder>
        </p>
      </LegalSection>

      <LegalSection title="10. Termination">
        <p>
          We may suspend or terminate an account that violates these
          terms, provides false safety information, or poses a security
          risk to the System.
        </p>
      </LegalSection>

      <LegalSection title="11. Governing law">
        <p>
          These terms are governed by the laws of the Republic of Kenya.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes">
        <p>
          We&rsquo;ll update the &ldquo;Last updated&rdquo; date above
          when these terms change, and notify active users of material
          changes.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>
          Questions about these terms: <Placeholder>contact</Placeholder>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
