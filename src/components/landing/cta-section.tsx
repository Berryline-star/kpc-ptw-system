import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="border-y border-outline-variant bg-surface py-stack-lg">
      <div className="mx-auto max-w-screen-max px-margin-mobile text-center md:px-margin-desktop">
        <h2 className="mb-stack-md text-headline-lg text-primary">
          Ready to Secure Your Work Site?
        </h2>
        <p className="mx-auto mb-stack-lg max-w-2xl text-body-lg text-on-surface-variant">
          Join hundreds of teams ensuring industrial safety excellence with
          KPC&rsquo;s Digital PtW.
        </p>
        <div className="flex flex-wrap justify-center gap-stack-md">
          <Button href="/register" variant="primary" size="lg">
            Start Registration
          </Button>
          <Button href="/demo" variant="secondary" size="lg">
            Request Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
