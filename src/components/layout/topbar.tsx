import Link from "next/link";

function formatRole(role: string) {
  return role
    .split("_")
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ");
}

export function Topbar({
  name,
  role,
}: {
  name: string;
  role: string;
}) {
  return (
    <header className="flex items-center gap-stack-md border-b border-outline-variant bg-surface-container-lowest px-margin-mobile py-stack-sm md:px-margin-desktop">
      {/* Search — visual placeholder for now, wired up once Permits exists */}
      <div className="hidden flex-1 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 md:flex md:max-w-md">
        <span className="material-symbols-outlined text-[20px] text-outline">
          search
        </span>
        <input
          type="search"
          placeholder="Search permits, assets, or personnel..."
          className="w-full bg-transparent text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
          disabled
        />
      </div>

      <div className="flex-1 md:hidden" />

      <div className="flex items-center gap-stack-sm">
        <Link
          href="/notifications"
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[22px]">
            notifications
          </span>
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
