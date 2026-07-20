import { prisma } from "@/lib/prisma";
import type { Role, PermissionModule } from "@prisma/client";

type PermissionAction = "canView" | "canCreate" | "canApprove" | "canDelete";

/**
 * Checks the RolePermission table, which until Asset Registry existed
 * was purely decorative — admins could toggle checkboxes on
 * /admin/roles, but nothing anywhere actually read them. This is the
 * first real consumer.
 *
 * Deliberately NOT used to gate Work Permits / core navigation — those
 * already have their own hardcoded requireRole() checks throughout the
 * codebase, and swapping that foundation to dynamic checks now would be
 * a much bigger, riskier change than what was actually asked for here.
 * SYSTEM_ADMIN also isn't special-cased to bypass this — if the matrix
 * says SYSTEM_ADMIN can't do something, that's respected the same as
 * any other role (the seed data grants admins full access to every
 * module by default, but an admin could deliberately change that).
 */
export async function hasPermission(
  role: Role,
  module: PermissionModule,
  action: PermissionAction,
): Promise<boolean> {
  const permission = await prisma.rolePermission.findUnique({
    where: { role_module: { role, module } },
    select: { canView: true, canCreate: true, canApprove: true, canDelete: true },
  });
  return permission?.[action] ?? false;
}
