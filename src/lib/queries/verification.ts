import { prisma } from "@/lib/prisma";

/**
 * Public lookup by verification token (from a scanned QR code) — no auth
 * required, since field inspectors scanning a physical permit sign may
 * not be logged into the system. Deliberately returns only the fields
 * needed for the verification card, not the full permit record (no
 * internal notes, no other users' names beyond what's already meant to
 * be public-facing on a printed permit).
 */
export async function getPermitByVerificationToken(token: string) {
  return prisma.permit.findUnique({
    where: { verificationToken: token },
    select: {
      id: true,
      permitNumber: true,
      type: true,
      status: true,
      facilityName: true,
      specificLocation: true,
      startDate: true,
      endDate: true,
      riskLevel: true,
      riskAssessment: {
        select: {
          requiredPPE: true,
          hazards: {
            select: { category: true, description: true },
            orderBy: { riskScore: "desc" },
            take: 1,
          },
        },
      },
    },
  });
}

export type VerifiedPermit = NonNullable<
  Awaited<ReturnType<typeof getPermitByVerificationToken>>
>;
