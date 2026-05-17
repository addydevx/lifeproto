"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Pencil,
  XCircle,
  Trash2,
  Check,
  Circle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestForm, type QuestFormInitial } from "@/components/forms/QuestForm";
import { ConfirmDialog } from "@/components/hud/ConfirmDialog";
import {
  completeChapterAction,
  uncompleteChapterAction,
  abandonQuestAction,
  deleteQuestAction,
} from "@/actions/quests";
import { useTelemetry } from "@/lib/stores/telemetry";
import { spawnXpAt } from "@/components/hud/FloatingXp";
import { useCelebration } from "@/components/hud/CelebrationOverlay";

export interface QuestData {
  id: string;
  codename: string;
  description: string;
  totalXp: number;
  reward: string | null;
  status: "active" | "completed" | "abandoned";
  chapters: {
    id: string;
    title: string;
    description: string | null;
    order: number;
    completed: boolean;
  }[];
}

interface QuestPanelProps {
  active: QuestData[];
  completed: QuestData[];
  abandoned: QuestData[];
}

export function QuestPanel({ active, completed, abandoned }: QuestPanelProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<QuestFormInitial | undefined>(undefined);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(q: QuestData) {
    const completedTitles = q.chapters.filter((c) => c.completed).map((c) => c.title);
    const incomplete = q.chapters
      .filter((c) => !c.completed)
      .map((c) => ({ title: c.title, description: c.description ?? undefined }));
    setEditing({
      id: q.id,
      codename: q.codename,
      description: q.description,
      totalXp: q.totalXp,
      reward: q.reward,
      completedChapterTitles: completedTitles,
      incompleteChapters: incomplete.length > 0 ? incomplete : [{ title: "" }],
    });
    setFormOpen(true);
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-end">
        <button onClick={openCreate} className="hud-btn">
          <Plus className="h-4 w-4" />
          <span>INITIATE QUEST</span>
        </button>
      </div>

      {active.length === 0 ? (
        <div className="border border-vital-quest/20 bg-vital-quest/[0.03] p-10 text-center">
          <div className="font-mono text-xs text-fg-tertiary">
            NO ACTIVE QUESTS // INITIATE ONE TO BEGIN
          </div>
          <button
            onClick={openCreate}
            className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-vital-quest hover:underline"
          >
            <Plus className="h-3 w-3" /> CREATE FIRST QUEST
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {active.map((q, i) => (
            <QuestItem key={q.id} quest={q} delay={i * 0.05} onEdit={() => openEdit(q)} />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 font-mono text-[11px] tracking-[0.25em] text-vital-health">
            // COMPLETED // {completed.length}
          </div>
          <div className="space-y-2">
            {completed.map((q) => (
              <CompletedQuestRow key={q.id} quest={q} onDelete={() => {}} />
            ))}
          </div>
        </div>
      )}

      {abandoned.length > 0 && (
        <div className="mt-8 opacity-60">
          <div className="mb-3 font-mono text-[11px] tracking-[0.25em] text-fg-tertiary">
            // ABANDONED // {abandoned.length}
          </div>
          <div className="space-y-2">
            {abandoned.map((q) => (
              <CompletedQuestRow key={q.id} quest={q} muted />
            ))}
          </div>
        </div>
      )}

      <QuestForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />
    </>
  );
}

interface QuestItemProps {
  quest: QuestData;
  delay: number;
  onEdit: () => void;
}

function QuestItem({ quest, delay, onEdit }: QuestItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [abandonConfirm, setAbandonConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const total = quest.chapters.length;
  const done = quest.chapters.filter((c) => c.completed).length;
  const progress = total > 0 ? done / total : 0;
  const xpPerChapter = total > 0 ? Math.floor(quest.totalXp / total) : quest.totalXp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative border border-vital-quest/30 bg-vital-quest/[0.04] transition-colors hover:border-vital-quest/50"
    >
      <div className="absolute -top-px -left-px h-2 w-2 border-t border-l border-vital-quest" />
      <div className="absolute -bottom-px -right-px h-2 w-2 border-b border-r border-vital-quest" />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex flex-1 items-center gap-2 text-left"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-vital-quest" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-vital-quest" />
            )}
            <div>
              <div className="font-display text-sm font-bold tracking-wider text-vital-quest">
                // {quest.codename}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-wider text-fg-tertiary">
              {String(done).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 100)}
                className="text-fg-muted transition-colors hover:text-fg-primary"
                aria-label="Quest actions"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 min-w-[160px] border border-cyan/30 bg-ink-900/95 shadow-lg backdrop-blur-md">
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setMenuOpen(false);
                      onEdit();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs text-fg-secondary hover:bg-cyan/10 hover:text-cyan"
                  >
                    <Pencil className="h-3 w-3" /> EDIT
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setMenuOpen(false);
                      setAbandonConfirm(true);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs text-fg-secondary hover:bg-magenta/10 hover:text-magenta"
                  >
                    <XCircle className="h-3 w-3" /> ABANDON
                  </button>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setMenuOpen(false);
                      setDeleteConfirm(true);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs text-fg-secondary hover:bg-magenta/10 hover:text-magenta"
                  >
                    <Trash2 className="h-3 w-3" /> DELETE
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="mt-2 ml-6 text-xs leading-relaxed text-fg-secondary">{quest.description}</p>

        <div className="ml-6 mt-3">
          <div className="relative h-[3px] w-full bg-vital-quest/15">
            <motion.div
              className="absolute inset-y-0 left-0 bg-vital-quest shadow-[0_0_6px_rgba(190,100,255,0.6)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[10px] tracking-wider">
            <span className="text-fg-muted">{xpPerChapter} XP / CHAPTER</span>
            {quest.reward && (
              <span className="text-vital-quest">REWARD: {quest.reward}</span>
            )}
          </div>
        </div>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="ml-6 mt-4 space-y-1"
          >
            <div className="hud-label mb-2">CHAPTERS</div>
            {quest.chapters.map((c) => (
              <ChapterRow key={c.id} chapter={c} xpPerChapter={xpPerChapter} questCodename={quest.codename} />
            ))}
          </motion.div>
        )}
      </div>

      <ConfirmDialog
        open={abandonConfirm}
        onClose={() => setAbandonConfirm(false)}
        onConfirm={() => abandonQuestAction(quest.id)}
        title="ABANDON QUEST"
        message={`Abandon "${quest.codename}"? You'll keep XP earned from completed chapters, but the quest moves to the abandoned list.`}
        confirmLabel="ABANDON"
        variant="danger"
      />

      <ConfirmDialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={() => deleteQuestAction(quest.id)}
        title="DELETE QUEST"
        message={`Permanently delete "${quest.codename}" and all chapters? XP already earned remains in your profile. This cannot be undone.`}
        confirmLabel="DELETE"
        variant="danger"
      />
    </motion.div>
  );
}

interface ChapterRowProps {
  chapter: { id: string; title: string; completed: boolean };
  xpPerChapter: number;
  questCodename: string;
}

function ChapterRow({ chapter, xpPerChapter, questCodename }: ChapterRowProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const log = useTelemetry((s) => s.log);
  const showCelebration = useCelebration((s) => s.show);

  function toggle(e: React.MouseEvent) {
    setError(null);
    const wasComplete = chapter.completed;
    const clickX = e.clientX;
    const clickY = e.clientY;

    startTransition(async () => {
      if (!wasComplete) {
        // Spawn XP indicator immediately at click point
        spawnXpAt({ clientX: clickX, clientY: clickY }, xpPerChapter, "xp");

        const result = await completeChapterAction(chapter.id);
        if ("error" in result) {
          setError(result.error);
          setTimeout(() => setError(null), 3000);
          return;
        }

        log("CHAPTER COMPLETE", {
          severity: "success",
          xp: result.xpAwarded,
          detail: `${questCodename} :: ${chapter.title}`,
        });

        if (result.questComplete && result.questCodename) {
          showCelebration({
            type: "quest_complete",
            title: "QUEST CLEARED",
            subtitle: `${result.questCodename} archived as complete. All chapters confirmed.`,
            badge: "CLEAR",
          });
        }

        if (result.leveledUp) {
          showCelebration({
            type: "level_up",
            title: "LEVEL UP",
            subtitle: "System parameters expanded. New capability unlocked.",
            badge: `LVL ${String(result.newLevel).padStart(2, "0")}`,
          });
        }
      } else {
        const result = await uncompleteChapterAction(chapter.id);
        if ("error" in result) {
          setError(result.error);
          setTimeout(() => setError(null), 3000);
          return;
        }
        spawnXpAt({ clientX: clickX, clientY: clickY }, xpPerChapter, "loss");
        log("CHAPTER REVERTED", { severity: "warning", detail: chapter.title });
      }
    });
  }

  return (
    <>
      <button
        onClick={toggle}
        disabled={isPending}
        className={cn(
          "flex w-full items-center gap-2.5 border-l-2 px-3 py-1.5 text-left transition-colors",
          chapter.completed
            ? "border-l-vital-health bg-vital-health/[0.04]"
            : "border-l-fg-muted/30 bg-ink-800/30 hover:bg-ink-800/60"
        )}
      >
        <div
          className="flex h-3.5 w-3.5 items-center justify-center border border-current"
          style={{ color: chapter.completed ? "rgb(0 255 157)" : "rgb(107 122 153)" }}
        >
          {isPending ? (
            <Loader2 className="h-2 w-2 animate-spin" />
          ) : chapter.completed ? (
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          ) : (
            <Circle className="h-1 w-1 fill-current" />
          )}
        </div>
        <span
          className={cn(
            "flex-1 font-mono text-xs",
            chapter.completed ? "text-fg-tertiary line-through" : "text-fg-primary"
          )}
        >
          {chapter.title}
        </span>
        <span className="font-mono text-[10px] text-fg-muted">+{xpPerChapter} XP</span>
      </button>
      {error && (
        <div className="ml-5 mt-0.5 flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3 text-magenta" />
          <span className="font-mono text-[10px] tracking-wider text-magenta">{error}</span>
        </div>
      )}
    </>
  );
}

function CompletedQuestRow({
  quest,
  muted = false,
  onDelete,
}: {
  quest: QuestData;
  muted?: boolean;
  onDelete?: () => void;
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between border px-3 py-2",
          muted ? "border-fg-muted/20 bg-ink-800/30" : "border-vital-health/20 bg-vital-health/[0.04]"
        )}
      >
        <div>
          <div className={cn("font-display text-sm font-bold tracking-wider", muted ? "text-fg-tertiary" : "text-vital-health")}>
            // {quest.codename}
          </div>
          <p className="mt-0.5 text-[11px] text-fg-tertiary">{quest.description}</p>
        </div>
        <button
          onClick={() => setDeleteConfirm(true)}
          className="text-fg-muted transition-colors hover:text-magenta"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <ConfirmDialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={() => deleteQuestAction(quest.id)}
        title="DELETE QUEST"
        message={`Permanently delete "${quest.codename}"? XP already earned remains in your profile.`}
        confirmLabel="DELETE"
        variant="danger"
      />
    </>
  );
}
