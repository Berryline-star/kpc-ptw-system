/**
 * Temporary placeholder — verifies the KPC design tokens (colors, type
 * scale, spacing, radius) are wired up correctly end to end. This gets
 * replaced by the real landing page in a later phase.
 */
export default function Home() {
  return (
    <main className="flex-1 bg-background p-margin-mobile md:p-margin-desktop">
      <div className="mx-auto max-w-screen-max space-y-stack-lg">
        <header className="space-y-stack-sm">
          <p className="text-label-md uppercase text-on-surface-variant">
            Industrial Integrity System
          </p>
          <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary">
            KPC PTW — Design Token Check
          </h1>
          <p className="text-body-md text-on-surface-variant">
            If colors, type, spacing, and radius below look right, Phase 0 is
            solid.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-stack-md md:grid-cols-4">
          {[
            { swatch: "h-16 bg-primary", token: "primary", label: "KPC Blue" },
            {
              swatch: "h-16 bg-secondary-container",
              token: "secondary-container",
              label: "Safety Orange",
            },
            { swatch: "h-16 bg-error", token: "error", label: "Error" },
            {
              swatch: "h-16 bg-surface-container-high",
              token: "surface-container-high",
              label: "Industrial Gray",
            },
          ].map(({ swatch, token, label }) => (
            <div
              key={token}
              className="rounded-lg border border-outline-variant overflow-hidden bg-surface-container-lowest"
            >
              <div className={swatch} />
              <p className="p-stack-sm text-label-sm text-on-surface-variant">
                {label}
                <br />
                <code>{token}</code>
              </p>
            </div>
          ))}
        </section>

        <section className="flex flex-wrap items-center gap-stack-md">
          <span className="rounded-full bg-green-100 px-stack-md py-1 text-label-sm font-semibold text-green-800">
            Approved (pill)
          </span>
          <button className="rounded-lg bg-primary px-stack-lg py-3 text-label-lg text-on-primary">
            Primary Action
          </button>
          <button className="rounded-lg bg-secondary-container px-stack-lg py-3 text-label-lg text-on-secondary-container">
            <span className="material-symbols-outlined align-middle mr-1 text-[18px]">
              warning
            </span>
            Critical Hazard
          </button>
        </section>

        <a
          href="/login"
          className="inline-flex items-center gap-2 text-label-lg text-primary hover:underline"
        >
          Go to Login
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </a>
      </div>
    </main>
  );
}
