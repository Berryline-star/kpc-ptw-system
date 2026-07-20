import { requireRole } from "@/lib/session";
import { AdminTabs } from "@/components/admin/admin-tabs";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth: the sidebar already hides "Administration" from
  // non-admins, but that's just UI — this is the actual gate. Every
  // page under /admin inherits it via this layout.
  await requireRole("SYSTEM_ADMIN");

  return (
    <div className="mx-auto max-w-screen-max p-margin-mobile pb-24 md:p-margin-desktop">
      <section className="mb-stack-lg">
        <h2 className="mb-2 text-headline-lg-mobile text-on-surface md:text-headline-lg">
          Administration
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          User accounts, role permissions, and system activity.
        </p>
      </section>

      <AdminTabs />

      <div className="mt-stack-lg">{children}</div>
    </div>
  );
}
