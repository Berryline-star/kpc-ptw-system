import { prisma } from "@/lib/prisma";
import type { Role, PermissionModule } from "@prisma/client";

export const ALL_ROLES: Role[] = [
  "SYSTEM_ADMIN",
  "SAFETY_OFFICER",
  "DEPOT_MANAGER",
  "CONTRACTOR",
  "SUPERVISOR",
];

export const ALL_MODULES: PermissionModule[] = [
  "WORK_PERMITS",
  "SAFETY_ANALYTICS",
  "ACCESS_CONTROL",
  "ASSET_REGISTRY",
];

export const ROLE_LABELS: Record<Role, string> = {
  SYSTEM_ADMIN: "System Admin",
  SAFETY_OFFICER: "Safety Officer",
  DEPOT_MANAGER: "Depot Manager",
  CONTRACTOR: "Contractor",
  SUPERVISOR: "Supervisor",
};

export const MODULE_LABELS: Record<PermissionModule, string> = {
  WORK_PERMITS: "Work Permits",
  SAFETY_ANALYTICS: "Safety Analytics",
  ACCESS_CONTROL: "Access Control",
  ASSET_REGISTRY: "Asset Registry",
};

export interface PermissionCell {
  role: Role;
  module: PermissionModule;
  canView: boolean;
  canCreate: boolean;
  canApprove: boolean;
  canDelete: boolean;
}

/**
 * Returns a complete Role x Module grid even if some combinations have
 * no row yet in the DB (defaults every permission to false rather than
 * silently omitting the cell, so the matrix UI never has a hole in it).
 */
export async function getRolePermissionsMatrix(): Promise<PermissionCell[]> {
  const rows = await prisma.rolePermission.findMany();
  const byKey = new Map(rows.map((r) => [`${r.role}:${r.module}`, r]));

  const grid: PermissionCell[] = [];
  for (const role of ALL_ROLES) {
    for (const mod of ALL_MODULES) {
      const existing = byKey.get(`${role}:${mod}`);
      grid.push({
        role,
        module: mod,
        canView: existing?.canView ?? false,
        canCreate: existing?.canCreate ?? false,
        canApprove: existing?.canApprove ?? false,
        canDelete: existing?.canDelete ?? false,
      });
    }
  }
  return grid;
}
