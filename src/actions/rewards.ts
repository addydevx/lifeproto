"use server";

import { prisma } from "@/lib/db/prisma";
import { requireProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type RedeemResult =
  | { error: string }
  | { success: true; xpSpent: number; newTotalXp: number };

export async function redeemRewardAction(rewardId: string): Promise<RedeemResult> {
  const profile = await requireProfile();

  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward) return { error: "Reward not found." };
  if (reward.profileId !== profile.id) return { error: "Not your reward." };
  if (!reward.active) return { error: "Reward unavailable." };
  if (profile.totalXp < reward.cost) {
    return { error: `Insufficient XP. Need ${reward.cost - profile.totalXp} more.` };
  }

  await prisma.$transaction(async (tx) => {
    await tx.redemption.create({
      data: {
        rewardId,
        profileId: profile.id,
        xpSpent: reward.cost,
      },
    });

    await tx.profile.update({
      where: { id: profile.id },
      data: { totalXp: { decrement: reward.cost } },
    });
  });

  revalidatePath("/rewards");
  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return {
    success: true,
    xpSpent: reward.cost,
    newTotalXp: profile.totalXp - reward.cost,
  };
}

// --- CRUD ---------------------------------------------------------------

export type RewardMutationResult =
  | { error: string }
  | { success: true; rewardId: string };

function validateRewardInput(formData: FormData): { data?: { name: string; description?: string; cost: number }; error?: string } {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const cost = Number(formData.get("cost") ?? 0);

  if (!name) return { error: "Name required." };
  if (name.length > 80) return { error: "Name too long (max 80)." };
  if (description.length > 300) return { error: "Description too long (max 300)." };
  if (!Number.isInteger(cost) || cost < 1 || cost > 1000000)
    return { error: "Cost must be 1-1,000,000 XP." };

  return { data: { name, description: description || undefined, cost } };
}

export async function createRewardAction(formData: FormData): Promise<RewardMutationResult> {
  const profile = await requireProfile();
  const { data, error } = validateRewardInput(formData);
  if (error || !data) return { error: error ?? "Invalid input." };

  const reward = await prisma.reward.create({
    data: {
      profileId: profile.id,
      name: data.name,
      description: data.description,
      cost: data.cost,
    },
  });

  revalidatePath("/rewards");
  return { success: true, rewardId: reward.id };
}

export async function updateRewardAction(
  rewardId: string,
  formData: FormData
): Promise<RewardMutationResult> {
  const profile = await requireProfile();
  const existing = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!existing) return { error: "Reward not found." };
  if (existing.profileId !== profile.id) return { error: "Not your reward." };

  const { data, error } = validateRewardInput(formData);
  if (error || !data) return { error: error ?? "Invalid input." };

  await prisma.reward.update({
    where: { id: rewardId },
    data: {
      name: data.name,
      description: data.description,
      cost: data.cost,
    },
  });

  revalidatePath("/rewards");
  return { success: true, rewardId };
}

export async function deactivateRewardAction(rewardId: string): Promise<{ error: string } | { success: true }> {
  const profile = await requireProfile();
  const existing = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!existing) return { error: "Reward not found." };
  if (existing.profileId !== profile.id) return { error: "Not your reward." };

  await prisma.reward.update({
    where: { id: rewardId },
    data: { active: false },
  });

  revalidatePath("/rewards");
  return { success: true };
}
