import Link from "next/link";
import {
  PERMIT_TYPE_LABELS,
  PERMIT_STATUS_LABELS,
  PERMIT_STATUS_STYLES,
  PERMIT_TYPE_TAG_STYLES,
} from "@/lib/config/permit-display";
import type { PermitStatus, PermitType } from "@prisma/client";

export interface PermitCardData {
  id: string;
  permitNumber: string;
  type: PermitType;
  status: PermitStatus;
  workDescription: string;
  facilityName: string;
  startDate: Date;
}

export function PermitCard({ permit }: { permit: PermitCardData }) {
  return (
    <Link
      href={`/permits/${permit.id}`}
      className="block border border-outline-variant bg-surface-container-lowest transition-transform active:scale-[0.98]"
    >
      <div className="flex items-start justify-between p-stack-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-label-md font-bold ${PERMIT_TYPE_TAG_STYLES[permit.type]}`}
            >
              {PERMIT_TYPE_LABELS[permit.type].toUpperCase()}
            </span>
            <span className="text-label-lg text-on-surface">
              {permit.permitNumber}
            </span>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            {permit.workDescription.length > 60
              ? `${permit.workDescription.slice(0, 60)}...`
              : permit.workDescription}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-label-md ${PERMIT_STATUS_STYLES[permit.status]}`}
        >
          {PERMIT_STATUS_LABELS[permit.status]}
        </span>
      </div>
      <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low px-stack-md py-2">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px]">
            calendar_today
          </span>
          <span className="text-label-sm">
            {permit.startDate.toLocaleDateString("en-KE", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <span className="material-symbols-outlined text-outline">
          chevron_right
        </span>
      </div>
    </Link>
  );
}
