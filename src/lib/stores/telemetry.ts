"use client";

import { create } from "zustand";

export type TelemetrySeverity = "info" | "success" | "warning" | "critical";

export interface TelemetryEntry {
  id: string;
  message: string;
  severity: TelemetrySeverity;
  timestamp: number;
  /** Optional XP gain to display alongside */
  xp?: number;
  /** Optional sub-line, e.g. directive name */
  detail?: string;
}

interface TelemetryStore {
  entries: TelemetryEntry[];
  log: (
    message: string,
    options?: { severity?: TelemetrySeverity; xp?: number; detail?: string }
  ) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

let nextId = 0;

export const useTelemetry = create<TelemetryStore>((set) => ({
  entries: [],
  log: (message, options = {}) => {
    const entry: TelemetryEntry = {
      id: `tel_${Date.now()}_${nextId++}`,
      message,
      severity: options.severity ?? "info",
      xp: options.xp,
      detail: options.detail,
      timestamp: Date.now(),
    };
    set((s) => ({ entries: [...s.entries, entry] }));
    // Auto-dismiss after 4s
    setTimeout(() => {
      set((s) => ({ entries: s.entries.filter((e) => e.id !== entry.id) }));
    }, 4000);
  },
  dismiss: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
  clear: () => set({ entries: [] }),
}));
