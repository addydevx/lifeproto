"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTelemetry, type TelemetrySeverity } from "@/lib/stores/telemetry";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const severityConfig: Record<
  TelemetrySeverity,
  { border: string; text: string; bg: string; prefix: string }
> = {
  info: { border: "border-cyan/40", text: "text-cyan", bg: "bg-cyan/5", prefix: "INFO" },
  success: {
    border: "border-vital-health/40",
    text: "text-vital-health",
    bg: "bg-vital-health/5",
    prefix: "OK",
  },
  warning: {
    border: "border-vital-discipline/40",
    text: "text-vital-discipline",
    bg: "bg-vital-discipline/5",
    prefix: "WARN",
  },
  critical: {
    border: "border-magenta/40",
    text: "text-magenta",
    bg: "bg-magenta/5",
    prefix: "CRIT",
  },
};

export function TelemetryStrip() {
  const entries = useTelemetry((s) => s.entries);
  const dismiss = useTelemetry((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-40 flex w-full max-w-2xl -translate-x-1/2 flex-col-reverse items-center gap-2 px-4">
      <AnimatePresence mode="popLayout">
        {entries.slice(-3).map((e) => {
          const cfg = severityConfig[e.severity];
          return (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              className={cn(
                "pointer-events-auto relative flex w-full items-center gap-3 border bg-ink-950/95 px-4 py-2 backdrop-blur-md",
                cfg.border,
                cfg.bg
              )}
            >
              <span className={cn("font-mono text-[10px] tracking-[0.25em]", cfg.text)}>
                [{cfg.prefix}]
              </span>
              <div className="min-w-0 flex-1">
                <div className={cn("font-mono text-xs tracking-wider", cfg.text)}>
                  {e.message}
                  {e.xp !== undefined && (
                    <span className="ml-2 text-fg-secondary">+{e.xp} XP</span>
                  )}
                </div>
                {e.detail && (
                  <div className="font-mono text-[10px] text-fg-tertiary">{e.detail}</div>
                )}
              </div>
              <button
                onClick={() => dismiss(e.id)}
                className={cn("flex-shrink-0 transition-opacity hover:opacity-100 opacity-50", cfg.text)}
                aria-label="Dismiss"
              >
                <X className="h-3 w-3" />
              </button>
              {/* Auto-dismiss progress bar */}
              <motion.div
                className={cn("absolute bottom-0 left-0 h-px", cfg.text.replace("text-", "bg-"))}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
