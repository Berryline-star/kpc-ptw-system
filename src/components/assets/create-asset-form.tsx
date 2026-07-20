"use client";

import { useActionState, useEffect, useState } from "react";
import { createAsset } from "@/lib/actions/assets";
import { Button } from "@/components/ui/button";

export function CreateAssetForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createAsset, undefined);

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state?.success]);

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        <span className="material-symbols-outlined text-[18px]">add</span>
        Add Asset
      </Button>
    );
  }

  return (
    <div className="mb-stack-md w-full border border-outline-variant bg-surface p-stack-md">
      <div className="mb-stack-sm flex items-center justify-between">
        <h3 className="text-label-lg font-bold text-on-surface">
          Add a new asset
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
            Name
          </label>
          <input
            name="name"
            required
            className="w-full rounded-sm border border-outline-variant px-3 py-2 text-body-sm"
            placeholder="Pump Station 27 — Booster Pump A"
          />
        </div>
        <div>
          <label className="mb-1 block text-label-sm text-on-surface-variant">
            Asset Tag
          </label>
          <input
            name="assetTag"
            required
            className="w-full rounded-sm border border-outline-variant px-3 py-2 text-body-sm"
            placeholder="PS27-PMP-A"
          />
        </div>
        <div>
          <label className="mb-1 block text-label-sm text-on-surface-variant">
            Category
          </label>
          <input
            name="category"
            required
            className="w-full rounded-sm border border-outline-variant px-3 py-2 text-body-sm"
            placeholder="Pump, Valve, Pipeline Segment..."
          />
        </div>
        <div>
          <label className="mb-1 block text-label-sm text-on-surface-variant">
            Location
          </label>
          <input
            name="location"
            required
            className="w-full rounded-sm border border-outline-variant px-3 py-2 text-body-sm"
            placeholder="Sector 4, Pump Station 27"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-label-sm text-on-surface-variant">
            Notes (optional)
          </label>
          <textarea
            name="notes"
            rows={2}
            className="w-full rounded-sm border border-outline-variant px-3 py-2 text-body-sm"
          />
        </div>

        {state?.error && (
          <p role="alert" className="md:col-span-2 text-body-sm text-error">
            {state.error}
          </p>
        )}

        <div className="md:col-span-2">
          <Button type="submit" variant="primary">
            Add Asset
          </Button>
        </div>
      </form>
    </div>
  );
}
