"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
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
async function recalculateOverallRisk(riskAssessmentId: string) {
  const hazards = await prisma.hazard.findMany({
    where: { riskAssessmentId },
    select: { riskScore: true },
  });
  const overallScore =
    hazards.length > 0 ? Math.max(...hazards.map((h) => h.riskScore)) : 0;

  // Reuse the matrix's score thresholds to classify the overall score
  // too (the matrix itself isn't a pure L x S product, so this is an
  // approximation using boundaries observed across the matrix's cells:
  // <=6 -> low/medium boundary, <=12 -> medium/high, >12 -> high+).
  const overallLevel: RiskLevel =
    overallScore <= 6 ? "LOW" : overallScore <= 12 ? "MEDIUM" : "HIGH";

  await prisma.riskAssessment.update({
    where: { id: riskAssessmentId },
    data: { overallScore, overallLevel },
  });

  // Keep the parent Permit's denormalized riskLevel field in sync too.
  const assessment = await prisma.riskAssessment.findUnique({
    where: { id: riskAssessmentId },
    select: { permitId: true },
  });
  if (assessment) {
    await prisma.permit.update({
      where: { id: assessment.permitId },
      data: { riskLevel: overallLevel },
    });
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
