"use client";

import { calculateLevel, formatXP } from "@/lib/utils";
import { motion } from "framer-motion";

interface XPGaugeProps {
  totalXp: number;
  rank?: string;
}

export function XPGauge({ totalXp, rank = "ASCENDANT" }: XPGaugeProps) {
  const { level, current, required, progress } = calculateLevel(totalXp);

  return (
    <div className="flex items-center gap-4">
      {/* Level badge */}
      <div className="relative flex h-14 w-14 items-center justify-center border border-cyan bg-cyan/10">
        <div className="absolute inset-0.5 border border-cyan/30" />
        <span className="font-mono text-xl font-bold text-cyan text-glow-cyan">
          {String(level).padStart(2, "0")}
        </span>
      </div>

      {/* Info + progress */}
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex items-baseline gap-2">
          <span className="font-display text-sm font-bold tracking-wider text-fg-primary">
            LVL {level}
          </span>
          <span className="hud-label text-cyan">// {rank}</span>
        </div>
        <div className="mb-1.5 font-mono text-[10px] tracking-wider text-fg-tertiary">
          {formatXP(current)} / {formatXP(required)} XP
        </div>
        <div className="relative h-1 w-full bg-ink-700">
          <motion.div
            className="absolute inset-y-0 left-0 bg-cyan shadow-[0_0_8px_rgba(0,229,255,0.8)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </div>
      </div>
    </div>
  );
}
