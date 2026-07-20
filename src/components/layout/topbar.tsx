import Link from "next/link";
import { TopbarSearch } from "@/components/layout/topbar-search";

function formatRole(role: string) {
  return role
    .split("_")
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ");
}

export function Topbar({
  name,
  role,
  unreadCount = 0,
}: {
  name: string;
  role: string;
  unreadCount?: number;
}) {
  return (
    <header className="flex items-center gap-stack-md border-b border-outline-variant bg-surface-container-lowest px-margin-mobile py-stack-sm md:px-margin-desktop">
      <TopbarSearch />

      <div className="flex-1 md:hidden" />

      <div className="flex items-center gap-stack-sm">
        <Link
          href="/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
          aria-label={
            unreadCount > 0
              ? `Notifications (${unreadCount} unread)`
              : "Notifications"
          }
        >
          <span className="material-symbols-outlined text-[22px]">
            notifications
          </span>
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold leading-none text-on-secondary">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <div className="hidden items-center gap-3 border-l border-outline-variant pl-stack-sm md:flex">
          <div className="text-right">
            <p className="text-label-lg text-on-surface">{name}</p>
            <p className="text-label-sm text-on-surface-variant">
              {formatRole(role)}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
            <span className="material-symbols-outlined">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
