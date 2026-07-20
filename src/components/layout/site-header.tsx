"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "#capabilities" },
  { label: "Solutions", href: "#benefits" },
  { label: "Safety", href: "#benefits" },
  { label: "Reports", href: "#capabilities" },
  { label: "Contact", href: "#contact" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full bg-surface border-b border-outline-variant transition-shadow",
        scrolled && "shadow-md",
      )}
    >
      <nav className="mx-auto flex h-20 max-w-screen-max items-center justify-between px-margin-mobile md:px-margin-desktop">
        <Link href="/" className="text-headline-sm font-black text-primary">
          KPC Digital PtW
        </Link>

        <div className="hidden md:flex items-center gap-gutter">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-label-lg text-on-surface-variant transition-colors hover:text-secondary"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-stack-md">
          <Button href="/dashboard" variant="text">
            View Dashboard
          </Button>
          <Button href="/permits/new" variant="primary">
            Request Permit
          </Button>
        </div>

        <button
          type="button"
          className="md:hidden p-2 text-primary"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span className="material-symbols-outlined">
            {mobileOpen ? "close" : "menu"}
          </span>
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-outline-variant bg-surface px-margin-mobile py-stack-md space-y-stack-md">
          <div className="flex flex-col gap-stack-sm">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-stack-sm text-label-lg text-on-surface-variant"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-stack-sm">
            <Button href="/dashboard" variant="outline" className="w-full">
              View Dashboard
            </Button>
            <Button href="/permits/new" variant="primary" className="w-full">
              Request Permit
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
