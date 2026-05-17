import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton block with a cyan-tinted shimmer.
 * Use for any rectangular content placeholder.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-ink-700/40",
        "after:absolute after:inset-0 after:-translate-x-full",
        "after:animate-[shimmer_1.6s_infinite]",
        "after:bg-gradient-to-r after:from-transparent after:via-cyan/10 after:to-transparent",
        className
      )}
    />
  );
}

/**
 * Skeleton version of a HUD panel — corner brackets, label, blank interior.
 */
interface SkeletonPanelProps {
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SkeletonPanel({ label, className, children }: SkeletonPanelProps) {
  return (
    <div className={cn("hud-panel hud-corners relative", className)}>
      {label && (
        <div className="flex items-center justify-between border-b border-cyan/15 px-4 py-2">
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan/30" />
            <span className="hud-label text-fg-muted">{label}</span>
          </div>
          <span className="hud-label text-fg-muted">// --</span>
        </div>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * Animated boot bar — for the top of a loading page.
 * Visually communicates "system loading" without being a spinner.
 */
export function LoadingBar({ label = "LOADING MODULE" }: { label?: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
      <span className="font-mono text-[10px] tracking-[0.3em] text-cyan">{label}</span>
      <div className="flex-1 max-w-xs relative h-px bg-cyan/15 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1/3 bg-cyan/60 animate-[boot-progress_1.2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
