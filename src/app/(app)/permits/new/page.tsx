import { requireUser } from "@/lib/session";
import { PermitCreationWizard } from "@/components/permits/wizard/permit-creation-wizard";
import { isDemoAccount } from "@/lib/demo";
import { Button } from "@/components/ui/button";

export default async function NewPermitPage() {
  const user = await requireUser();

  // The FAB already sends the demo account to /register instead of
  // here, but that's only a UI nicety — someone could still type this
  // URL directly while signed in as demo@kpc.co.ke, so this is the
  // real enforcement point. createPermit() in lib/actions/permit.ts
  // repeats this check server-side too, since a page-level check alone
  // wouldn't stop a direct call to the action itself.
  if (isDemoAccount(user.email)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-margin-mobile md:p-margin-desktop">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-stack-md flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary">
            <span className="material-symbols-outlined text-[32px]">
              person_add
            </span>
          </div>
          <h1 className="mb-stack-sm text-headline-lg-mobile text-primary md:text-headline-lg">
            Create a real account to submit permits
          </h1>
          <p className="mb-stack-lg text-body-md text-on-surface-variant">
            The shared demo account can browse the full system, but
            permit creation writes real data — sign up for your own
            account to submit one.
          </p>
          <Button href="/register" variant="primary">
            Create Account
          </Button>
        </div>
      </div>
    );
  }

  return <PermitCreationWizard />;
}
