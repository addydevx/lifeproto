import { Skeleton, SkeletonPanel, LoadingBar } from "@/components/hud/Skeleton";

export default function SkillsLoading() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <LoadingBar label="SKILL MATRIX // LOADING" />
        <Skeleton className="h-8 w-60 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <SkeletonPanel label="VITAL MATRIX">
        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-[5px] w-full" />
              <div className="flex justify-between border-l border-cyan/15 pl-3">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-2.5 w-28" />
              </div>
            </div>
          ))}
        </div>
      </SkeletonPanel>
    </div>
  );
}
