"use server";

import { prisma } from "@/lib/db/prisma";
import { requireProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type QuestMutationResult =
  | { error: string }
  | { success: true; questId: string };

interface QuestInput {
  codename: string;
  description: string;
  totalXp: number;
  reward?: string;
  chapters: { title: string; description?: string }[];
}

function validateQuestInput(formData: FormData): { data?: QuestInput; error?: string } {
  const codename = String(formData.get("codename") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const totalXp = Number(formData.get("totalXp") ?? 0);
  const reward = String(formData.get("reward") ?? "").trim();
  const chaptersRaw = String(formData.get("chapters") ?? "[]");

  if (!codename) return { error: "Codename required." };
  if (codename.length > 60) return { error: "Codename too long (max 60)." };
  if (!description) return { error: "Description required." };
  if (description.length > 500) return { error: "Description too long (max 500)." };
  if (!Number.isInteger(totalXp) || totalXp < 0 || totalXp > 100000)
    return { error: "Total XP must be 0-100000." };

  let chapters: { title: string; description?: string }[] = [];
  try {
    chapters = JSON.parse(chaptersRaw);
  } catch {
    return { error: "Chapter list malformed." };
  }
  if (!Array.isArray(chapters) || chapters.length === 0) {
    return { error: "At least one chapter required." };
  }
  if (chapters.length > 50) {
    return { error: "Max 50 chapters per quest." };
  }
  for (const c of chapters) {
    if (!c.title || typeof c.title !== "string") {
      return { error: "Each chapter needs a title." };
    }
    if (c.title.length > 120) {
      return { error: "Chapter title too long (max 120)." };
    }
  }

  return {
    data: {
      codename: codename.toUpperCase(),
      description,
      totalXp,
      reward: reward || undefined,
      chapters: chapters.map((c) => ({
        title: c.title.trim(),
        description: c.description?.trim() || undefined,
      })),
    },
  };
}

export async function createQuestAction(formData: FormData): Promise<QuestMutationResult> {
  const profile = await requireProfile();
  const { data, error } = validateQuestInput(formData);
  if (error || !data) return { error: error ?? "Invalid input." };

  const quest = await prisma.$transaction(async (tx) => {
    const created = await tx.quest.create({
      data: {
        profileId: profile.id,
        codename: data.codename,
        description: data.description,
        totalXp: data.totalXp,
        reward: data.reward,
        chapters: {
          create: data.chapters.map((c, i) => ({
            title: c.title,
            description: c.description,
            order: i,
          })),
        },
      },
    });
    return created;
  });

  revalidatePath("/quests");
  revalidatePath("/dashboard");
  return { success: true, questId: quest.id };
}

export async function updateQuestAction(
  questId: string,
  formData: FormData
): Promise<QuestMutationResult> {
  const profile = await requireProfile();
  const existing = await prisma.quest.findUnique({
    where: { id: questId },
    include: { chapters: true },
  });
  if (!existing) return { error: "Quest not found." };
  if (existing.profileId !== profile.id) return { error: "Not your quest." };

  const { data, error } = validateQuestInput(formData);
  if (error || !data) return { error: error ?? "Invalid input." };

  // Strategy for chapters on edit:
  // - Delete all existing INCOMPLETE chapters
  // - Keep completed chapters as-is (preserves history + XP already awarded)
  // - Add new chapters from the form for the still-incomplete slots
  //
  // This means: you can edit/reorder/add chapters that haven't been done yet,
  // but completed chapters are immutable. Trade-off: simpler than diffing.

  await prisma.$transaction(async (tx) => {
    await tx.quest.update({
      where: { id: questId },
      data: {
        codename: data.codename,
        description: data.description,
        totalXp: data.totalXp,
        reward: data.reward,
      },
    });

    const completedChapters = existing.chapters.filter((c) => c.completed);
    const completedCount = completedChapters.length;

    // Delete incomplete chapters
    await tx.questChapter.deleteMany({
      where: { questId, completed: false },
    });

    // Add new chapters from form, starting at order = completedCount
    // Form chapters replace the incomplete ones
    const newChapters = data.chapters.slice(completedCount);
    if (newChapters.length > 0) {
      await tx.questChapter.createMany({
        data: newChapters.map((c, i) => ({
          questId,
          title: c.title,
          description: c.description,
          order: completedCount + i,
        })),
      });
    }
  });

  revalidatePath("/quests");
  return { success: true, questId };
}

/**
 * Mark a quest chapter complete. Awards XP proportional to the quest's totalXp
 * divided by chapter count.
 */
export async function completeChapterAction(
  chapterId: string
): Promise<
  | { error: string }
  | {
      success: true;
      xpAwarded: number;
      questComplete: boolean;
      questCodename?: string;
      previousLevel: number;
      newLevel: number;
      leveledUp: boolean;
    }
> {
  const profile = await requireProfile();

  const chapter = await prisma.questChapter.findUnique({
    where: { id: chapterId },
    include: { quest: { include: { chapters: true } } },
  });
  if (!chapter) return { error: "Chapter not found." };
  if (chapter.quest.profileId !== profile.id) return { error: "Not your chapter." };
  if (chapter.completed) return { error: "Already complete." };
  if (chapter.quest.status !== "active") return { error: "Quest not active." };

  const xpPerChapter = Math.floor(chapter.quest.totalXp / Math.max(1, chapter.quest.chapters.length));

  // Will this be the last chapter?
  const remainingIncomplete = chapter.quest.chapters.filter(
    (c) => !c.completed && c.id !== chapterId
  ).length;
  const willComplete = remainingIncomplete === 0;

  await prisma.$transaction(async (tx) => {
    await tx.questChapter.update({
      where: { id: chapterId },
      data: { completed: true, completedAt: new Date() },
    });

    await tx.profile.update({
      where: { id: profile.id },
      data: { totalXp: { increment: xpPerChapter } },
    });

    if (willComplete) {
      await tx.quest.update({
        where: { id: chapter.questId },
        data: { status: "completed", completedAt: new Date() },
      });
    }
  });

  revalidatePath("/quests");
  revalidatePath("/dashboard");
  revalidatePath("/profile");

  const previousTotal = profile.totalXp;
  const newTotal = previousTotal + xpPerChapter;
  const previousLevel = calculateLevelLiteQ(previousTotal);
  const newLevel = calculateLevelLiteQ(newTotal);

  return {
    success: true,
    xpAwarded: xpPerChapter,
    questComplete: willComplete,
    questCodename: willComplete ? chapter.quest.codename : undefined,
    previousLevel,
    newLevel,
    leveledUp: newLevel > previousLevel,
  };
}

// Level curve, same as in tasks.ts
function calculateLevelLiteQ(totalXp: number): number {
  let level = 1;
  let consumed = 0;
  let required = 500;
  while (consumed + required <= totalXp) {
    consumed += required;
    level += 1;
    required = Math.floor(500 * Math.pow(1.15, level - 1));
  }
  return level;
}

export async function uncompleteChapterAction(
  chapterId: string
): Promise<{ error: string } | { success: true }> {
  const profile = await requireProfile();
  const chapter = await prisma.questChapter.findUnique({
    where: { id: chapterId },
    include: { quest: { include: { chapters: true } } },
  });
  if (!chapter) return { error: "Chapter not found." };
  if (chapter.quest.profileId !== profile.id) return { error: "Not your chapter." };
  if (!chapter.completed) return { error: "Not complete." };

  const xpPerChapter = Math.floor(chapter.quest.totalXp / Math.max(1, chapter.quest.chapters.length));

  await prisma.$transaction(async (tx) => {
    await tx.questChapter.update({
      where: { id: chapterId },
      data: { completed: false, completedAt: null },
    });
    await tx.profile.update({
      where: { id: profile.id },
      data: { totalXp: { decrement: xpPerChapter } },
    });
    // Re-open quest if it was marked complete
    if (chapter.quest.status === "completed") {
      await tx.quest.update({
        where: { id: chapter.questId },
        data: { status: "active", completedAt: null },
      });
    }
  });

  revalidatePath("/quests");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function abandonQuestAction(questId: string): Promise<{ error: string } | { success: true }> {
  const profile = await requireProfile();
  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (!quest) return { error: "Quest not found." };
  if (quest.profileId !== profile.id) return { error: "Not your quest." };

  await prisma.quest.update({
    where: { id: questId },
    data: { status: "abandoned" },
  });

  revalidatePath("/quests");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteQuestAction(questId: string): Promise<{ error: string } | { success: true }> {
  const profile = await requireProfile();
  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (!quest) return { error: "Quest not found." };
  if (quest.profileId !== profile.id) return { error: "Not your quest." };

  // Note: this deletes all chapters too via onDelete: Cascade.
  // XP already awarded for completed chapters is NOT clawed back — that's a deliberate choice.
  await prisma.quest.delete({ where: { id: questId } });

  revalidatePath("/quests");
  return { success: true };
}
