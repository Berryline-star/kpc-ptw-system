import { prisma } from "@/lib/prisma";

export async function getAllAssets() {
  return prisma.asset.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });
}

export async function getAssetById(id: string) {
  return prisma.asset.findUnique({ where: { id } });
}
