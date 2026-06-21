import { prisma } from "@/lib/prisma";
import type { PermitStatus, PermitType, Prisma } from "@prisma/client";

export interface PermitListFilters {
  search?: string;
  status?: PermitStatus;
  type?: PermitType;
  page?: number;
}

const PAGE_SIZE = 10;

export async function getPermitListData(filters: PermitListFilters) {
  const page = Math.max(filters.page ?? 1, 1);

  const where: Prisma.PermitWhereInput = {};
  if (filters.search) {
    where.OR = [
      { permitNumber: { contains: filters.search, mode: "insensitive" } },
      { workDescription: { contains: filters.search, mode: "insensitive" } },
      { facilityName: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;

  const [permits, total, totalAll, pendingCount, activeCount] =
    await Promise.all([
      prisma.permit.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          permitNumber: true,
          type: true,
          status: true,
          workDescription: true,
          facilityName: true,
          startDate: true,
          createdAt: true,
        },
      }),
      prisma.permit.count({ where }),
      prisma.permit.count(),
      prisma.permit.count({ where: { status: "PENDING_APPROVAL" } }),
      prisma.permit.count({ where: { status: "ACTIVE" } }),
    ]);

  return {
    permits,
    total,
    page,
    totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1),
    stats: {
      total: totalAll,
      pending: pendingCount,
      active: activeCount,
    },
  };
}
