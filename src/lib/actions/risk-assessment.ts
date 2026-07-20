"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notifyUsersWithRole } from "@/lib/notifications";
import {
  getMatrixCellLevel,
  matrixLevelToRiskLevel,
} from "@/lib/config/risk-matrix";
import type { RiskLevel } from "@prisma/client";

interface ActionResult {
  success: boolean;
  message: string;
}

/**
 * Recomputes a RiskAssessment's overallScore/overallLevel from the
 * current max across its hazards. Called after any hazard score change
 * so the summary card never drifts out of sync with the underlying
 * hazard rows.
 */
const RISK_LEVEL_SEVERITY_ORDER: Record<RiskLevel, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
};

async function recalculateOverallRisk(riskAssessmentId: string) {
  const hazards = await prisma.hazard.findMany({
    where: { riskAssessmentId },
    select: { riskScore: true, riskLevel: true },
  });
  const overallScore =
    hazards.length > 0 ? Math.max(...hazards.map((h) => h.riskScore)) : 0;

  // Previously this reclassified overallScore against its own separate
  // threshold (<=6/<=12/>12) instead of reusing the matrix. That's a
  // real bug, not a stylistic choice: getMatrixCellLevel() isn't a pure
  // likelihood x severity product (severity is weighted more heavily,
  // per the KPC risk matrix), so a raw numeric max can rank two hazards
  // in the opposite order from what the actual matrix says. Each
  // Hazard's own riskLevel is already computed correctly via the real
  // matrix in updateHazardScore() below — reusing the *worst* of those
  // levels (not the worst raw score) is what keeps the assessment's
  // overall level consistent with the matrix everywhere, not just at
  // the individual-hazard level.
  const overallLevel: RiskLevel =
    hazards.length > 0
      ? hazards.reduce<RiskLevel>(
          (worst, h) =>
            RISK_LEVEL_SEVERITY_ORDER[h.riskLevel] >
            RISK_LEVEL_SEVERITY_ORDER[worst]
              ? h.riskLevel
              : worst,
          "LOW",
        )
      : "LOW";

  const previous = await prisma.riskAssessment.findUnique({
    where: { id: riskAssessmentId },
    select: { overallLevel: true, permitId: true },
  });

  await prisma.riskAssessment.update({
    where: { id: riskAssessmentId },
    data: { overallScore, overallLevel },
  });

  // Keep the parent Permit's denormalized riskLevel field in sync too.
  if (previous) {
    await prisma.permit.update({
      where: { id: previous.permitId },
      data: { riskLevel: overallLevel },
    });

    // Only fire on the transition *into* HIGH, not on every subsequent
    // edit while it stays HIGH — otherwise adjusting a second hazard on
    // an already-high-risk permit would spam a fresh alert each time.
    if (overallLevel === "HIGH" && previous.overallLevel !== "HIGH") {
      const permit = await prisma.permit.findUnique({
        where: { id: previous.permitId },
        select: { permitNumber: true },
      });
      if (permit) {
        const notifications = await notifyUsersWithRole("SAFETY_OFFICER", {
          type: "SAFETY_ALERT",
          title: "Permit risk elevated to HIGH",
          message: `Permit #${permit.permitNumber}'s risk assessment now scores HIGH overall — review recommended before approval.`,
          relatedPermitId: previous.permitId,
        });
        await Promise.all(notifications);
      }
    }
  }
}

export async function updateHazardScore(
  hazardId: string,
  likelihood: number,
  severity: number,
): Promise<ActionResult> {
  await requireUser();

  if (likelihood < 1 || likelihood > 5 || severity < 1 || severity > 5) {
    return {
      success: false,
      message: "Likelihood and severity must be 1-5.",
    };
  }

  const hazard = await prisma.hazard.findUnique({ where: { id: hazardId } });
  if (!hazard) return { success: false, message: "Hazard not found." };

  const riskScore = likelihood * severity;
  const matrixLevel = getMatrixCellLevel(likelihood, severity);
  const riskLevel = matrixLevelToRiskLevel(matrixLevel);

  await prisma.hazard.update({
    where: { id: hazardId },
    data: { likelihood, severity, riskScore, riskLevel },
  });

  await recalculateOverallRisk(hazard.riskAssessmentId);

  const assessment = await prisma.riskAssessment.findUnique({
    where: { id: hazard.riskAssessmentId },
    select: { permitId: true },
  });
  if (assessment) {
    revalidatePath(`/risk-assessments/${assessment.permitId}`);
    revalidatePath(`/permits/${assessment.permitId}`);
    revalidatePath("/dashboard");
    revalidatePath("/notifications");
  }

  return { success: true, message: "Hazard score updated." };
}

export async function toggleControlMeasure(
  controlMeasureId: string,
): Promise<ActionResult> {
  await requireUser();

  const measure = await prisma.controlMeasure.findUnique({
    where: { id: controlMeasureId },
  });
  if (!measure) {
    return { success: false, message: "Control measure not found." };
  }

  const nextStatus =
    measure.status === "IMPLEMENTED" ? "PENDING_DEPLOYMENT" : "IMPLEMENTED";

  await prisma.controlMeasure.update({
    where: { id: controlMeasureId },
    data: { status: nextStatus },
  });

  const assessment = await prisma.riskAssessment.findUnique({
    where: { id: measure.riskAssessmentId },
    select: { permitId: true },
  });
  if (assessment) {
    revalidatePath(`/risk-assessments/${assessment.permitId}`);
  }

  return { success: true, message: "Control measure updated." };
}

export async function signRiskAssessment(
  riskAssessmentId: string,
): Promise<ActionResult> {
  const user = await requireUser();

  const assessment = await prisma.riskAssessment.findUnique({
    where: { id: riskAssessmentId },
    include: { hazards: true, controlMeasures: true },
  });
  if (!assessment) {
    return { success: false, message: "Risk assessment not found." };
  }
  if (assessment.hazards.length === 0) {
    return {
      success: false,
      message: "At least one hazard must be scored before signing.",
    };
  }

  await prisma.riskAssessment.update({
    where: { id: riskAssessmentId },
    data: {
      status: "VERIFIED",
      signedById: user.id,
      signedAt: new Date(),
    },
  });

  await prisma.activityEntry.create({
    data: {
      permitId: assessment.permitId,
      authorId: user.id,
      type: "STATUS_CHANGE",
      message: `Risk assessment signed and verified by ${user.role.replace("_", " ")}.`,
    },
  });

  revalidatePath(`/risk-assessments/${assessment.permitId}`);
  revalidatePath(`/permits/${assessment.permitId}`);

  return { success: true, message: "Risk assessment verified." };
}
