import { Skeleton, SkeletonPanel, LoadingBar } from "@/components/hud/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <LoadingBar label="OPERATOR PROFILE // LOADING" />
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-7 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SkeletonPanel label="OPERATOR STATUS">
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-1 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-cyan/15 pt-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-2.5 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </div>
        </SkeletonPanel>

        <SkeletonPanel label="LIFETIME TELEMETRY">
          <div className="grid grid-cols-2 gap-4 p-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-2.5 w-28" />
                <Skeleton className="h-7 w-20" />
              </div>
            ))}
          </div>
        </SkeletonPanel>
      </div>
    </div>
  );
}
