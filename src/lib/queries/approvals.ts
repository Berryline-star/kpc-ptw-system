import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

/**
 * Returns permits where the current step of the approval chain matches
 * the signed-in user's role and is still PENDING — i.e. "permits waiting
 * on me specifically," not just any pending permit. A permit only shows
 * up once its prior approval steps are already APPROVED (sequence order
 * enforced), so a Depot Manager never sees a permit the Safety Officer
 * hasn't signed off on yet.
 */
export async function getApprovalQueue(role: Role) {
  const pendingSteps = await prisma.approvalStep.findMany({
    where: {
      requiredRole: role,
      status: "PENDING",
      permit: { status: "PENDING_APPROVAL" },
    },
    include: {
      permit: {
        select: {
          id: true,
          permitNumber: true,
          type: true,
          status: true,
          facilityName: true,
          specificLocation: true,
          riskLevel: true,
          startDate: true,
          endDate: true,
          submittedAt: true,
          createdBy: { select: { name: true } },
        },
      },
    },
    orderBy: { permit: { submittedAt: "asc" } },
  });

  // Filter out permits where an earlier-sequence step is still pending
  // (this role isn't actually "up" yet).
  const eligible = [];
  for (const step of pendingSteps) {
    const earlierPending = await prisma.approvalStep.findFirst({
      where: {
        permitId: step.permitId,
        sequence: { lt: step.sequence },
        status: "PENDING",
      },
    });
    if (!earlierPending) eligible.push(step);
  }

  return eligible;
}

export async function getApprovalQueueCount(role: Role) {
  const queue = await getApprovalQueue(role);
  return queue.length;
}

export async function getApprovalStepDetail(stepId: string) {
  return prisma.approvalStep.findUnique({
    where: { id: stepId },
    include: {
      permit: {
        include: {
          supervisor: { select: { name: true } },
          riskAssessment: { include: { hazards: true } },
          approvalSteps: { orderBy: { sequence: "asc" } },
        },
      },
    },
  });
}
