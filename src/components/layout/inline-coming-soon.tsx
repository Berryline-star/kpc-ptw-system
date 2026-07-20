interface InlineComingSoonProps {
  icon: string;
  title: string;
  phase: string;
}

/**
 * Placeholder for routes inside the authenticated `(app)` layout, which
 * already renders the Sidebar/Topbar/BottomNav. Unlike the public
 * `ComingSoon` (used for /register, /demo), this doesn't render its own
 * SiteHeader/SiteFooter — doing so here would duplicate the app chrome.
 */
export function InlineComingSoon({ icon, title, phase }: InlineComingSoonProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-margin-mobile md:p-margin-desktop">
      <div className="text-center">
        <div className="mx-auto mb-stack-md flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary">
          <span className="material-symbols-outlined text-[32px]">{icon}</span>
        </div>
        <p className="mb-stack-sm text-label-sm uppercase tracking-wider text-secondary">
          {phase}
        </p>
        <h1 className="mb-stack-sm text-headline-lg-mobile text-primary md:text-headline-lg">
          {title}
        </h1>
        <p className="mx-auto max-w-md text-body-md text-on-surface-variant">
          This section is coming in a future phase.
        </p>
      </div>
    </div>
  );
}
