import { HUDPanel } from "@/components/hud/HUDPanel";
import { XPGauge } from "@/components/hud/XPGauge";
import { GlitchText } from "@/components/hud/GlitchText";
import { ReplayTourButton } from "@/components/hud/ReplayTourButton";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await requireProfile();

  const [totalCompletions, totalRedemptions] = await Promise.all([
    prisma.taskCompletion.count({ where: { profileId: profile.id } }),
    prisma.redemption.aggregate({
      where: { profileId: profile.id },
      _sum: { xpSpent: true },
      _count: true,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 font-mono text-[11px] tracking-[0.25em] text-cyan">
            // OPERATOR PROFILE
          </div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-fg-primary">
            <GlitchText className="text-cyan text-glow-cyan" as="span">
              {profile.callsign}
            </GlitchText>
          </h1>
          <p className="mt-1 font-mono text-xs text-fg-tertiary">
            ENLISTED // {profile.createdAt.toISOString().split("T")[0]}
          </p>
        </div>
        <ReplayTourButton />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HUDPanel label="OPERATOR STATUS">
          <div className="p-5">
            <XPGauge totalXp={profile.totalXp} rank={profile.rank} />
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-cyan/15 pt-4">
              <div>
                <div className="hud-label mb-1">CURRENT STREAK</div>
                <div className="font-display text-xl font-bold text-magenta">
                  {profile.streak} <span className="text-xs text-fg-tertiary">DAYS</span>
                </div>
              </div>
              <div>
                <div className="hud-label mb-1">LONGEST STREAK</div>
                <div className="font-display text-xl font-bold text-vital-quest">
                  {profile.longestStreak} <span className="text-xs text-fg-tertiary">DAYS</span>
                </div>
              </div>
            </div>
          </div>
        </HUDPanel>

        <HUDPanel label="LIFETIME TELEMETRY">
          <div className="grid grid-cols-2 gap-4 p-5">
            <div>
              <div className="hud-label mb-1">DIRECTIVES COMPLETED</div>
              <div className="font-display text-2xl font-bold text-cyan">
                {totalCompletions.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="hud-label mb-1">XP EARNED</div>
              <div className="font-display text-2xl font-bold text-vital-discipline">
                {profile.totalXp.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="hud-label mb-1">REWARDS REDEEMED</div>
              <div className="font-display text-2xl font-bold text-vital-quest">
                {totalRedemptions._count}
              </div>
            </div>
            <div>
              <div className="hud-label mb-1">XP SPENT</div>
              <div className="font-display text-2xl font-bold text-magenta">
                {(totalRedemptions._sum.xpSpent ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        </HUDPanel>
      </div>
    </div>
  );
}
