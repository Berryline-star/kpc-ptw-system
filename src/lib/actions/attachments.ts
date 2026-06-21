"use server";

import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import type { AttachmentCategory } from "@prisma/client";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB, matches the wizard's stated limit
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

interface UploadResult {
  success: boolean;
  message: string;
  attachmentId?: string;
}

export async function uploadPermitAttachment(
  permitId: string,
  formData: FormData,
): Promise<UploadResult> {
  const user = await requireUser();

  const file = formData.get("file") as File | null;
  const category =
    (formData.get("category") as AttachmentCategory) || "OTHER";

  if (!file || file.size === 0) {
    return { success: false, message: "No file was selected." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { success: false, message: "File exceeds the 25MB limit." };
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      message: "Only PDF, DOCX, JPG, or PNG files are accepted.",
    };
  }

  const permit = await prisma.permit.findUnique({
    where: { id: permitId },
    select: { id: true, createdById: true, supervisorId: true },
  });
  if (!permit) {
    return { success: false, message: "Permit not found." };
  }
  const isAuthorized =
    permit.createdById === user.id ||
    permit.supervisorId === user.id ||
    user.role === "SYSTEM_ADMIN" ||
    user.role === "SAFETY_OFFICER";
  if (!isAuthorized) {
    return {
      success: false,
      message: "You don't have permission to attach files to this permit.",
    };
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      success: false,
      message:
        "File storage isn't configured yet. Ask an admin to set up Vercel Blob.",
    };
  }

  try {
    const blob = await put(`permits/${permitId}/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    const attachment = await prisma.attachment.create({
      data: {
        permitId,
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        mimeType: file.type,
        category,
        uploadedById: user.id,
      },
    });

    await prisma.activityEntry.create({
      data: {
        permitId,
        authorId: user.id,
        type: "SYSTEM_UPDATE",
        message: `Attached file: ${file.name}`,
      },
    });

    return {
      success: true,
      message: "File uploaded.",
      attachmentId: attachment.id,
    };
  } catch (error) {
    console.error("uploadPermitAttachment failed:", error);
    return {
      success: false,
      message: "Upload failed. Please try again.",
    };
  }
}

export async function deletePermitAttachment(
  attachmentId: string,
): Promise<UploadResult> {
  const user = await requireUser();

  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    select: { id: true, uploadedById: true, permitId: true },
  });
  if (!attachment) {
    return { success: false, message: "Attachment not found." };
  }
  if (attachment.uploadedById !== user.id && user.role !== "SYSTEM_ADMIN") {
    return {
      success: false,
      message: "You don't have permission to remove this file.",
    };
  }

  await prisma.attachment.delete({ where: { id: attachmentId } });
  // Note: this removes the database record but intentionally leaves the
  // underlying Blob in storage — deleting it permanently here is riskier
  // than the small storage cost of an orphaned file, and a cleanup job
  // can reconcile orphans later if needed.

  return { success: true, message: "Attachment removed." };
}
