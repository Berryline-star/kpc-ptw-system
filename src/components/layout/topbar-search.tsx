"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TopbarSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = value.trim();
        router.push(
          trimmed ? `/permits?search=${encodeURIComponent(trimmed)}` : "/permits",
        );
      }}
      className="hidden flex-1 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 md:flex md:max-w-md"
    >
      <span className="material-symbols-outlined text-[20px] text-outline">
        search
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search permits by ID or type..."
        className="w-full bg-transparent text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
      />
    </form>
  );
}
