import type { PermitStatus, PermitType } from "@prisma/client";

export const PERMIT_TYPE_LABELS: Record<PermitType, string> = {
  HOT_WORK: "Hot Work",
  COLD_WORK: "Cold Work",
  CONFINED_SPACE: "Confined Space",
  EXCAVATION: "Excavation",
  WORKING_AT_HEIGHT: "Working at Height",
  ELECTRICAL: "Electrical",
};

export const PERMIT_STATUS_LABELS: Record<PermitStatus, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ACTIVE: "Active",
  EXPIRED: "Expired",
  CLOSED: "Closed",
};

export const PERMIT_STATUS_STYLES: Record<PermitStatus, string> = {
  DRAFT: "bg-surface-container-high text-on-surface-variant",
  PENDING_APPROVAL: "bg-secondary-fixed-dim text-on-secondary-fixed-variant",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-error-container text-on-error-container",
  ACTIVE: "bg-blue-100 text-blue-800",
  EXPIRED: "bg-error-container text-on-error-container",
  CLOSED: "bg-surface-container-high text-on-surface-variant",
};

export const PERMIT_TYPE_TAG_STYLES: Record<PermitType, string> = {
  HOT_WORK: "bg-primary-fixed text-on-primary-fixed",
  COLD_WORK: "bg-primary-fixed text-on-primary-fixed",
  CONFINED_SPACE: "bg-secondary-fixed text-on-secondary-fixed",
  EXCAVATION: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  WORKING_AT_HEIGHT: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  ELECTRICAL: "bg-secondary-fixed text-on-secondary-fixed",
};

export const RISK_LEVEL_LABELS = {
  LOW: "Low Risk",
  MEDIUM: "Medium Risk",
  HIGH: "High Risk",
} as const;

export const RISK_LEVEL_STYLES = {
  LOW: "bg-green-100 text-green-800 border-green-200",
  MEDIUM: "bg-secondary-fixed-dim text-on-secondary-fixed-variant border-secondary/20",
  HIGH: "bg-error-container text-on-error-container border-error/20",
} as const;
