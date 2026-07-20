import { prisma } from "@/lib/prisma";

export const AUDIT_ACTION_META: Record<
  string,
  { icon: string; label: string }
> = {
  USER_CREATED: { icon: "person_add", label: "User Created" },
  USER_INVITED: { icon: "mail", label: "User Invited" },
  USER_ACTIVATED: { icon: "how_to_reg", label: "User Activated" },
  USER_DEACTIVATED: { icon: "person_off", label: "User Deactivated" },
  ROLE_CHANGED: { icon: "manage_history", label: "Role Changed" },
  PERMISSION_UPDATED: { icon: "security_update", label: "Permission Updated" },
  PERMIT_APPROVED: { icon: "fact_check", label: "Permit Approved" },
  PERMIT_REJECTED: { icon: "cancel", label: "Permit Rejected" },
};

export function getAuditActionMeta(action: string) {
  return (
    AUDIT_ACTION_META[action] ?? { icon: "history", label: action }
  );
}

export async function getAuditLogs(take = 100) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: {
      actor: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}
