import { prisma } from "@/lib/db/prisma";
import type { Vital } from "@prisma/client";

// "Today" in the user's local timezone — but server-rendered, so we use UTC.
// Good enough for v1. Later we'll store user's timezone on Profile.
function startOfDayUTC(d: Date = new Date()): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function endOfDayUTC(d: Date = new Date()): Date {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}

export interface DashboardTask {
  id: string;
  title: string;
  description: string | null;
  status: "complete" | "pending";
  xp: number;
  vital: Vital;
  vitalGain: number;
  cadence: "daily" | "weekly" | "oneshot";
}

export async function getDashboardData(profileId: string) {
  const todayStart = startOfDayUTC();
  const todayEnd = endOfDayUTC();

  // Window for weekly telemetry: last 7 days (today + 6 prior)
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

  const [activeTasks, completionsToday, weeklyCompletions, activeQuests] =
    await Promise.all([
      prisma.task.findMany({
        where: { profileId, active: true, cadence: "daily" },
        orderBy: { createdAt: "asc" },
      }),
      prisma.taskCompletion.findMany({
        where: {
          profileId,
          completedAt: { gte: todayStart, lte: todayEnd },
        },
        select: { taskId: true },
      }),
      prisma.taskCompletion.findMany({
        where: {
          profileId,
          completedAt: { gte: sevenDaysAgo, lte: todayEnd },
        },
        select: { completedAt: true, xpAwarded: true },
      }),
      prisma.quest.findMany({
        where: { profileId, status: "active" },
        include: {
          chapters: { orderBy: { order: "asc" } },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

  const completedTaskIds = new Set(completionsToday.map((c) => c.taskId));

  const tasks: DashboardTask[] = activeTasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: completedTaskIds.has(t.id) ? "complete" : "pending",
    xp: t.xp,
    vital: t.vital,
    vitalGain: t.vitalGain,
    cadence: t.cadence,
  }));

  // Aggregate XP by day for the weekly bar chart
  const weeklyXpByDay: number[] = Array(7).fill(0);
  for (const c of weeklyCompletions) {
    const dayStart = startOfDayUTC(c.completedAt);
    const dayIndex = Math.floor(
      (dayStart.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (dayIndex >= 0 && dayIndex < 7) {
      weeklyXpByDay[dayIndex] += c.xpAwarded;
    }
  }
  const weeklyXpTotal = weeklyXpByDay.reduce((a, b) => a + b, 0);

  // Quest progress = completed chapters / total chapters
  const quests = activeQuests.map((q) => {
    const total = q.chapters.length;
    const done = q.chapters.filter((c) => c.completed).length;
    return {
      id: q.id,
      codename: q.codename,
      description: q.description,
      currentChapter: Math.min(done + 1, total),
      totalChapters: total,
      progress: total > 0 ? done / total : 0,
      reward: q.reward ?? undefined,
    };
  });

  return { tasks, quests, weeklyXpByDay, weeklyXpTotal };
}

/**
 * Streak combo multiplier curve. Capped so it can't go infinite.
 * 0 days = 1.0x, 7 days = 1.5x, 14 days = 2.0x, 30 days = 3.0x, 60+ = 4.0x cap.
 */
export function streakMultiplier(streak: number): number {
  if (streak <= 0) return 1.0;
  if (streak >= 60) return 4.0;
  return Math.min(4.0, 1 + Math.log10(1 + streak) * 1.6);
}

/**
 * Returns boolean[] for last 7 days indicating if any task was completed that day.
 * Used by the streak combo display.
 */
export async function getWeekProgress(profileId: string): Promise<boolean[]> {
  const todayStart = startOfDayUTC();
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

  const completions = await prisma.taskCompletion.findMany({
    where: { profileId, completedAt: { gte: sevenDaysAgo } },
    select: { completedAt: true },
  });

  const week: boolean[] = Array(7).fill(false);
  for (const c of completions) {
    const dayStart = startOfDayUTC(c.completedAt);
    const dayIndex = Math.floor(
      (dayStart.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (dayIndex >= 0 && dayIndex < 7) week[dayIndex] = true;
  }
  return week;
}
