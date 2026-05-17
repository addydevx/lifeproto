import { Skeleton, LoadingBar } from "@/components/hud/Skeleton";

export default function RewardsLoading() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <LoadingBar label="REWARD CACHE // LOADING" />
          <Skeleton className="h-8 w-60 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="border border-vital-discipline/40 bg-vital-discipline/5 px-4 py-2 space-y-1.5">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-6 w-28" />
        </div>
      </div>

      <div className="mb-4 flex justify-end">
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-vital-discipline/30 bg-vital-discipline/[0.04] p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
