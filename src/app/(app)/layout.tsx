import { requireUser } from "@/lib/session";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col">
        <Topbar name={user.name ?? user.email ?? "User"} role={user.role} />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>
      <BottomNav role={user.role} />
    </div>
  );
}
