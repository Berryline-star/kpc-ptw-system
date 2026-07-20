import { requireRole } from "@/lib/session";
import { getAllUsers } from "@/lib/queries/users";
import { UserRow } from "@/components/admin/user-row";
import { InviteUserForm } from "@/components/admin/invite-user-form";

export default async function UserManagementPage() {
  const admin = await requireRole("SYSTEM_ADMIN");
  const users = await getAllUsers();

  return (
    <div>
      <div className="mb-stack-md flex flex-wrap items-center justify-between gap-stack-sm">
        <p className="text-label-md text-on-surface-variant">
          {users.length} user{users.length === 1 ? "" : "s"}
        </p>
        <InviteUserForm />
      </div>

      <div className="overflow-x-auto border border-outline-variant bg-surface">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-outline-variant text-left text-label-sm uppercase text-on-surface-variant">
              <th className="px-stack-md py-stack-sm font-bold">User</th>
              <th className="px-stack-md py-stack-sm font-bold">Department</th>
              <th className="px-stack-md py-stack-sm font-bold">Role</th>
              <th className="px-stack-md py-stack-sm font-bold">Permits Filed</th>
              <th className="px-stack-md py-stack-sm font-bold text-right">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow
                key={user.id}
                id={user.id}
                name={user.name}
                email={user.email}
                role={user.role}
                department={user.department}
                isActive={user.isActive}
                permitCount={user._count.permitsCreated}
                isSelf={user.id === admin.id}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
