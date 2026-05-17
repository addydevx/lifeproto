"use server";

import { prisma } from "@/lib/db/prisma";
import { requireProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function completeOnboardingAction(): Promise<{ success: true }> {
  const profile = await requireProfile();
  await prisma.profile.update({
    where: { id: profile.id },
    data: { onboardedAt: new Date() },
  });
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: true };
}

export async function restartOnboardingAction(): Promise<{ success: true }> {
  const profile = await requireProfile();
  await prisma.profile.update({
    where: { id: profile.id },
    data: { onboardedAt: null },
  });
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: true };
}
