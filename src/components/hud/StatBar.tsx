"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Vital = "health" | "mind" | "discipline" | "social" | "quest";

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  vital: Vital;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  delay?: number;
}

const vitalConfig: Record<Vital, { color: string; bg: string; glow: string }> = {
  health: {
    color: "text-vital-health",
    bg: "bg-vital-health",
    glow: "shadow-[0_0_8px_rgba(0,255,157,0.6)]",
  },
  mind: {
    color: "text-vital-mind",
    bg: "bg-vital-mind",
    glow: "shadow-[0_0_8px_rgba(0,229,255,0.6)]",
  },
  discipline: {
    color: "text-vital-discipline",
    bg: "bg-vital-discipline",
    glow: "shadow-[0_0_8px_rgba(255,170,0,0.6)]",
  },
  social: {
    color: "text-vital-social",
    bg: "bg-vital-social",
    glow: "shadow-[0_0_8px_rgba(255,0,128,0.6)]",
  },
  quest: {
    color: "text-vital-quest",
    bg: "bg-vital-quest",
    glow: "shadow-[0_0_8px_rgba(190,100,255,0.6)]",
  },
};

export function StatBar({
  label,
  value,
  max = 100,
  vital,
  showValue = true,
  size = "md",
  delay = 0,
}: StatBarProps) {
  const config = vitalConfig[vital];
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  const heights = {
    sm: "h-[2px]",
    md: "h-[3px]",
    lg: "h-[5px]",
  };

  // Tick marks every 10%
  const ticks = Array.from({ length: 9 }, (_, i) => (i + 1) * 10);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className={cn("hud-label", config.color)}>{label}</span>
        {showValue && (
          <span className="font-mono text-[11px] text-fg-primary">
            {Math.round(value)}
            <span className="text-fg-muted">/{max}</span>
          </span>
        )}
      </div>
      <div className={cn("relative w-full bg-ink-700/60", heights[size])}>
        <motion.div
          className={cn("absolute inset-y-0 left-0", config.bg, config.glow)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay, ease: [0.2, 0.8, 0.2, 1] }}
        />
        {/* Tick overlay */}
        <div className="pointer-events-none absolute inset-0 flex">
          {ticks.map((t) => (
            <div
              key={t}
              className="border-l border-ink-900/80"
              style={{ marginLeft: `${t === 10 ? 10 : 10}%`, width: 0 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
