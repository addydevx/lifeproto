import { HUDPanel } from "@/components/hud/HUDPanel";
import { GlitchText } from "@/components/hud/GlitchText";
import { RewardsPanel } from "@/components/hud/RewardsPanel";
import { requireProfile } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const profile = await requireProfile();

  const [rewards, recentRedemptions] = await Promise.all([
    prisma.reward.findMany({
      where: { profileId: profile.id, active: true },
      orderBy: { cost: "asc" },
    }),
    prisma.redemption.findMany({
      where: { profileId: profile.id },
      include: { reward: true },
      orderBy: { redeemedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-1 font-mono text-[11px] tracking-[0.25em] text-cyan">// REWARD CACHE</div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-fg-primary">
            CASH IN <GlitchText className="text-vital-discipline" as="span">YOUR XP</GlitchText>
          </h1>
          <p className="mt-1 text-sm text-fg-secondary">
            The things you love, gated behind the things you should do.
          </p>
        </div>
        <div className="border border-vital-discipline/40 bg-vital-discipline/5 px-4 py-2">
          <div className="hud-label text-vital-discipline">AVAILABLE BALANCE</div>
          <div className="font-display text-xl font-bold text-vital-discipline">
            {profile.totalXp.toLocaleString()} XP
          </div>
        </div>
      </div>

      <RewardsPanel
        rewards={rewards.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          cost: r.cost,
        }))}
        currentXp={profile.totalXp}
      />

      {recentRedemptions.length > 0 && (
        <div className="mt-6">
          <HUDPanel label="REDEMPTION HISTORY">
            <div className="divide-y divide-cyan/10 p-2">
              {recentRedemptions.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-3 py-2.5">
                  <div>
                    <div className="font-mono text-xs text-fg-primary">{r.reward.name}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-fg-muted">
                      {r.redeemedAt.toLocaleString()}
                    </div>
                  </div>
                  <div className="font-mono text-xs text-magenta">
                    −{r.xpSpent.toLocaleString()} XP
                  </div>
                </div>
              ))}
            </div>
          </HUDPanel>
        </div>
      )}
    </div>
  );
}
