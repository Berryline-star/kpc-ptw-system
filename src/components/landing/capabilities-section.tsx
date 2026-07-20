const CAPABILITIES = [
  {
    icon: "assignment_add",
    title: "Digital Permit Requests",
    description:
      "Streamlined application process with automated field validation and intelligent categorization.",
  },
  {
    icon: "report_problem",
    title: "Risk Assessment Management",
    description:
      "Integrated JHA/TRA modules to identify and mitigate hazards before work commences.",
  },
  {
    icon: "account_tree",
    title: "Approval Workflows",
    description:
      "Multi-tier digital sign-offs ensuring all safety stakeholders are synchronized in real-time.",
  },
  {
    icon: "qr_code_2",
    title: "QR Code Verification",
    description:
      "Instant on-site permit validation for inspectors via secure mobile scanning technology.",
  },
  {
    icon: "notifications_active",
    title: "Real-Time Notifications",
    description:
      "Immediate SMS and email alerts for permit expiration, approval status, and safety violations.",
  },
  {
    icon: "monitoring",
    title: "Analytics Dashboard",
    description:
      "Deep insights into safety trends, contractor performance, and operational bottlenecks.",
  },
];

export function CapabilitiesSection() {
  return (
    <section id="capabilities" className="scroll-mt-20 bg-surface py-stack-lg">
      <div className="mx-auto max-w-screen-max px-margin-mobile md:px-margin-desktop">
        <div className="mx-auto mb-stack-lg max-w-2xl text-center">
          <h2 className="mb-stack-sm text-headline-lg text-primary">
            Core System Capabilities
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Precision-engineered tools to manage high-risk activities across
            our pipeline network.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((item) => (
            <div
              key={item.title}
              className="group border border-outline-variant bg-white p-gutter transition-colors hover:border-primary"
            >
              <div className="mb-stack-md flex h-12 w-12 items-center justify-center bg-primary/5 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <h3 className="mb-stack-sm text-headline-sm text-primary">
                {item.title}
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
