import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";

interface ComingSoonProps {
  icon: string;
  eyebrow: string;
  title: string;
  description: string;
}

export function ComingSoon({ icon, eyebrow, title, description }: ComingSoonProps) {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-[80vh] items-center pt-20">
        <div className="mx-auto max-w-screen-max px-margin-mobile py-stack-lg text-center md:px-margin-desktop">
          <div className="mx-auto mb-stack-md flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary">
            <span className="material-symbols-outlined text-[32px]">
              {icon}
            </span>
          </div>
          <p className="mb-stack-sm text-label-sm uppercase tracking-wider text-secondary">
            {eyebrow}
          </p>
          <h1 className="mb-stack-md text-headline-lg-mobile text-primary md:text-headline-lg">
            {title}
          </h1>
          <p className="mx-auto mb-stack-lg max-w-xl text-body-lg text-on-surface-variant">
            {description}
          </p>
          <div className="flex flex-wrap justify-center gap-stack-md">
            <Button href="/" variant="primary">
              Back to Home
            </Button>
            <Button href="mailto:hse-support@kpc.co.ke" variant="outline">
              Contact Safety Desk
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
