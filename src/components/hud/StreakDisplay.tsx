interface StreakDisplayProps {
  days: number;
  multiplier?: number;
  weekProgress?: boolean[]; // 7 entries, true = completed
}

export function StreakDisplay({
  days,
  multiplier = 1,
  weekProgress = [true, true, true, true, true, true, false],
}: StreakDisplayProps) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-4xl font-bold leading-none text-magenta text-glow-magenta">
          {days}
        </span>
        <div className="flex flex-col">
          <span className="hud-label text-magenta">
            DAYS // x{multiplier.toFixed(1)} COMBO
          </span>
          <span className="font-mono text-[10px] text-fg-muted">UNBROKEN</span>
        </div>
      </div>
      <div className="mt-3 flex gap-[3px]">
        {weekProgress.map((done, i) => (
          <div
            key={i}
            className={
              done
                ? "h-1.5 flex-1 bg-magenta shadow-[0_0_4px_rgba(255,0,128,0.6)]"
                : "h-1.5 flex-1 bg-magenta/15"
            }
          />
        ))}
      </div>
    </div>
  );
}
