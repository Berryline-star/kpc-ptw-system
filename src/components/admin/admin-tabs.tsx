"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "User Management", href: "/admin/users", icon: "manage_accounts" },
  { label: "Role & Permissions", href: "/admin/roles", icon: "security" },
  { label: "Activity Logs", href: "/admin/activity", icon: "history" },
  {
    label: "Access Control",
    href: "/admin/access-control",
    icon: "shield_person",
  },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-outline-variant">
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap border-b-2 px-stack-md py-stack-sm text-label-lg transition-colors",
              isActive
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-on-surface-variant hover:text-on-surface",
            )}
          >
            <span className="material-symbols-outlined text-[18px]">
              {tab.icon}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
