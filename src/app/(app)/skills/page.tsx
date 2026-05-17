import { HUDPanel } from "@/components/hud/HUDPanel";
import { StatBar } from "@/components/hud/StatBar";
import { GlitchText } from "@/components/hud/GlitchText";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const profile = await requireProfile();
  const stats = profile.stats ?? { health: 10, mind: 10, discipline: 10, social: 10 };

  // Last 30 days of completions, grouped by vital
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

  const recentCompletions = await prisma.taskCompletion.findMany({
    where: { profileId: profile.id, completedAt: { gte: thirtyDaysAgo } },
    select: { vital: true, vitalGained: true, xpAwarded: true },
  });

  const byVital = { health: 0, mind: 0, discipline: 0, social: 0 };
  const xpByVital = { health: 0, mind: 0, discipline: 0, social: 0 };
  for (const c of recentCompletions) {
    byVital[c.vital] += c.vitalGained;
    xpByVital[c.vital] += c.xpAwarded;
  }

  const tiles = [
    { label: "HEALTH", vital: "health" as const, value: stats.health, gained: byVital.health, xp: xpByVital.health },
    { label: "MIND", vital: "mind" as const, value: stats.mind, gained: byVital.mind, xp: xpByVital.mind },
    { label: "DISCIPLINE", vital: "discipline" as const, value: stats.discipline, gained: byVital.discipline, xp: xpByVital.discipline },
    { label: "SOCIAL", vital: "social" as const, value: stats.social, gained: byVital.social, xp: xpByVital.social },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <div className="mb-1 font-mono text-[11px] tracking-[0.25em] text-cyan">// SKILL MATRIX</div>
        <h1 className="font-display text-3xl font-bold tracking-wide text-fg-primary">
          STAT <GlitchText className="text-cyan" as="span">PROGRESSION</GlitchText>
        </h1>
        <p className="mt-1 text-sm text-fg-secondary">
          Vitals you&apos;ve built in the last 30 days. Full skill tree with sub-skills lands in Phase 4.
        </p>
      </div>

      <HUDPanel label="VITAL MATRIX">
        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          {tiles.map((t, i) => (
            <div key={t.label} className="space-y-2">
              <StatBar label={t.label} value={t.value} vital={t.vital} size="lg" delay={i * 0.08} max={Math.max(100, t.value)} />
              <div className="flex items-center justify-between border-l border-current pl-3 font-mono text-[10px] tracking-wider"
                style={{ borderColor: "rgba(0, 229, 255, 0.2)" }}
              >
                <span className="text-fg-tertiary">LAST 30 DAYS</span>
                <span className="text-fg-secondary">
                  +{t.gained} VIT · +{t.xp.toLocaleString()} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </HUDPanel>
    </div>
  );
}
