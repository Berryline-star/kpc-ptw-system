import { requireUser } from "@/lib/session";
import { logout } from "@/lib/actions/auth";

function formatRole(role: string) {
  return role
    .split("_")
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ");
}

export default async function ProfilePage() {
  const user = await requireUser();

  const fields: Array<[string, string]> = [
    ["Name", user.name ?? "—"],
    ["Email", user.email ?? "—"],
    ["Role", formatRole(user.role)],
  ];

  return (
    <div className="mx-auto max-w-screen-max p-margin-mobile md:p-margin-desktop">
      <h1 className="mb-stack-lg text-headline-md text-on-surface">
        Profile
      </h1>

      <div className="mb-stack-lg flex items-center gap-stack-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
          <span className="material-symbols-outlined text-[32px]">
            person
          </span>
        </div>
        <div>
          <p className="text-headline-sm text-on-surface">{user.name}</p>
          <p className="text-body-sm text-on-surface-variant">
            {formatRole(user.role)}
          </p>
        </div>
      </div>

      <div className="divide-y divide-outline-variant rounded-lg border border-outline-variant bg-surface-container-lowest">
        {fields.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between px-stack-md py-stack-sm"
          >
            <span className="text-label-md uppercase text-on-surface-variant">
              {label}
            </span>
            <span className="text-body-md text-on-surface">{value}</span>
          </div>
        ))}
      </div>

      <form action={logout} className="mt-stack-lg">
        <button
          type="submit"
          className="rounded-lg bg-error-container px-stack-lg py-3 text-label-lg text-on-error-container transition-colors hover:opacity-90"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}
