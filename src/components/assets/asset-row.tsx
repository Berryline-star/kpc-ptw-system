"use client";

import { useTransition } from "react";
import { updateAssetStatus, deleteAsset } from "@/lib/actions/assets";
import type { AssetStatus } from "@prisma/client";

const STATUS_STYLES: Record<AssetStatus, string> = {
  OPERATIONAL: "bg-primary/10 text-primary",
  MAINTENANCE: "bg-secondary-container/20 text-secondary",
  DECOMMISSIONED: "bg-surface-container-high text-on-surface-variant",
};

interface AssetRowProps {
  id: string;
  name: string;
  assetTag: string;
  category: string;
  location: string;
  status: AssetStatus;
  canEdit: boolean;
  canDelete: boolean;
}

export function AssetRow({
  id,
  name,
  assetTag,
  category,
  location,
  status,
  canEdit,
  canDelete,
}: AssetRowProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <tr className="border-b border-outline-variant text-body-sm last:border-0">
      <td className="py-stack-sm pr-stack-md">
        <p className="font-bold text-on-surface">{name}</p>
        <p className="text-label-sm text-on-surface-variant">{assetTag}</p>
      </td>
      <td className="py-stack-sm pr-stack-md text-on-surface-variant">
        {category}
      </td>
      <td className="py-stack-sm pr-stack-md text-on-surface-variant">
        {location}
      </td>
      <td className="py-stack-sm pr-stack-md">
        {canEdit ? (
          <select
            value={status}
            disabled={isPending}
            onChange={(e) =>
              startTransition(() =>
                updateAssetStatus(id, e.target.value as AssetStatus),
              )
            }
            className={`rounded-sm border-0 px-2 py-1 text-label-sm font-bold ${STATUS_STYLES[status]}`}
          >
            <option value="OPERATIONAL">Operational</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="DECOMMISSIONED">Decommissioned</option>
          </select>
        ) : (
          <span
            className={`rounded-sm px-2 py-1 text-label-sm font-bold ${STATUS_STYLES[status]}`}
          >
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </span>
        )}
      </td>
      <td className="py-stack-sm text-right">
        {canDelete && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (confirm(`Delete asset "${name}"? This can't be undone.`)) {
                startTransition(() => deleteAsset(id));
              }
            }}
            className="text-label-sm text-error hover:underline disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  );
}
