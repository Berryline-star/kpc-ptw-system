"use client";

import { useTransition } from "react";
import { togglePermission } from "@/lib/actions/permissions";
import type { Role, PermissionModule } from "@prisma/client";

interface PermissionCheckboxProps {
  role: Role;
  module: PermissionModule;
  field: "canView" | "canCreate" | "canApprove" | "canDelete";
  checked: boolean;
}

export function PermissionCheckbox({
  role,
  module,
  field,
  checked,
}: PermissionCheckboxProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex cursor-pointer items-center justify-center py-2">
      <input
        type="checkbox"
        checked={checked}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.checked;
          startTransition(() => {
            togglePermission(role, module, field, next);
          });
        }}
        className="h-5 w-5 accent-primary disabled:opacity-50"
      />
    </label>
  );
}
