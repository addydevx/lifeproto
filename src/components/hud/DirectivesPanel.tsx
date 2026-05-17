"use client";

import { useState, useTransition, useOptimistic, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { Check, Circle, AlertCircle, Plus, MoreVertical, Pencil, Archive, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  completeTaskAction,
  uncompleteTaskAction,
  archiveTaskAction,
} from "@/actions/tasks";
import { TaskForm, type TaskFormInitial } from "@/components/forms/TaskForm";
import { ConfirmDialog } from "@/components/hud/ConfirmDialog";
import { useTelemetry } from "@/lib/stores/telemetry";
import { spawnXpAt } from "@/components/hud/FloatingXp";
import { useCelebration } from "@/components/hud/CelebrationOverlay";

type Vital = "health" | "mind" | "discipline" | "social";

export interface DirectiveItem {
  id: string;
  title: string;
  description?: string | null;
  isComplete: boolean;
  xp: number;
  vital: Vital;
  vitalGain: number;
  cadence: "daily" | "weekly" | "oneshot";
}

const vitalAccent: Record<Vital, { border: string; bg: string; text: string }> = {
  health: { border: "border-l-vital-health", bg: "bg-vital-health/[0.04]", text: "text-vital-health" },
  mind: { border: "border-l-vital-mind", bg: "bg-vital-mind/[0.04]", text: "text-vital-mind" },
  discipline: { border: "border-l-vital-discipline", bg: "bg-vital-discipline/[0.04]", text: "text-vital-discipline" },
  social: { border: "border-l-vital-social", bg: "bg-vital-social/[0.04]", text: "text-vital-social" },
};

interface DirectivesPanelProps {
  directives: DirectiveItem[];
}

type OptimisticAction =
  | { type: "toggle"; id: string; nextValue: boolean }
  | { type: "archive"; id: string };

export function DirectivesPanel({ directives }: DirectivesPanelProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TaskFormInitial | undefined>(undefined);

  // Optimistic state lets us update UI instantly while the server catches up
  const [optimistic, applyOptimistic] = useOptimistic<DirectiveItem[], OptimisticAction>(
    directives,
    (state, action) => {
      if (action.type === "toggle") {
        return state.map((d) =>
          d.id === action.id ? { ...d, isComplete: action.nextValue } : d
        );
      }
      if (action.type === "archive") {
        return state.filter((d) => d.id !== action.id);
      }
      return state;
    }
  );

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(d: DirectiveItem) {
    setEditing({
      id: d.id,
      title: d.title,
      description: d.description,
      vital: d.vital,
      vitalGain: d.vitalGain,
      xp: d.xp,
      cadence: d.cadence,
    });
    setFormOpen(true);
  }

  return (
    <>
      <div className="space-y-1.5 p-3">
        {optimistic.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <div className="font-mono text-xs text-fg-tertiary">
              NO DIRECTIVES // SYSTEM IDLE
            </div>
            <button
              onClick={openCreate}
              className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-cyan hover:text-glow-cyan"
            >
              <Plus className="h-3 w-3" /> CREATE FIRST DIRECTIVE
            </button>
          </div>
        ) : (
          optimistic.map((d, i) => (
            <DirectiveRow
              key={d.id}
              directive={d}
              delay={0.1 + i * 0.04}
              onEdit={() => openEdit(d)}
              applyOptimistic={applyOptimistic}
            />
          ))
        )}

        <button
          onClick={openCreate}
          className="mt-2 flex w-full items-center justify-center gap-2 border border-dashed border-cyan/20 px-3 py-2.5 font-mono text-[11px] tracking-wider text-fg-tertiary transition-colors hover:border-cyan/40 hover:bg-cyan/5 hover:text-cyan"
        >
          <Plus className="h-3.5 w-3.5" />
          ADD DIRECTIVE
        </button>
      </div>

      <TaskForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />
    </>
  );
}

interface DirectiveRowProps {
  directive: DirectiveItem;
  delay: number;
  onEdit: () => void;
  applyOptimistic: (action: OptimisticAction) => void;
}

function DirectiveRow({ directive, delay, onEdit, applyOptimistic }: DirectiveRowProps) {
  const accent = vitalAccent[directive.vital];
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState(false);

  const log = useTelemetry((s) => s.log);
  const showCelebration = useCelebration((s) => s.show);

  function toggleComplete(e: MouseEvent) {
    setError(null);
    const wasComplete = directive.isComplete;
    const clickX = e.clientX;
    const clickY = e.clientY;

    startTransition(async () => {
      // Optimistic update — flip immediately
      applyOptimistic({ type: "toggle", id: directive.id, nextValue: !wasComplete });

      if (!wasComplete) {
        // Completing — spawn XP indicator at click point right away
        spawnXpAt({ clientX: clickX, clientY: clickY }, directive.xp, "xp");
        spawnXpAt(
          { clientX: clickX + 30, clientY: clickY + 20 },
          directive.vitalGain,
          "vital",
          directive.vital.toUpperCase()
        );

        const result = await completeTaskAction(directive.id);

        if ("error" in result) {
          setError(result.error);
          // Optimistic state will revert naturally on next render from server
          setTimeout(() => setError(null), 3000);
          return;
        }

        log("DIRECTIVE COMPLETE", {
          severity: "success",
          xp: result.xpAwarded,
          detail: directive.title,
        });

        if (result.leveledUp) {
          showCelebration({
            type: "level_up",
            title: "LEVEL UP",
            subtitle: "System parameters expanded. New capability unlocked.",
            badge: `LVL ${String(result.newLevel).padStart(2, "0")}`,
          });
        }

        if (result.streakMilestone !== null) {
          showCelebration({
            type: "streak_milestone",
            title: "STREAK MILESTONE",
            subtitle: "Discipline confirmed. Multiplier increased.",
            badge: `${result.streakMilestone} DAYS`,
          });
        }
      } else {
        // Uncompleting
        const result = await uncompleteTaskAction(directive.id);
        if ("error" in result) {
          setError(result.error);
          setTimeout(() => setError(null), 3000);
          return;
        }
        spawnXpAt({ clientX: clickX, clientY: clickY }, directive.xp, "loss");
        log("DIRECTIVE REVERTED", {
          severity: "warning",
          detail: directive.title,
        });
      }
    });
  }

  async function handleArchive() {
    applyOptimistic({ type: "archive", id: directive.id });
    const result = await archiveTaskAction(directive.id);
    if ("success" in result) {
      log("DIRECTIVE ARCHIVED", { severity: "info", detail: directive.title });
    }
    return result;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <div className={cn("relative group flex items-center border-l-2", accent.border, accent.bg)}>
        <button
          onClick={toggleComplete}
          disabled={isPending}
          className="flex flex-1 items-center justify-between px-3.5 py-2.5 text-left transition-all hover:bg-ink-800/40 disabled:opacity-70"
        >
          <div className="min-w-0 flex-1">
            <div
              className={cn(
                "font-display text-sm tracking-wide text-fg-primary",
                directive.isComplete && "line-through opacity-40"
              )}
            >
              {directive.title}
            </div>
            <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] tracking-wider">
              <span className={cn("uppercase", directive.isComplete ? "text-vital-health" : "text-fg-muted")}>
                {directive.isComplete ? "COMPLETE" : "PENDING"}
              </span>
              <span className="text-fg-muted">//</span>
              <span className="text-fg-secondary">+{directive.xp} XP</span>
              <span className="text-fg-muted">//</span>
              <span className={accent.text}>
                {directive.vital.toUpperCase()} +{directive.vitalGain}
              </span>
            </div>
          </div>

          <div
            className="ml-3 flex h-5 w-5 items-center justify-center border border-current"
            style={{ color: directive.isComplete ? "rgb(0 255 157)" : "rgb(107 122 153)" }}
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : directive.isComplete ? (
              <Check className="h-3 w-3" strokeWidth={3} />
            ) : (
              <Circle className="h-2 w-2 fill-current" />
            )}
          </div>
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 100)}
            className="px-2 py-2.5 text-fg-muted opacity-0 transition-opacity hover:text-fg-primary group-hover:opacity-100"
            aria-label="Directive actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 min-w-[140px] border border-cyan/30 bg-ink-900/95 backdrop-blur-md shadow-lg">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  onEdit();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs text-fg-secondary hover:bg-cyan/10 hover:text-cyan"
              >
                <Pencil className="h-3 w-3" />
                EDIT
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  setArchiveConfirm(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs text-fg-secondary hover:bg-magenta/10 hover:text-magenta"
              >
                <Archive className="h-3 w-3" />
                ARCHIVE
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-1 flex items-center gap-1.5 border-l-2 border-l-magenta bg-magenta/5 px-3.5 py-1.5">
          <AlertCircle className="h-3 w-3 text-magenta" />
          <span className="font-mono text-[10px] tracking-wider text-magenta">{error}</span>
        </div>
      )}

      <ConfirmDialog
        open={archiveConfirm}
        onClose={() => setArchiveConfirm(false)}
        onConfirm={handleArchive}
        title="ARCHIVE DIRECTIVE"
        message={`Archive "${directive.title}"? It will no longer appear in your daily list. Completion history is preserved.`}
        confirmLabel="ARCHIVE"
        variant="danger"
      />
    </motion.div>
  );
}
