"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface PermitWizardState {
  // Step 1
  type: string;
  facilityName: string;
  specificLocation: string;
  gpsLat: number | null;
  gpsLng: number | null;
  // Step 2
  workDescription: string;
  startDate: string;
  endDate: string;
  requiredEquipment: string[];
  // Step 3
  contractorName: string;
  contractorIdNumber: string;
  supervisorId: string;
  // Step 4
  selectedHazards: string[];
  selectedPPE: string[];
  declarationAccepted: boolean;
}

const initialState: PermitWizardState = {
  type: "",
  facilityName: "",
  specificLocation: "",
  gpsLat: null,
  gpsLng: null,
  workDescription: "",
  startDate: "",
  endDate: "",
  requiredEquipment: [],
  contractorName: "",
  contractorIdNumber: "",
  supervisorId: "",
  selectedHazards: [],
  selectedPPE: [],
  declarationAccepted: false,
};

interface PermitWizardContextValue {
  data: PermitWizardState;
  updateData: (patch: Partial<PermitWizardState>) => void;
  currentStep: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const PermitWizardContext = createContext<PermitWizardContextValue | null>(
  null,
);

export function PermitWizardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PermitWizardState>(initialState);
  const [currentStep, setCurrentStep] = useState(1);

  const updateData = useCallback((patch: Partial<PermitWizardState>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.min(Math.max(step, 1), 4));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, 4));
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  const reset = useCallback(() => {
    setData(initialState);
    setCurrentStep(1);
  }, []);

  return (
    <PermitWizardContext.Provider
      value={{
        data,
        updateData,
        currentStep,
        goToStep,
        nextStep,
        prevStep,
        reset,
      }}
    >
      {children}
    </PermitWizardContext.Provider>
  );
}

export function usePermitWizard() {
  const ctx = useContext(PermitWizardContext);
  if (!ctx) {
    throw new Error(
      "usePermitWizard must be used within a PermitWizardProvider",
    );
  }
  return ctx;
}
