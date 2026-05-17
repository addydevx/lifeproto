"use client";

import { cn } from "@/lib/utils";
import { Check, Circle, Clock } from "lucide-react";
import { motion } from "framer-motion";

type TaskStatus = "complete" | "active" | "pending";
type Vital = "health" | "mind" | "discipline" | "social";

interface TaskRowProps {
  title: string;
  status: TaskStatus;
  xp: number;
  vital: Vital;
  vitalGain: number;
  delay?: number;
  onToggle?: () => void;
}

const vitalAccent: Record<Vital, { border: string; bg: string; text: string }> = {
  health: {
    border: "border-l-vital-health",
    bg: "bg-vital-health/[0.04]",
    text: "text-vital-health",
  },
  mind: {
    border: "border-l-vital-mind",
    bg: "bg-vital-mind/[0.04]",
    text: "text-vital-mind",
  },
  discipline: {
    border: "border-l-vital-discipline",
    bg: "bg-vital-discipline/[0.04]",
    text: "text-vital-discipline",
  },
  social: {
    border: "border-l-vital-social",
    bg: "bg-vital-social/[0.04]",
    text: "text-vital-social",
  },
};

export function TaskRow({
  title,
  status,
  xp,
  vital,
  vitalGain,
  delay = 0,
  onToggle,
}: TaskRowProps) {
  const accent = vitalAccent[vital];
  const isDone = status === "complete";

  return (
    <motion.button
      onClick={onToggle}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn(
        "group flex w-full items-center justify-between border-l-2 px-3.5 py-2.5",
        "text-left transition-all hover:bg-ink-800/60",
        accent.border,
        accent.bg
      )}
    >
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "font-display text-sm tracking-wide text-fg-primary",
            isDone && "line-through opacity-40"
          )}
        >
          {title}
        </div>
        <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] tracking-wider">
          <span
            className={cn(
              "uppercase",
              status === "complete" && "text-vital-health",
              status === "active" && "text-cyan",
              status === "pending" && "text-fg-muted"
            )}
          >
            {status === "complete" && "COMPLETE"}
            {status === "active" && "ACTIVE"}
            {status === "pending" && "PENDING"}
          </span>
          <span className="text-fg-muted">//</span>
          <span className="text-fg-secondary">+{xp} XP</span>
          <span className="text-fg-muted">//</span>
          <span className={accent.text}>
            {vital.toUpperCase()} +{vitalGain}
          </span>
        </div>
      </div>

      <div className="ml-3 flex h-5 w-5 items-center justify-center border border-current text-current"
        style={{
          color: status === "complete"
            ? "rgb(0 255 157)"
            : status === "active"
              ? "rgb(0 229 255)"
              : "rgb(107 122 153)",
        }}
      >
        {status === "complete" && <Check className="h-3 w-3" strokeWidth={3} />}
        {status === "active" && <Clock className="h-3 w-3" />}
        {status === "pending" && <Circle className="h-2 w-2 fill-current" />}
      </div>
    </motion.button>
  );
}
