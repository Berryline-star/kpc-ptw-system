import {
  getRolePermissionsMatrix,
  ROLE_LABELS,
  MODULE_LABELS,
} from "@/lib/queries/permissions";
import { PermissionCheckbox } from "@/components/admin/permission-checkbox";

const FIELDS = [
  { key: "canView" as const, label: "View" },
  { key: "canCreate" as const, label: "Create" },
  { key: "canApprove" as const, label: "Approve" },
  { key: "canDelete" as const, label: "Delete" },
];

export default async function RolePermissionsPage() {
  const matrix = await getRolePermissionsMatrix();

  return (
    <div>
      <p className="mb-stack-md text-body-sm text-on-surface-variant">
        Toggle what each role can do per module. Changes take effect
        immediately and are recorded in the Activity Log.
      </p>

      <div className="space-y-stack-lg">
        {Object.entries(
          matrix.reduce<Record<string, typeof matrix>>((acc, cell) => {
            (acc[cell.role] ??= []).push(cell);
            return acc;
          }, {}),
        ).map(([role, cells]) => (
          <div key={role} className="border border-outline-variant bg-surface">
            <div className="border-b border-outline-variant bg-surface-container-lowest px-stack-md py-stack-sm">
              <p className="text-label-lg font-bold text-primary">
                {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="border-b border-outline-variant text-label-sm uppercase text-on-surface-variant">
                    <th className="px-stack-md py-2 text-left font-bold">
                      Module
                    </th>
                    {FIELDS.map((f) => (
                      <th key={f.key} className="px-stack-md py-2 font-bold">
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cells.map((cell) => (
                    <tr
                      key={cell.module}
                      className="border-b border-outline-variant last:border-0"
                    >
                      <td className="px-stack-md py-2 text-body-sm text-on-surface">
                        {MODULE_LABELS[cell.module]}
                      </td>
                      {FIELDS.map((f) => (
                        <td key={f.key} className="px-stack-md">
                          <PermissionCheckbox
                            role={cell.role}
                            module={cell.module}
                            field={f.key}
                            checked={cell[f.key]}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
