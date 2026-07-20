import { requireUser } from "@/lib/session";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Topbar } from "@/components/layout/topbar";
import { DemoModeBanner } from "@/components/layout/demo-mode-banner";
import { isDemoAccount } from "@/lib/demo";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const unreadCount = await getUnreadNotificationCount(user.id);

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col">
        {isDemoAccount(user.email) && <DemoModeBanner />}
        <Topbar
          name={user.name ?? user.email ?? "User"}
          role={user.role}
          unreadCount={unreadCount}
        />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>
      <BottomNav role={user.role} />
    </div>
  );
}
