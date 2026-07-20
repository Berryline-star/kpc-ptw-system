const RESOURCE_LINKS = [
  { label: "Safety Standards", href: "#" },
  { label: "Industrial Compliance", href: "#" },
  { label: "HSE Guidelines", href: "#" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container-lowest">
      <div className="mx-auto grid max-w-screen-max grid-cols-1 gap-gutter px-margin-mobile py-stack-lg md:grid-cols-4 md:px-margin-desktop">
        <div>
          <div className="mb-stack-md text-headline-sm font-bold text-primary">
            KPC Digital PtW
          </div>
          <p className="mb-stack-md text-body-sm text-on-surface-variant">
            Kenya Pipeline Company&rsquo;s official digital platform for
            managing permit-to-work requests and industrial safety standards.
          </p>
          <div className="flex gap-stack-sm">
            <span className="material-symbols-outlined cursor-pointer text-primary hover:text-secondary">
              public
            </span>
            <span className="material-symbols-outlined cursor-pointer text-primary hover:text-secondary">
              mail
            </span>
            <span className="material-symbols-outlined cursor-pointer text-primary hover:text-secondary">
              phone
            </span>
          </div>
        </div>

        <div>
          <h5 className="mb-stack-md text-label-lg font-bold text-primary">
            Resources
          </h5>
          <ul className="space-y-2">
            {RESOURCE_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-body-sm text-on-surface-variant underline transition-all hover:text-secondary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="mb-stack-md text-label-lg font-bold text-primary">
            Legal
          </h5>
          <ul className="space-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-body-sm text-on-surface-variant underline transition-all hover:text-secondary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div id="contact" className="scroll-mt-24">
          <h5 className="mb-stack-md text-label-lg font-bold text-primary">
            Safety Desk
          </h5>
          <p className="mb-stack-sm text-body-sm text-on-surface-variant">
            Emergency Contact:
            <br />
            <a href="tel:0800123456" className="font-bold text-error">
              0800 123 456
            </a>
          </p>
          <p className="text-body-sm text-on-surface-variant">
            HSE Support:
            <br />
            <a href="mailto:hse-support@kpc.co.ke" className="hover:text-secondary">
              hse-support@kpc.co.ke
            </a>
          </p>
        </div>
      </div>

      <div className="border-t border-outline-variant py-stack-md">
        <p className="mx-auto max-w-screen-max px-margin-mobile text-center text-body-sm text-on-surface-variant opacity-80 md:px-margin-desktop">
          © {new Date().getFullYear()} Kenya Pipeline Company. All rights
          reserved. Safety First.
        </p>
      </div>
    </footer>
  );
}
