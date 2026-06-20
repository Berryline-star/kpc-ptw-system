import { requireUser } from "@/lib/session";
import { PermitCreationWizard } from "@/components/permits/wizard/permit-creation-wizard";

export default async function NewPermitPage() {
  await requireUser();
  return <PermitCreationWizard />;
}
