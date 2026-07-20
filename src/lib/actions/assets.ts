"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { hasPermission } from "@/lib/permissions";
import type { AssetStatus } from "@prisma/client";

export interface AssetFormState {
  error?: string;
  success?: boolean;
}

export async function createAsset(
  _prevState: AssetFormState | undefined,
  formData: FormData,
): Promise<AssetFormState> {
  const user = await requireUser();
  const canCreate = await hasPermission(user.role, "ASSET_REGISTRY", "canCreate");
  if (!canCreate) {
    return { error: "Your role doesn't have permission to add assets." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const assetTag = String(formData.get("assetTag") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!name || !assetTag || !category || !location) {
    return { error: "Name, asset tag, category, and location are required." };
  }

  const existing = await prisma.asset.findUnique({ where: { assetTag } });
  if (existing) {
    return { error: `Asset tag "${assetTag}" is already in use.` };
  }

  await prisma.asset.create({
    data: { name, assetTag, category, location, notes },
  });

  revalidatePath("/assets");
  return { success: true };
}

export async function updateAssetStatus(assetId: string, status: AssetStatus) {
  const user = await requireUser();
  // Asset editing maps to canCreate (there's no separate "canEdit" column
  // in the matrix — canApprove is specific to Work Permits' approval
  // workflow and doesn't have a natural meaning here).
  const canEdit = await hasPermission(user.role, "ASSET_REGISTRY", "canCreate");
  if (!canEdit) {
    throw new Error("Your role doesn't have permission to update assets.");
  }

  await prisma.asset.update({ where: { id: assetId }, data: { status } });
  revalidatePath("/assets");
}

export async function deleteAsset(assetId: string) {
  const user = await requireUser();
  const canDelete = await hasPermission(user.role, "ASSET_REGISTRY", "canDelete");
  if (!canDelete) {
    throw new Error("Your role doesn't have permission to delete assets.");
  }

  await prisma.asset.delete({ where: { id: assetId } });
  revalidatePath("/assets");
}
