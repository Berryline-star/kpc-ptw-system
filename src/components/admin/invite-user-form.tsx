"use client";

import { useActionState, useEffect, useState } from "react";
import { inviteUser } from "@/lib/actions/users";
import { ROLE_LABELS } from "@/lib/queries/permissions";
import { Button } from "@/components/ui/button";

export function InviteUserForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(inviteUser, undefined);

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state?.success]);

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        <span className="material-symbols-outlined text-[18px]">
          person_add
        </span>
        Invite User
      </Button>
    );
  }

  return (
    <div className="mb-stack-md w-full border border-outline-variant bg-surface p-stack-md">
      <div className="mb-stack-sm flex items-center justify-between">
        <h3 className="text-label-lg font-bold text-on-surface">
          Invite a new user
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-on-surface-variant hover:text-on-surface"
          aria-label="Close"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <form action={formAction} className="grid grid-cols-1 gap-stack-sm md:grid-cols-2">
        <div>
          <label className="mb-1 block text-label-sm text-on-surface-variant">
            Full Name
          </label>
          <input
            name="name"
            required
            className="w-full rounded-sm border border-outline-variant px-3 py-2 text-body-sm"
            placeholder="Jane Wanjiru"
          />
        </div>
        <div>
          <label className="mb-1 block text-label-sm text-on-surface-variant">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-sm border border-outline-variant px-3 py-2 text-body-sm"
            placeholder="jane@kpc.co.ke"
          />
        </div>
        <div>
          <label className="mb-1 block text-label-sm text-on-surface-variant">
            Role
          </label>
          <select
            name="role"
            required
            defaultValue=""
            className="w-full rounded-sm border border-outline-variant px-3 py-2 text-body-sm"
          >
            <option value="" disabled>
              Select a role
            </option>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-label-sm text-on-surface-variant">
            Department (optional)
          </label>
          <input
            name="department"
            className="w-full rounded-sm border border-outline-variant px-3 py-2 text-body-sm"
            placeholder="e.g. HSE"
          />
        </div>

        {state?.error && (
          <p role="alert" className="md:col-span-2 text-body-sm text-error">
            {state.error}
          </p>
        )}

        <div className="md:col-span-2">
          <Button type="submit" variant="primary">
            Send Invite
          </Button>
        </div>
      </form>
    </div>
  );
}
