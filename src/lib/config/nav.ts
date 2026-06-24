import type { Role } from "@prisma/client";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // Material Symbols name
  allowedRoles: Role[];
}

const ALL_ROLES: Role[] = [
  "SYSTEM_ADMIN",
  "SAFETY_OFFICER",
  "DEPOT_MANAGER",
  "CONTRACTOR",
  "SUPERVISOR",
];

const APPROVER_ROLES: Role[] = [
  "SYSTEM_ADMIN",
  "SAFETY_OFFICER",
  "DEPOT_MANAGER",
];

// Primary navigation — desktop sidebar shows all of these (filtered by
// role); mobile bottom nav shows a curated subset (see MOBILE_NAV_HREFS).
export const PRIMARY_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    allowedRoles: ALL_ROLES,
  },
  {
    label: "Permits",
    href: "/permits",
    icon: "assignment",
    allowedRoles: ALL_ROLES,
  },
  {
    label: "Approvals",
    href: "/approvals",
    icon: "fact_check",
    allowedRoles: APPROVER_ROLES,
  },
  {
    label: "Risk Assessments",
    href: "/risk-assessments",
    icon: "shield",
    allowedRoles: ["SYSTEM_ADMIN", "SAFETY_OFFICER", "DEPOT_MANAGER", "SUPERVISOR"],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "monitoring",
    allowedRoles: ["SYSTEM_ADMIN", "SAFETY_OFFICER", "DEPOT_MANAGER", "SUPERVISOR"],
  },
  {
    label: "Scanner",
    href: "/scanner",
    icon: "qr_code_scanner",
    allowedRoles: ALL_ROLES,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: "notifications",
    allowedRoles: ALL_ROLES,
  },
];

// Secondary navigation — pinned to the bottom of the desktop sidebar.
export const SECONDARY_NAV: NavItem[] = [
  {
    label: "Administration",
    href: "/admin",
    icon: "admin_panel_settings",
    allowedRoles: ["SYSTEM_ADMIN"],
  },
  {
    label: "Settings",
    href: "/profile",
    icon: "settings",
    allowedRoles: ALL_ROLES,
  },
];

// Mobile bottom tab bar mirrors the Stitch mockups' 4-tab pattern
// (Dashboard / Permits / Safety / Profile) rather than showing every
// sidebar item — there isn't room, and these four cover the most common
// actions regardless of role.
export const MOBILE_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    allowedRoles: ALL_ROLES,
  },
  {
    label: "Permits",
    href: "/permits",
    icon: "assignment",
    allowedRoles: ALL_ROLES,
  },
  {
    label: "Safety",
    href: "/risk-assessments",
    icon: "shield",
    allowedRoles: ["SYSTEM_ADMIN", "SAFETY_OFFICER", "DEPOT_MANAGER", "SUPERVISOR"],
  },
  {
    label: "Profile",
    href: "/profile",
    icon: "person",
    allowedRoles: ALL_ROLES,
  },
];

export function filterNavByRole(items: NavItem[], role: Role): NavItem[] {
  return items.filter((item) => item.allowedRoles.includes(role));
}
