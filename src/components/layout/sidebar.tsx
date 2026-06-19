"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PRIMARY_NAV,
  SECONDARY_NAV,
  filterNavByRole,
  type NavItem,
} from "@/lib/config/nav";
import type { Role } from "@prisma/client";
import { logout } from "@/lib/actions/auth";

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 text-label-lg transition-colors",
        isActive
          ? "bg-secondary-container text-on-secondary-container font-semibold"
          : "text-on-surface-variant hover:bg-surface-container",
      )}
    >
      <span className="material-symbols-outlined text-[20px]">
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const primaryItems = filterNavByRole(PRIMARY_NAV, role);
  const secondaryItems = filterNavByRole(SECONDARY_NAV, role);

  return (
    <aside className="hidden h-dvh w-[280px] flex-col border-r border-outline-variant bg-surface-container-lowest md:flex">
      <div className="flex items-center gap-3 px-stack-md py-stack-lg">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-on-primary">
          <span className="material-symbols-outlined">factory</span>
        </div>
        <div>
          <p className="text-label-lg font-bold text-primary">
            KPC Operations
          </p>
          <p className="text-label-sm text-on-surface-variant">
            Permit-to-Work System
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-stack-sm">
        {primaryItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      <div className="space-y-1 border-t border-outline-variant px-stack-sm py-stack-sm">
        {secondaryItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-label-lg text-error transition-colors hover:bg-error-container"
          >
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
