import Image from "next/image";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-surface-container-lowest">
      <div className="mx-auto grid w-full max-w-screen-max grid-cols-1 items-center gap-gutter px-margin-mobile py-stack-lg md:px-margin-desktop lg:grid-cols-2">
        <div className="z-10">
          <div className="mb-stack-md inline-flex items-center gap-2 rounded-full bg-secondary-container/10 px-stack-md py-1">
            <span className="material-symbols-outlined text-body-sm text-secondary">
              verified_user
            </span>
            <span className="text-label-sm uppercase tracking-wider text-secondary">
              Industrial Safety Standard v2.0
            </span>
          </div>

          <h1 className="mb-stack-md text-headline-lg-mobile leading-tight text-primary md:text-display-lg">
            Digital Permit-to-Work
            <br />
            Management System
          </h1>

          <p className="mb-stack-lg max-w-xl text-body-lg text-on-surface-variant">
            Enhancing safety, compliance, and operational efficiency through
            digital permit management for Kenya&rsquo;s energy infrastructure.
          </p>

          <div className="flex flex-wrap gap-stack-md">
            <Button href="/permits/new" variant="primary" size="lg">
              Request Permit
              <span className="material-symbols-outlined">arrow_forward</span>
            </Button>
            <Button href="/dashboard" variant="outline" size="lg">
              View Dashboard
            </Button>
          </div>
        </div>

        <div className="relative flex items-center justify-center lg:h-[600px]">
          <div className="absolute -z-0 h-[120%] w-[120%] rounded-full bg-primary/5 blur-3xl" />
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBC81lbJHtxo_esA1X4O_Z3k-7d8QXzSY-2zuZMruA1OgQ-I9N3-T3aEsAqYVjHjH-2-gYrmvSXtJ8KV3Ex0U6WAaNOQ_P4Z_EXs-h8hlAuROL1hFiWF130Ikp_x8rc-wP1leWyOwp2ujj-lAZTmJxdR3pd4p2KzZJ0Uwevrc1GOM6o80GgbiO4jMpq-mFkd4QWBe0fA-lhjmxf38xBlGUEdcQeTszPtsLb1E4qmPMscts3ZZdu-Sex2WiozZAPI6ofxhmjt99Gq0Q"
            alt="KPC engineers reviewing a digital permit-to-work workflow on-site"
            width={800}
            height={600}
            priority
            className="relative z-10 h-auto w-full rounded-xl object-contain"
          />
        </div>
      </div>
    </section>
  );
}
