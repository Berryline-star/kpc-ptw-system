"use client";

import { PermitWizardProvider, usePermitWizard } from "./permit-wizard-context";
import { WizardTopBar } from "./wizard-chrome";
import { Step1TypeLocation } from "./step-1-type-location";
import { Step2DetailsAndDates } from "./step-2-details-dates";
import { Step3ContractorFiles } from "./step-3-contractor-files";
import { Step4RiskReview } from "./step-4-risk-review";

function WizardSteps() {
  const { currentStep } = usePermitWizard();

  return (
    <div className="fixed inset-0 z-[100] flex min-h-dvh flex-col overflow-y-auto bg-background">
      <WizardTopBar />
      {currentStep === 1 && <Step1TypeLocation />}
      {currentStep === 2 && <Step2DetailsAndDates />}
      {currentStep === 3 && <Step3ContractorFiles />}
      {currentStep === 4 && <Step4RiskReview />}
    </div>
  );
}

export function PermitCreationWizard() {
  return (
    <PermitWizardProvider>
      <WizardSteps />
    </PermitWizardProvider>
  );
}
