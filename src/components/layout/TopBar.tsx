import { SystemClock } from "@/components/hud/SystemClock";
import { Wifi, Activity, Zap } from "lucide-react";
import { getProfile } from "@/lib/auth";

export async function TopBar() {
  const profile = await getProfile();

  return (
    <header className="sticky top-0 z-30 border-b border-cyan/15 bg-ink-950/70 backdrop-blur-md">
      <div className="flex h-12 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 idle-glitch">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
            <span className="hud-label text-cyan">
              {profile ? `${profile.callsign} // ACTIVE` : "OPERATOR // ACTIVE"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden items-center gap-1.5 font-mono text-[10px] tracking-wider text-fg-tertiary md:flex">
            <Wifi className="h-3 w-3 text-vital-health" />
            <span>NET OK</span>
          </div>
          <div className="hidden items-center gap-1.5 font-mono text-[10px] tracking-wider text-fg-tertiary md:flex">
            <Activity className="h-3 w-3 text-cyan" />
            <span>SYNC OK</span>
          </div>
          {profile && (
            <div className="hidden items-center gap-1.5 font-mono text-[10px] tracking-wider text-fg-tertiary md:flex">
              <Zap className="h-3 w-3 text-vital-discipline" />
              <span>{profile.totalXp.toLocaleString()} XP</span>
            </div>
          )}
          <SystemClock />
        </div>
      </div>
    </header>
  );
}
