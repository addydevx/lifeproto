import { Skeleton, SkeletonPanel, LoadingBar } from "@/components/hud/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <LoadingBar label="OPERATOR DASHBOARD // LOADING" />
        <Skeleton className="h-8 w-72 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Profile + Streak row */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SkeletonPanel label="PROFILE">
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-1 w-full" />
              </div>
            </div>
          </div>
        </SkeletonPanel>
        <SkeletonPanel label="STREAK">
          <div className="p-5 space-y-3">
            <Skeleton className="h-10 w-40" />
            <div className="flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-1.5 flex-1" />
              ))}
            </div>
          </div>
        </SkeletonPanel>
      </div>

      {/* Vital matrix */}
      <div className="mb-6">
        <SkeletonPanel label="VITAL MATRIX">
          <div className="grid grid-cols-2 gap-5 p-5 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-2.5 w-20" />
                  <Skeleton className="h-2.5 w-10" />
                </div>
                <Skeleton className="h-[3px] w-full" />
              </div>
            ))}
          </div>
        </SkeletonPanel>
      </div>

      {/* Directives + quests */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SkeletonPanel label="DAILY DIRECTIVES">
            <div className="space-y-1.5 p-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="border-l-2 border-l-fg-muted/30 bg-ink-800/30 px-3.5 py-2.5 space-y-1.5"
                >
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-2.5 w-1/2" />
                </div>
              ))}
            </div>
          </SkeletonPanel>
        </div>
        <div className="space-y-4 lg:col-span-2">
          <SkeletonPanel label="ACTIVE QUESTS">
            <div className="space-y-3 p-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="border border-vital-quest/20 p-3 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-[3px] w-full" />
                </div>
              ))}
            </div>
          </SkeletonPanel>
          <SkeletonPanel label="WEEKLY TELEMETRY">
            <div className="p-4 space-y-3">
              <Skeleton className="h-7 w-24" />
              <div className="flex h-12 items-end gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton
  key={i}
  className="flex-1"
  style={{ height: `${30 + (i * 9) % 70}%` }}
/>
                ))}
              </div>
            </div>
          </SkeletonPanel>
        </div>
      </div>
    </div>
  );
}
