"use server";

import { prisma } from "@/lib/db/prisma";
import { requireProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Vital, TaskCadence } from "@prisma/client";

function startOfDayUTC(d: Date = new Date()): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function daysBetween(a: Date, b: Date): number {
  const ms = startOfDayUTC(b).getTime() - startOfDayUTC(a).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export type CompleteTaskResult =
  | { error: string }
  | {
      success: true;
      xpAwarded: number;
      vitalGained: number;
      vital: string;
      newTotalXp: number;
      previousLevel: number;
      newLevel: number;
      leveledUp: boolean;
      previousStreak: number;
      newStreak: number;
      streakMilestone: number | null; // 7, 14, 30, 60, ... if hit
    };

/**
 * Marks a task complete for today.
 * Atomically:
 * - inserts TaskCompletion
 * - increments Profile.totalXp
 * - increments the relevant Stats vital
 * - updates Profile.streak based on lastActiveDate
 *
 * Idempotent: completing the same daily task twice in one day is a no-op (returns error).
 */
export async function completeTaskAction(taskId: string): Promise<CompleteTaskResult> {
  const profile = await requireProfile();
  const todayStart = startOfDayUTC();
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCHours(23, 59, 59, 999);

  // Fetch the task and verify ownership
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { error: "Directive not found." };
  if (task.profileId !== profile.id) return { error: "Not your directive." };
  if (!task.active) return { error: "Directive is archived." };

  // Already complete today?
  const existing = await prisma.taskCompletion.findFirst({
    where: {
      taskId,
      profileId: profile.id,
      completedAt: { gte: todayStart, lte: todayEnd },
    },
  });
  if (existing) return { error: "Already completed today." };

  // Streak math: if lastActiveDate was yesterday, increment streak.
  // If today, no change. If older or null, reset to 1.
  let newStreak = profile.streak;
  let newLongest = profile.longestStreak;
  const last = profile.lastActiveDate;
  if (!last) {
    newStreak = 1;
  } else {
    const diff = daysBetween(last, new Date());
    if (diff === 0) {
      // already counted today, keep streak
    } else if (diff === 1) {
      newStreak = profile.streak + 1;
    } else {
      // missed a day or more → reset
      newStreak = 1;
    }
  }
  if (newStreak > newLongest) newLongest = newStreak;

  // Do all writes in one transaction
  await prisma.$transaction(async (tx) => {
    await tx.taskCompletion.create({
      data: {
        taskId,
        profileId: profile.id,
        xpAwarded: task.xp,
        vitalGained: task.vitalGain,
        vital: task.vital,
      },
    });

    await tx.profile.update({
      where: { id: profile.id },
      data: {
        totalXp: { increment: task.xp },
        streak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: new Date(),
      },
    });

    // Stat increment — increment the column matching task.vital
    const statsUpdate: Record<string, { increment: number }> = {};
    statsUpdate[task.vital] = { increment: task.vitalGain };

    await tx.stats.update({
      where: { profileId: profile.id },
      data: statsUpdate,
    });
  });

  // Revalidate all pages that show task/profile/stat data
  revalidatePath("/dashboard");
  revalidatePath("/quests");
  revalidatePath("/skills");
  revalidatePath("/profile");
  revalidatePath("/rewards");

  // Compute level transitions for celebration detection
  const previousTotal = profile.totalXp;
  const newTotal = previousTotal + task.xp;
  const { level: previousLevel } = calculateLevelLite(previousTotal);
  const { level: newLevel } = calculateLevelLite(newTotal);

  const milestones = [7, 14, 30, 60, 100, 200, 365];
  const streakMilestone =
    newStreak > profile.streak && milestones.includes(newStreak) ? newStreak : null;

  return {
    success: true,
    xpAwarded: task.xp,
    vitalGained: task.vitalGain,
    vital: task.vital,
    newTotalXp: newTotal,
    previousLevel,
    newLevel,
    leveledUp: newLevel > previousLevel,
    previousStreak: profile.streak,
    newStreak,
    streakMilestone,
  };
}

// Local copy of the level curve from src/lib/utils.ts (Server Actions can't import client-bundled modules cleanly)
function calculateLevelLite(totalXp: number): { level: number; current: number; required: number } {
  let level = 1;
  let consumed = 0;
  let required = 500;
  while (consumed + required <= totalXp) {
    consumed += required;
    level += 1;
    required = Math.floor(500 * Math.pow(1.15, level - 1));
  }
  return { level, current: totalXp - consumed, required };
}

/**
 * Undo a task completion done today. For honest mistakes.
 * Reverses the XP, vital, and streak changes if it was today's only completion.
 */
export async function uncompleteTaskAction(taskId: string): Promise<{ error: string } | { success: true }> {
  const profile = await requireProfile();
  const todayStart = startOfDayUTC();
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCHours(23, 59, 59, 999);

  const completion = await prisma.taskCompletion.findFirst({
    where: {
      taskId,
      profileId: profile.id,
      completedAt: { gte: todayStart, lte: todayEnd },
    },
  });
  if (!completion) return { error: "No completion found for today." };

  await prisma.$transaction(async (tx) => {
    await tx.taskCompletion.delete({ where: { id: completion.id } });

    await tx.profile.update({
      where: { id: profile.id },
      data: { totalXp: { decrement: completion.xpAwarded } },
    });

    const statsUpdate: Record<string, { decrement: number }> = {};
    statsUpdate[completion.vital] = { decrement: completion.vitalGained };

    await tx.stats.update({
      where: { profileId: profile.id },
      data: statsUpdate,
    });
    // Note: we don't reverse the streak. Undoing isn't meant to be a "free reset."
  });

  revalidatePath("/dashboard");
  revalidatePath("/skills");
  revalidatePath("/profile");

  return { success: true };
}

// --- CRUD ---------------------------------------------------------------

export type TaskMutationResult =
  | { error: string }
  | { success: true; taskId: string };

interface TaskInput {
  title: string;
  description?: string;
  vital: string;
  vitalGain: number;
  xp: number;
  cadence: string;
}

function validateTaskInput(formData: FormData): { data?: TaskInput; error?: string } {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const vital = String(formData.get("vital") ?? "");
  const vitalGain = Number(formData.get("vitalGain") ?? 0);
  const xp = Number(formData.get("xp") ?? 0);
  const cadence = String(formData.get("cadence") ?? "");

  if (!title) return { error: "Title required." };
  if (title.length > 120) return { error: "Title too long (max 120)." };
  if (!["health", "mind", "discipline", "social"].includes(vital))
    return { error: "Invalid vital." };
  if (!Number.isInteger(vitalGain) || vitalGain < 0 || vitalGain > 10)
    return { error: "Vital gain must be 0-10." };
  if (!Number.isInteger(xp) || xp < 0 || xp > 1000)
    return { error: "XP must be 0-1000." };
  if (!["daily", "weekly", "oneshot"].includes(cadence))
    return { error: "Invalid cadence." };

  return { data: { title, description: description || undefined, vital, vitalGain, xp, cadence } };
}

export async function createTaskAction(formData: FormData): Promise<TaskMutationResult> {
  const profile = await requireProfile();
  const { data, error } = validateTaskInput(formData);
  if (error || !data) return { error: error ?? "Invalid input." };

  const task = await prisma.task.create({
    data: {
      profileId: profile.id,
      title: data.title,
      description: data.description,
      vital: data.vital as Vital,
      vitalGain: data.vitalGain,
      xp: data.xp,
      cadence: data.cadence as TaskCadence,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/quests");
  return { success: true, taskId: task.id };
}

export async function updateTaskAction(
  taskId: string,
  formData: FormData
): Promise<TaskMutationResult> {
  const profile = await requireProfile();
  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existing) return { error: "Directive not found." };
  if (existing.profileId !== profile.id) return { error: "Not your directive." };

  const { data, error } = validateTaskInput(formData);
  if (error || !data) return { error: error ?? "Invalid input." };

  await prisma.task.update({
    where: { id: taskId },
    data: {
      title: data.title,
      description: data.description,
      vital: data.vital as Vital,
      vitalGain: data.vitalGain,
      xp: data.xp,
      cadence: data.cadence as TaskCadence,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/quests");
  return { success: true, taskId };
}

export async function archiveTaskAction(taskId: string): Promise<{ error: string } | { success: true }> {
  const profile = await requireProfile();
  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existing) return { error: "Directive not found." };
  if (existing.profileId !== profile.id) return { error: "Not your directive." };

  await prisma.task.update({
    where: { id: taskId },
    data: { active: false },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
