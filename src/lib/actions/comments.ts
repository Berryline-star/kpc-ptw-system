"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function postPermitComment(permitId: string, message: string) {
  const user = await requireUser();

  const trimmed = message.trim();
  if (!trimmed) {
    return { success: false, message: "Comment can't be empty." };
  }
  if (trimmed.length > 1000) {
    return { success: false, message: "Comment is too long." };
  }

  await prisma.activityEntry.create({
    data: {
      permitId,
      authorId: user.id,
      type: "COMMENT",
      message: trimmed,
    },
  });

  revalidatePath(`/permits/${permitId}`);
  return { success: true, message: "Comment posted." };
}
