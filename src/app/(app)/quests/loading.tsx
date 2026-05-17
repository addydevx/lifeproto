import { Skeleton, LoadingBar } from "@/components/hud/Skeleton";

export default function QuestsLoading() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <LoadingBar label="QUEST LOG // LOADING" />
        <Skeleton className="h-8 w-72 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="mb-6 flex items-center justify-end">
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border border-vital-quest/30 bg-vital-quest/[0.04] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-[3px] w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
