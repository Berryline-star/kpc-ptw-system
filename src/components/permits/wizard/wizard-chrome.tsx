"use client";

import Link from "next/link";

export function WizardTopBar() {
  return (
    <header className="fixed top-0 z-50 flex h-14 w-full items-center justify-between border-b border-outline-variant bg-primary px-margin-mobile text-on-primary">
      <div className="flex items-center gap-4">
        <Link
          href="/permits"
          aria-label="Cancel and go back to permits"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-primary-container active:scale-95"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-headline-sm font-bold">New Work Permit</h1>
      </div>
    </header>
  );
}

export function WizardBottomBar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <footer className="fixed bottom-0 z-50 w-full border-t border-outline-variant bg-surface px-margin-mobile py-4 shadow-lg">
      <div className="mx-auto flex max-w-md gap-4">{children}</div>
    </footer>
  );
}
