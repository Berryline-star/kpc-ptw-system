"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { notifyUser, notifyUsersWithRole } from "@/lib/notifications";
import type { Prisma } from "@prisma/client";

interface ActionResult {
  success: boolean;
  message: string;
}

// The old version of this type inferred from the bare
// `findUnique` overload (no args), which doesn't know about the
// `include: { permit: ... }` below — every `step.permit.*` access
// silently fell outside the type until it broke on first use.
// Deriving it from ApprovalStepGetPayload instead ties it to this
// query's actual shape.
type StepWithPermit = Prisma.ApprovalStepGetPayload<{
  include: {
    permit: {
      select: {
        id: true;
        status: true;
        permitNumber: true;
        createdById: true;
      };
    };
  };
}>;

type AuthorizeResult =
  | { success: false; error: string }
  | { success: true; step: StepWithPermit };

async function getStepAndAuthorize(
  stepId: string,
  userRole: string,
): Promise<AuthorizeResult> {
  const step = await prisma.approvalStep.findUnique({
    where: { id: stepId },
    include: {
      permit: {
        select: { id: true, status: true, permitNumber: true, createdById: true },
      },
    },
  });

  if (!step) {
    return { success: false, error: "Approval step not found." };
  }
  if (step.status !== "PENDING") {
    return {
      success: false,
      error: "This approval step has already been actioned.",
    };
  }
  if (step.requiredRole !== userRole) {
    return {
      success: false,
      error: "This approval isn't assigned to your role.",
    };
  }

  // Enforce sequence order server-side too — not just in the queue
  // query — so a direct API/action call can't skip ahead of an earlier
  // pending step.
  const earlierPending = await prisma.approvalStep.findFirst({
    where: {
      permitId: step.permitId,
      sequence: { lt: step.sequence },
      status: "PENDING",
    },
  });
  if (earlierPending) {
    return {
      success: false,
      error: "An earlier approval step is still pending.",
    };
  }

  return { success: true, step };
}

export async function approvePermitStep(
  stepId: string,
  comments?: string,
): Promise<ActionResult> {
  const user = await requireUser();
  const result = await getStepAndAuthorize(stepId, user.role);
  if (!result.success) return { success: false, message: result.error };
  const { step } = result;

  const laterStepsRemaining = await prisma.approvalStep.count({
    where: { permitId: step.permitId, sequence: { gt: step.sequence } },
  });
  const isFinalStep = laterStepsRemaining === 0;

  // Fetched outside the transaction since notifyUsersWithRole itself
  // reads from the DB (to find who currently holds the next role) —
  // Prisma transactions can't mix reads-that-return-promises like that
  // with the array form used below, so we resolve it first and just
  // include the resulting write-promises in the transaction.
  const nextStepNotifications = isFinalStep
    ? []
    : await (async () => {
        const nextStep = await prisma.approvalStep.findFirst({
          where: { permitId: step.permitId, sequence: { gt: step.sequence } },
          orderBy: { sequence: "asc" },
        });
        if (!nextStep) return [];
        return notifyUsersWithRole(nextStep.requiredRole, {
          type: "APPROVAL_REQUEST",
          title: "Permit awaiting your approval",
          message: `Permit #${step.permit.permitNumber} needs your sign-off as the next step.`,
          relatedPermitId: step.permitId,
        });
      })();

  await prisma.$transaction([
    prisma.approvalStep.update({
      where: { id: stepId },
      data: {
        status: "APPROVED",
        approverId: user.id,
        comments: comments || null,
        signedAt: new Date(),
      },
    }),
    // If no later steps remain, the whole permit is now fully approved.
    ...(isFinalStep
      ? [
          prisma.permit.update({
            where: { id: step.permitId },
            data: { status: "APPROVED" },
          }),
          notifyUser({
            userId: step.permit.createdById,
            type: "SYSTEM_UPDATE",
            title: "Permit fully approved",
            message: `Permit #${step.permit.permitNumber} has cleared all approval steps and is now active.`,
            relatedPermitId: step.permitId,
          }),
        ]
      : nextStepNotifications),
    prisma.activityEntry.create({
      data: {
        permitId: step.permitId,
        authorId: user.id,
        type: "STATUS_CHANGE",
        message: isFinalStep
          ? `Approved by ${user.role.replace("_", " ")}. Permit is now fully approved.`
          : `Approved by ${user.role.replace("_", " ")}. Awaiting next approval.`,
      },
    }),
  ]);

  revalidatePath("/approvals");
  revalidatePath(`/permits/${step.permitId}`);
  revalidatePath("/dashboard");
  revalidatePath("/notifications");

  return { success: true, message: "Permit step approved." };
}

export async function rejectPermitStep(
  stepId: string,
  comments: string,
): Promise<ActionResult> {
  const user = await requireUser();

  if (!comments || comments.trim().length < 5) {
    return {
      success: false,
      message:
        "A reason is required when rejecting a permit (min. 5 characters).",
    };
  }

  const result = await getStepAndAuthorize(stepId, user.role);
  if (!result.success) return { success: false, message: result.error };
  const { step } = result;

  await prisma.$transaction([
    prisma.approvalStep.update({
      where: { id: stepId },
      data: {
        status: "REJECTED",
        approverId: user.id,
        comments: comments.trim(),
        signedAt: new Date(),
      },
    }),
    prisma.permit.update({
      where: { id: step.permitId },
      data: { status: "REJECTED" },
    }),
    notifyUser({
      userId: step.permit.createdById,
      type: "URGENT",
      title: "Permit rejected",
      message: `Permit #${step.permit.permitNumber} was rejected by ${user.role.replace("_", " ")}: ${comments.trim()}`,
      relatedPermitId: step.permitId,
    }),
    prisma.activityEntry.create({
      data: {
        permitId: step.permitId,
        authorId: user.id,
        type: "STATUS_CHANGE",
        message: `Rejected by ${user.role.replace("_", " ")}: ${comments.trim()}`,
      },
    }),
  ]);

  revalidatePath("/approvals");
  revalidatePath(`/permits/${step.permitId}`);
  revalidatePath("/dashboard");
  revalidatePath("/notifications");

  return { success: true, message: "Permit rejected." };
}
