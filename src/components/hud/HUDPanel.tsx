import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface HUDPanelProps {
  children: ReactNode;
  label?: string;
  status?: "active" | "idle" | "critical";
  corners?: boolean;
  className?: string;
}

export function HUDPanel({
  children,
  label,
  status = "idle",
  corners = true,
  className,
}: HUDPanelProps) {
  const statusColor = {
    active: "bg-vital-health shadow-[0_0_8px_rgba(0,255,157,0.8)]",
    idle: "bg-cyan shadow-[0_0_8px_rgba(0,229,255,0.6)]",
    critical: "bg-magenta shadow-[0_0_8px_rgba(255,0,128,0.8)]",
  }[status];

  return (
    <div
      className={cn(
        "hud-panel",
        corners && "hud-corners",
        className
      )}
    >
      {label && (
        <div className="flex items-center justify-between border-b border-cyan/15 px-4 py-2">
          <div className="flex items-center gap-2.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", statusColor)} />
            <span className="hud-label">{label}</span>
          </div>
          <span className="hud-label text-fg-muted">
            //{String(Math.floor(Math.random() * 99)).padStart(2, "0")}
          </span>
        </div>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
