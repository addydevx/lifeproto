"use client";

import { create } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import { GlitchText } from "@/components/hud/GlitchText";
import { useEffect } from "react";

export type CelebrationType = "level_up" | "quest_complete" | "streak_milestone";

export interface Celebration {
  type: CelebrationType;
  title: string;
  subtitle: string;
  /** e.g. "LVL 07" or "14 DAYS" */
  badge?: string;
}

interface CelebrationStore {
  active: Celebration | null;
  show: (c: Celebration) => void;
  dismiss: () => void;
}

export const useCelebration = create<CelebrationStore>((set) => ({
  active: null,
  show: (c) => set({ active: c }),
  dismiss: () => set({ active: null }),
}));

const typeStyles = {
  level_up: {
    accent: "#00e5ff", // cyan
    bgAccent: "rgba(0, 229, 255, 0.15)",
    label: "// SYSTEM ASCENSION",
  },
  quest_complete: {
    accent: "#be64ff", // quest purple
    bgAccent: "rgba(190, 100, 255, 0.15)",
    label: "// QUEST CLEARED",
  },
  streak_milestone: {
    accent: "#ff0080", // magenta
    bgAccent: "rgba(255, 0, 128, 0.15)",
    label: "// STREAK MILESTONE",
  },
} as const;

export function CelebrationOverlay() {
  const active = useCelebration((s) => s.active);
  const dismiss = useCelebration((s) => s.dismiss);

  // Auto-dismiss after 3.5s; allow Esc / click to close earlier
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => dismiss(), 3500);
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [active, dismiss]);

  if (!active) return null;
  const style = typeStyles[active.type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/85 backdrop-blur-md"
        onClick={dismiss}
      >
        {/* Animated radial pulse */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, ${style.bgAccent} 0%, transparent 60%)`,
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 0.6] }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Scan line sweep */}
        <motion.div
          className="absolute left-0 right-0 h-px"
          style={{ background: style.accent, boxShadow: `0 0 20px ${style.accent}` }}
          initial={{ top: "0%" }}
          animate={{ top: "100%" }}
          transition={{ duration: 1.5, ease: "linear", repeat: 1 }}
        />

        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative z-10 max-w-md px-8 py-10 text-center"
          style={{
            border: `1px solid ${style.accent}`,
            background: "rgba(10, 14, 26, 0.9)",
            boxShadow: `0 0 60px ${style.bgAccent}, inset 0 0 30px ${style.bgAccent}`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* corner brackets */}
          {[
            "top-0 left-0 border-t border-l",
            "top-0 right-0 border-t border-r",
            "bottom-0 left-0 border-b border-l",
            "bottom-0 right-0 border-b border-r",
          ].map((pos) => (
            <span
              key={pos}
              className={`absolute h-3 w-3 ${pos}`}
              style={{ borderColor: style.accent }}
            />
          ))}

          <div
            className="mb-3 font-mono text-[10px] tracking-[0.3em]"
            style={{ color: style.accent }}
          >
            {style.label}
          </div>

          {active.badge && (
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
              className="mx-auto mb-4 inline-flex items-center justify-center border-2 px-6 py-3"
              style={{ borderColor: style.accent, color: style.accent }}
            >
              <span
                className="font-display text-3xl font-black tracking-wider"
                style={{ textShadow: `0 0 20px ${style.accent}` }}
              >
                {active.badge}
              </span>
            </motion.div>
          )}

          <h2 className="mb-2 font-display text-3xl font-black tracking-wider text-fg-primary">
            <GlitchText className="inline-block" as="span">
              {active.title}
            </GlitchText>
          </h2>
          <p className="font-mono text-sm tracking-wider text-fg-secondary">{active.subtitle}</p>

          <button
            onClick={dismiss}
            className="mt-6 font-mono text-[10px] tracking-[0.25em] text-fg-tertiary hover:text-fg-primary"
          >
            PRESS ESC OR CLICK TO DISMISS
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
