const BENEFITS = [
  {
    icon: "check",
    title: "Reduced Paperwork",
    description:
      "Eliminate physical filing and manual routing. Digital trails save thousands of hours annually.",
  },
  {
    icon: "bolt",
    title: "Faster Approvals",
    description:
      "Mobile-first interface allows safety officers to review and approve from the field instantly.",
  },
  {
    icon: "security",
    title: "Improved Safety Compliance",
    description:
      "Strict logic-based workflows prevent work starting without all safety protocols in place.",
  },
  {
    icon: "history",
    title: "Audit Trail Tracking",
    description:
      "100% transparent history of every action, comment, and approval for compliance audits.",
  },
];

const BENTO_TILES = [
  { icon: "fact_check", label: "Contractor Management", style: "light" as const },
  { icon: "engineering", label: "On-Site Safety", style: "secondary" as const },
  { icon: "analytics", label: "HSE Insights", style: "primary" as const },
  { icon: "cloud_done", label: "ISO Compliance", style: "light" as const },
];

const tileStyles: Record<(typeof BENTO_TILES)[number]["style"], string> = {
  light: "bg-white text-on-surface-variant",
  secondary: "bg-secondary text-white",
  primary: "bg-primary text-white",
};

const tileIconStyles: Record<(typeof BENTO_TILES)[number]["style"], string> = {
  light: "text-primary",
  secondary: "",
  primary: "",
};

export function BenefitsSection() {
  return (
    <section id="benefits" className="scroll-mt-20 bg-surface-container-low py-stack-lg">
      <div className="mx-auto max-w-screen-max px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-col items-center gap-stack-lg lg:flex-row">
          <div className="lg:w-1/2">
            <h2 className="mb-stack-md text-headline-lg text-primary">
              Strategic Benefits
            </h2>
            <div className="space-y-gutter">
              {BENEFITS.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-white">
                    <span className="material-symbols-outlined">
                      {benefit.icon}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-headline-sm text-on-surface">
                      {benefit.title}
                    </h4>
                    <p className="text-body-md text-on-surface-variant">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-stack-md lg:w-1/2">
            {BENTO_TILES.map((tile) => (
              <div
                key={tile.label}
                className={`flex h-48 flex-col justify-end border border-outline-variant p-stack-md ${tileStyles[tile.style]}`}
              >
                <span
                  className={`material-symbols-outlined mb-2 ${tileIconStyles[tile.style]}`}
                >
                  {tile.icon}
                </span>
                <div className="text-label-md">{tile.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
