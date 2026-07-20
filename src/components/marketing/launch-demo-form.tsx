"use client";

import { useActionState } from "react";
import { startDemoSession } from "@/lib/actions/demo";
import { SubmitButton } from "@/components/ui/submit-button";

export function LaunchDemoForm() {
  const [error, formAction] = useActionState(
    async () => startDemoSession(),
    undefined,
  );

  return (
    <form action={formAction} className="mx-auto max-w-xs">
      <SubmitButton icon="play_arrow" pendingLabel="Launching demo…">
        Launch Live Demo
      </SubmitButton>
      {error && (
        <p role="alert" className="mt-stack-sm text-body-sm text-error">
          {error}
        </p>
      )}
    </form>
  );
}
