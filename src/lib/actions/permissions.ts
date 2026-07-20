"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import type { Role, PermissionModule } from "@prisma/client";

type PermissionField = "canView" | "canCreate" | "canApprove" | "canDelete";

export async function togglePermission(
  role: Role,
  module: PermissionModule,
  field: PermissionField,
  nextValue: boolean,
) {
  const admin = await requireRole("SYSTEM_ADMIN");

  await prisma.$transaction([
    prisma.rolePermission.upsert({
      where: { role_module: { role, module } },
      update: { [field]: nextValue },
      create: {
        role,
        module,
        canView: field === "canView" ? nextValue : false,
        canCreate: field === "canCreate" ? nextValue : false,
        canApprove: field === "canApprove" ? nextValue : false,
        canDelete: field === "canDelete" ? nextValue : false,
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: "PERMISSION_UPDATED",
        targetType: "RolePermission",
        targetId: `${role}:${module}`,
        metadata: { field, value: nextValue },
      },
    }),
  ]);

  revalidatePath("/admin/roles");
  revalidatePath("/admin/activity");
}
