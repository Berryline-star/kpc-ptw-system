"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  createPermitSchema,
  HAZARD_OPTIONS,
  PPE_OPTIONS,
} from "@/lib/validation/permit";
import type { PermitWizardState } from "@/components/permits/wizard/permit-wizard-context";
import type { PermitType, RiskLevel } from "@prisma/client";

interface CreatePermitResult {
  success: boolean;
  message: string;
  permitId?: string;
}

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 15) return "HIGH";
  if (score >= 8) return "MEDIUM";
  return "LOW";
}

async function generatePermitNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.permit.count({
    where: { permitNumber: { startsWith: `PTW-${year}-` } },
  });
  const sequence = String(count + 1).padStart(4, "0");
  return `PTW-${year}-${sequence}`;
}

export async function createPermit(
  data: PermitWizardState,
): Promise<CreatePermitResult> {
  const user = await requireUser();

  const parsed = createPermitSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Some fields are invalid.",
    };
  }
  const values = parsed.data;

  // Resolve selected hazard/PPE keys to their full descriptive records.
  const hazards = HAZARD_OPTIONS.filter((h) =>
    values.selectedHazards.includes(h.key),
  );
  const ppeLabels = PPE_OPTIONS.filter((p) =>
    values.selectedPPE.includes(p.key),
  ).map((p) => p.label);

  if (hazards.length === 0) {
    return { success: false, message: "Select at least one hazard." };
  }

  // Likelihood/severity aren't independently scored in this simplified
  // wizard (unlike the full Risk Assessment module in a later phase) —
  // each selected hazard is treated as a flat moderate score (3x3=9) so
  // the permit gets a sensible default MEDIUM rating that the Safety
  // Officer can refine, rather than leaving riskLevel null.
  const hazardRecords = hazards.map((h) => ({
    description: h.description,
    category: h.category,
    likelihood: 3,
    severity: 3,
    riskScore: 9,
    riskLevel: riskLevelFromScore(9),
  }));
  const overallScore = Math.max(...hazardRecords.map((h) => h.riskScore));
  const overallLevel = riskLevelFromScore(overallScore);

  const supervisor = await prisma.user.findUnique({
    where: { id: values.supervisorId },
    select: { id: true, role: true },
  });
  if (!supervisor) {
    return { success: false, message: "Selected supervisor was not found." };
  }

  const permitNumber = await generatePermitNumber();

  try {
    const permit = await prisma.permit.create({
      data: {
        permitNumber,
        type: values.type as PermitType,
        status: "PENDING_APPROVAL",
        facilityName: values.facilityName,
        specificLocation: values.specificLocation,
        gpsLat: values.gpsLat,
        gpsLng: values.gpsLng,
        workDescription: values.workDescription,
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
        requiredEquipment: values.requiredEquipment,
        contractorName: values.contractorName || null,
        contractorIdNumber: values.contractorIdNumber || null,
        riskLevel: overallLevel,
        createdById: user.id,
        supervisorId: supervisor.id,
        submittedAt: new Date(),
        riskAssessment: {
          create: {
            overallScore,
            overallLevel,
            status: "PENDING_REVIEW",
            requiredPPE: ppeLabels,
            hazards: { create: hazardRecords },
          },
        },
        // Two-stage approval chain: Safety Officer first, then whichever
        // role the chosen supervisor holds (Depot Manager) signs off
        // second. Matches the workflow shown on the approval mockups.
        approvalSteps: {
          create: [
            { sequence: 1, requiredRole: "SAFETY_OFFICER", status: "PENDING" },
            { sequence: 2, requiredRole: "DEPOT_MANAGER", status: "PENDING" },
          ],
        },
        activityEntries: {
          create: {
            authorId: user.id,
            type: "STATUS_CHANGE",
            message: "Permit created and submitted for approval.",
          },
        },
      },
      select: { id: true, permitNumber: true },
    });

    return {
      success: true,
      message: `Permit ${permit.permitNumber} submitted for approval.`,
      permitId: permit.id,
    };
  } catch (error) {
    console.error("createPermit failed:", error);
    return {
      success: false,
      message:
        "Something went wrong while saving the permit. Please try again.",
    };
  }
}
