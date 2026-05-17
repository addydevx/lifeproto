import { HUDPanel } from "@/components/hud/HUDPanel";
import { XPGauge } from "@/components/hud/XPGauge";
import { StreakDisplay } from "@/components/hud/StreakDisplay";
import { StatBar } from "@/components/hud/StatBar";
import { DirectivesPanel, type DirectiveItem } from "@/components/hud/DirectivesPanel";
import { QuestCard } from "@/components/hud/QuestCard";
import { GlitchText } from "@/components/hud/GlitchText";
import { OnboardingTour } from "@/components/hud/OnboardingTour";
import { requireProfile } from "@/lib/auth";
import { getDashboardData, getWeekProgress, streakMultiplier } from "@/lib/db/queries";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const [data, weekProgress] = await Promise.all([
    getDashboardData(profile.id),
    getWeekProgress(profile.id),
  ]);

  const completedToday = data.tasks.filter((t) => t.status === "complete").length;
  const totalToday = data.tasks.length;
  const xpEarnedToday = data.tasks
    .filter((t) => t.status === "complete")
    .reduce((sum, t) => sum + t.xp, 0);

  const stats = profile.stats ?? { health: 10, mind: 10, discipline: 10, social: 10 };
  const multiplier = streakMultiplier(profile.streak);

  const directives: DirectiveItem[] = data.tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    isComplete: t.status === "complete",
    xp: t.xp,
    vital: t.vital,
    vitalGain: t.vitalGain,
    cadence: t.cadence,
  }));

  return (
    <div className="mx-auto max-w-7xl">
      <OnboardingTour show={!profile.onboardedAt} />
      <div className="mb-8">
        <div className="mb-1 font-mono text-[11px] tracking-[0.25em] text-cyan">
          // OPERATOR DASHBOARD
        </div>
        <h1 className="font-display text-3xl font-bold tracking-wide text-fg-primary">
          WELCOME BACK,{" "}
          <GlitchText className="text-cyan text-glow-cyan" as="span">
            {profile.callsign}
          </GlitchText>
        </h1>
        <p className="mt-1 text-sm text-fg-secondary">
          {totalToday === 0
            ? "No directives yet. Create your first one below to start earning XP."
            : `${completedToday} of ${totalToday} directives complete today · +${xpEarnedToday} XP earned`}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HUDPanel label="PROFILE">
          <div className="p-5">
            <XPGauge totalXp={profile.totalXp} rank={profile.rank} />
          </div>
        </HUDPanel>

        <HUDPanel label="STREAK" status={profile.streak > 0 ? "critical" : "idle"}>
          <div className="p-5">
            <StreakDisplay
              days={profile.streak}
              multiplier={multiplier}
              weekProgress={weekProgress}
            />
          </div>
        </HUDPanel>
      </div>

      <div className="mb-6">
        <HUDPanel label="VITAL MATRIX" status="active">
          <div className="grid grid-cols-2 gap-5 p-5 md:grid-cols-4">
            <StatBar label="HEALTH" value={stats.health} vital="health" delay={0.1} />
            <StatBar label="MIND" value={stats.mind} vital="mind" delay={0.15} />
            <StatBar label="DISCIPLINE" value={stats.discipline} vital="discipline" delay={0.2} />
            <StatBar label="SOCIAL" value={stats.social} vital="social" delay={0.25} />
          </div>
        </HUDPanel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <HUDPanel
            label={
              totalToday === 0
                ? "DAILY DIRECTIVES"
                : `DAILY DIRECTIVES // ${completedToday} OF ${totalToday}`
            }
          >
            <DirectivesPanel directives={directives} />
          </HUDPanel>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <HUDPanel label="ACTIVE QUESTS">
            <div className="space-y-3 p-4">
              {data.quests.length === 0 ? (
                <div className="py-6 text-center">
                  <div className="font-mono text-xs text-fg-tertiary">NO ACTIVE QUESTS</div>
                  <Link
                    href="/quests"
                    className="mt-2 inline-block font-mono text-[11px] tracking-wider text-vital-quest hover:underline"
                  >
                    INITIATE QUEST →
                  </Link>
                </div>
              ) : (
                data.quests.map((q) => <QuestCard key={q.id} {...q} />)
              )}
            </div>
          </HUDPanel>

          <HUDPanel label="WEEKLY TELEMETRY">
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="hud-label mb-1">TOTAL XP // 7 DAYS</div>
                  <div className="font-display text-2xl font-bold text-cyan text-glow-cyan">
                    +{data.weeklyXpTotal.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-vital-health">
                  <TrendingUp className="h-3 w-3" />
                  <span className="font-mono text-xs">7D</span>
                </div>
              </div>
              <WeeklyChart data={data.weeklyXpByDay} />
            </div>
          </HUDPanel>
        </div>
      </div>
    </div>
  );
}

function WeeklyChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const labels = ["−6", "−5", "−4", "−3", "−2", "−1", "TDY"];
  return (
    <>
      <div className="flex h-12 items-end gap-1">
        {data.map((v, i) => {
          const h = max > 0 ? Math.max(2, (v / max) * 100) : 2;
          return (
            <div
              key={i}
              title={`${v} XP`}
              className="flex-1 bg-cyan/30 transition-all hover:bg-cyan"
              style={{ height: `${h}%` }}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[9px] tracking-wider text-fg-muted">
        {labels.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
    </>
  );
}
