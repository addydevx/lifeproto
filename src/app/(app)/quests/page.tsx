import { GlitchText } from "@/components/hud/GlitchText";
import { QuestPanel, type QuestData } from "@/components/hud/QuestPanel";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function QuestsPage() {
  const profile = await requireProfile();
  const quests = await prisma.quest.findMany({
    where: { profileId: profile.id },
    include: { chapters: { orderBy: { order: "asc" } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const mapped: QuestData[] = quests.map((q) => ({
    id: q.id,
    codename: q.codename,
    description: q.description,
    totalXp: q.totalXp,
    reward: q.reward,
    status: q.status,
    chapters: q.chapters.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      order: c.order,
      completed: c.completed,
    })),
  }));

  const active = mapped.filter((q) => q.status === "active");
  const completed = mapped.filter((q) => q.status === "completed");
  const abandoned = mapped.filter((q) => q.status === "abandoned");

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <div className="mb-1 font-mono text-[11px] tracking-[0.25em] text-cyan">// QUEST LOG</div>
        <h1 className="font-display text-3xl font-bold tracking-wide text-fg-primary">
          ACTIVE <GlitchText className="text-vital-quest" as="span">QUEST LINES</GlitchText>
        </h1>
        <p className="mt-1 text-sm text-fg-secondary">
          Long-arc objectives broken into chapters. Complete chapters to earn XP and finish the quest.
        </p>
      </div>

      <QuestPanel active={active} completed={completed} abandoned={abandoned} />
    </div>
  );
}
