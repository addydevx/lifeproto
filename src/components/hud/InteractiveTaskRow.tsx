"use client";

import { useTransition, useState } from "react";
import { motion } from "framer-motion";
import { Check, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { completeTaskAction, uncompleteTaskAction } from "@/actions/tasks";

type Vital = "health" | "mind" | "discipline" | "social";

interface InteractiveTaskRowProps {
  id: string;
  title: string;
  isComplete: boolean;
  xp: number;
  vital: Vital;
  vitalGain: number;
  delay?: number;
}

const vitalAccent: Record<Vital, { border: string; bg: string; text: string }> = {
  health: { border: "border-l-vital-health", bg: "bg-vital-health/[0.04]", text: "text-vital-health" },
  mind: { border: "border-l-vital-mind", bg: "bg-vital-mind/[0.04]", text: "text-vital-mind" },
  discipline: { border: "border-l-vital-discipline", bg: "bg-vital-discipline/[0.04]", text: "text-vital-discipline" },
  social: { border: "border-l-vital-social", bg: "bg-vital-social/[0.04]", text: "text-vital-social" },
};

export function InteractiveTaskRow({
  id,
  title,
  isComplete,
  xp,
  vital,
  vitalGain,
  delay = 0,
}: InteractiveTaskRowProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const accent = vitalAccent[vital];

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = isComplete
        ? await uncompleteTaskAction(id)
        : await completeTaskAction(id);
      if (result && "error" in result) {
        setError(result.error);
        setTimeout(() => setError(null), 3000);
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <button
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "group flex w-full items-center justify-between border-l-2 px-3.5 py-2.5",
          "text-left transition-all hover:bg-ink-800/60 disabled:opacity-60",
          accent.border,
          accent.bg
        )}
      >
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "font-display text-sm tracking-wide text-fg-primary",
              isComplete && "line-through opacity-40"
            )}
          >
            {title}
          </div>
          <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] tracking-wider">
            <span
              className={cn(
                "uppercase",
                isComplete ? "text-vital-health" : "text-fg-muted"
              )}
            >
              {isComplete ? "COMPLETE" : "PENDING"}
            </span>
            <span className="text-fg-muted">//</span>
            <span className="text-fg-secondary">+{xp} XP</span>
            <span className="text-fg-muted">//</span>
            <span className={accent.text}>
              {vital.toUpperCase()} +{vitalGain}
            </span>
          </div>
        </div>

        <div
          className="ml-3 flex h-5 w-5 items-center justify-center border border-current"
          style={{
            color: isComplete ? "rgb(0 255 157)" : "rgb(107 122 153)",
          }}
        >
          {isComplete ? (
            <Check className="h-3 w-3" strokeWidth={3} />
          ) : (
            <Circle className="h-2 w-2 fill-current" />
          )}
        </div>
      </button>

      {error && (
        <div className="mt-1 flex items-center gap-1.5 border-l-2 border-l-magenta bg-magenta/5 px-3.5 py-1.5">
          <AlertCircle className="h-3 w-3 text-magenta" />
          <span className="font-mono text-[10px] tracking-wider text-magenta">{error}</span>
        </div>
      )}
    </motion.div>
  );
}
