"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingLabel?: string;
  icon?: string;
  className?: string;
}

export function SubmitButton({
  children,
  pendingLabel = "Please wait\u2026",
  icon = "arrow_forward",
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 text-label-lg text-lg text-on-primary shadow-lg transition-all hover:bg-primary-container active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
    >
      <span>{pending ? pendingLabel : children}</span>
      {!pending && (
        <span className="material-symbols-outlined">{icon}</span>
      )}
    </button>
  );
}
