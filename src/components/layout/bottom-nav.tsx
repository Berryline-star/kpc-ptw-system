"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MOBILE_NAV, filterNavByRole } from "@/lib/config/nav";
import type { Role } from "@prisma/client";

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = filterNavByRole(MOBILE_NAV, role);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-outline-variant bg-surface-container-lowest md:hidden">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-label-sm transition-colors",
              isActive ? "text-primary" : "text-on-surface-variant",
            )}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
