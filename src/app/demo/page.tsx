import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LaunchDemoForm } from "@/components/marketing/launch-demo-form";

export const metadata: Metadata = {
  title: "Request a Demo | KPC Digital PtW",
};

const DEMO_HIGHLIGHTS = [
  { icon: "dashboard", label: "Live operations dashboard" },
  { icon: "assignment_add", label: "Full 4-step permit request wizard" },
  { icon: "fact_check", label: "Approval workflow & risk assessment" },
  { icon: "qr_code_2", label: "QR permit verification" },
];

export default function DemoPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-[80vh] items-center pt-20">
        <div className="mx-auto max-w-screen-max px-margin-mobile py-stack-lg text-center md:px-margin-desktop">
          <div className="mx-auto mb-stack-md flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary">
            <span className="material-symbols-outlined text-[32px]">
              play_circle
            </span>
          </div>
          <p className="mb-stack-sm text-label-sm uppercase tracking-wider text-secondary">
            No sign-up required
          </p>
          <h1 className="mb-stack-md text-headline-lg-mobile text-primary md:text-headline-lg">
            See the Digital PtW System live
          </h1>
          <p className="mx-auto mb-stack-lg max-w-xl text-body-lg text-on-surface-variant">
            Jump straight into a working sandbox with real permits, real
            approval flows, and real safety data — no waiting for a
            callback.
          </p>

          <div className="mx-auto mb-stack-lg grid max-w-2xl grid-cols-2 gap-stack-md text-left md:grid-cols-4">
            {DEMO_HIGHLIGHTS.map((item) => (
              <div
                key={item.label}
                className="border border-outline-variant bg-white p-stack-md"
              >
                <span className="material-symbols-outlined mb-2 text-primary">
                  {item.icon}
                </span>
                <p className="text-label-sm text-on-surface-variant">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <LaunchDemoForm />

          <p className="mt-stack-md text-label-sm text-on-surface-variant opacity-70">
            This demo runs on a shared sandbox account — please don&rsquo;t
            enter real personal or operational data.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
