import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <>
      <SiteHeader />
      <main className="pt-20">
        <div className="mx-auto max-w-3xl px-margin-mobile py-stack-lg md:px-margin-desktop">
          <div className="mb-stack-lg flex items-start gap-3 border border-secondary/30 bg-secondary-container/10 p-stack-md">
            <span className="material-symbols-outlined text-secondary">
              gavel
            </span>
            <p className="text-body-sm text-on-surface-variant">
              <strong className="text-on-surface">
                Draft — needs legal review.
              </strong>{" "}
              This page is a structured starting point covering what the
              system actually does technically, not vetted legal advice.
              Have this reviewed by counsel familiar with Kenya&rsquo;s
              Data Protection Act, 2019 before treating it as your real
              policy. Every{" "}
              <code className="rounded bg-surface-container-high px-1 py-0.5 text-label-sm">
                [bracketed]
              </code>{" "}
              placeholder needs a real value filled in.
            </p>
          </div>

          <h1 className="mb-2 text-headline-lg text-primary">{title}</h1>
          <p className="mb-stack-lg text-label-sm text-on-surface-variant">
            Last updated: {lastUpdated}
          </p>

          <div className="space-y-stack-lg text-body-md text-on-surface-variant">
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
