"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";

export function PermitSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const [, startTransition] = useTransition();

  const debouncedSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, 350);

  return (
    <section className="mb-stack-md flex gap-2">
      <div className="group relative flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
          search
        </span>
        <input
          type="text"
          placeholder="Search Permit ID or Type..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            debouncedSearch(e.target.value);
          }}
          className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-3 pl-10 pr-4 text-body-md transition-all focus:border-primary focus:outline-none"
        />
      </div>
    </section>
  );
}
