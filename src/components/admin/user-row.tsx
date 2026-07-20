"use client";

import { useTransition } from "react";
import { toggleUserActive, updateUserRole } from "@/lib/actions/users";
import { ROLE_LABELS } from "@/lib/queries/permissions";
import type { Role } from "@prisma/client";

interface UserRowProps {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string | null;
  isActive: boolean;
  permitCount: number;
  isSelf: boolean;
}

export function UserRow({
  id,
  name,
  email,
  role,
  department,
  isActive,
  permitCount,
  isSelf,
}: UserRowProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <tr
      className={`border-b border-outline-variant text-body-sm ${!isActive ? "opacity-50" : ""}`}
    >
      <td className="py-stack-sm pr-stack-md">
        <p className="font-bold text-on-surface">
          {name} {isSelf && <span className="text-on-surface-variant">(you)</span>}
        </p>
        <p className="text-on-surface-variant">{email}</p>
      </td>
      <td className="py-stack-sm pr-stack-md text-on-surface-variant">
        {department ?? "—"}
      </td>
      <td className="py-stack-sm pr-stack-md">
        <select
          value={role}
          disabled={isSelf || isPending}
          onChange={(e) => {
            const newRole = e.target.value as Role;
            startTransition(() => {
              updateUserRole(id, newRole);
            });
          }}
          className="rounded-sm border border-outline-variant bg-surface px-2 py-1 text-label-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="py-stack-sm pr-stack-md text-on-surface-variant">
        {permitCount}
      </td>
      <td className="py-stack-sm text-right">
        <button
          type="button"
          disabled={isSelf || isPending}
          onClick={() =>
            startTransition(() => {
              toggleUserActive(id);
            })
          }
          className={`rounded-sm px-3 py-1 text-label-sm font-bold uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            isActive
              ? "bg-error-container text-on-error-container hover:opacity-80"
              : "bg-primary/10 text-primary hover:opacity-80"
          }`}
        >
          {isActive ? "Deactivate" : "Activate"}
        </button>
      </td>
    </tr>
  );
}
