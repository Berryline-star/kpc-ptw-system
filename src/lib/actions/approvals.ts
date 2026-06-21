"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

interface ActionResult {
  success: boolean;
  message: string;
}

type AuthorizeResult =
  | { success: false; error: string }
  | {
      success: true;
      step: NonNullable<
        Awaited<ReturnType<typeof prisma.approvalStep.findUnique>>
      >;
    };

async function getStepAndAuthorize(
  stepId: string,
  userRole: string,
): Promise<AuthorizeResult> {
  const step = await prisma.approvalStep.findUnique({
    where: { id: stepId },
    include: { permit: { select: { id: true, status: true } } },
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
        ]
      : []),
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

  return { success: true, message: "Permit rejected." };
}
