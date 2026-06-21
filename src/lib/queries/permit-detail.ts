import { prisma } from "@/lib/prisma";

export async function getPermitDetail(id: string) {
  return prisma.permit.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      supervisor: { select: { id: true, name: true } },
      riskAssessment: { include: { hazards: true, controlMeasures: true } },
      approvalSteps: {
        orderBy: { sequence: "asc" },
        include: { approver: { select: { name: true } } },
      },
      attachments: {
        orderBy: { createdAt: "desc" },
        include: { uploadedBy: { select: { name: true } } },
      },
      activityEntries: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true } } },
      },
    },
  });
}

export type PermitDetail = NonNullable<
  Awaited<ReturnType<typeof getPermitDetail>>
>;
