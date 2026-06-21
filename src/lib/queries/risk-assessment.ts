import { prisma } from "@/lib/prisma";

export async function getRiskAssessmentByPermitId(permitId: string) {
  return prisma.riskAssessment.findUnique({
    where: { permitId },
    include: {
      hazards: { orderBy: { createdAt: "asc" } },
      controlMeasures: { orderBy: { createdAt: "asc" } },
      permit: {
        select: {
          id: true,
          permitNumber: true,
          type: true,
          status: true,
        },
      },
    },
  });
}

export type RiskAssessmentDetail = NonNullable<
  Awaited<ReturnType<typeof getRiskAssessmentByPermitId>>
>;

export async function getRiskAssessmentsList() {
  return prisma.riskAssessment.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      permit: {
        select: {
          id: true,
          permitNumber: true,
          type: true,
          facilityName: true,
          specificLocation: true,
          status: true,
        },
      },
      hazards: { select: { id: true } },
    },
    take: 50,
  });
}
