import { prisma } from "@/lib/prisma";

export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      isActive: true,
      avatarUrl: true,
      createdAt: true,
      _count: {
        select: { permitsCreated: true },
      },
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      isActive: true,
    },
  });
}
