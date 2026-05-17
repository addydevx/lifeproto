"use client";

import { create } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FloatingXP {
  id: string;
  xp: number;
  x: number;
  y: number;
  variant: "xp" | "vital" | "loss";
  label?: string;
}

interface FloatingStore {
  items: FloatingXP[];
  spawn: (opts: Omit<FloatingXP, "id">) => void;
  remove: (id: string) => void;
}

let nextId = 0;

export const useFloatingXp = create<FloatingStore>((set) => ({
  items: [],
  spawn: (opts) => {
    const item: FloatingXP = { id: `fxp_${Date.now()}_${nextId++}`, ...opts };
    set((s) => ({ items: [...s.items, item] }));
    setTimeout(() => {
      set((s) => ({ items: s.items.filter((i) => i.id !== item.id) }));
    }, 1500);
  },
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));

/**
 * Helper to spawn an XP indicator at a clicked element.
 * Use in event handlers: spawnXpAt(event, xpAmount).
 */
export function spawnXpAt(
  e: { clientX: number; clientY: number },
  xp: number,
  variant: "xp" | "vital" | "loss" = "xp",
  label?: string
) {
  useFloatingXp.getState().spawn({ xp, x: e.clientX, y: e.clientY, variant, label });
}

export function FloatingXpLayer() {
  const items = useFloatingXp((s) => s.items);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <AnimatePresence>
        {items.map((item) => {
          const color =
            item.variant === "loss"
              ? "text-magenta"
              : item.variant === "vital"
                ? "text-vital-health"
                : "text-cyan";
          const sign = item.variant === "loss" ? "−" : "+";
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 0, scale: 0.7 }}
              animate={{ opacity: [0, 1, 1, 0], y: -80, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: [0.2, 0.7, 0.2, 1], times: [0, 0.1, 0.6, 1] }}
              className="absolute"
              style={{ left: item.x, top: item.y, transform: "translate(-50%, -50%)" }}
            >
              <div
                className={cn(
                  "font-display font-bold tracking-wider whitespace-nowrap",
                  color
                )}
                style={{
                  textShadow: "0 0 10px currentColor, 0 2px 4px rgba(0,0,0,0.8)",
                  fontSize: item.variant === "vital" ? "0.85rem" : "1.1rem",
                }}
              >
                {sign}
                {item.xp}
                {item.label && (
                  <span className="ml-1 font-mono text-[10px] opacity-80">{item.label}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
