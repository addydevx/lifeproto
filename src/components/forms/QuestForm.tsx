"use client";

import { useState, useTransition } from "react";
import { Plus, X, GripVertical } from "lucide-react";
import { Modal } from "@/components/hud/Modal";
import {
  Field,
  TextInput,
  Textarea,
  FormButtons,
  FormError,
} from "@/components/hud/FormPrimitives";
import { createQuestAction, updateQuestAction } from "@/actions/quests";

interface ChapterDraft {
  title: string;
  description?: string;
}

export interface QuestFormInitial {
  id: string;
  codename: string;
  description: string;
  totalXp: number;
  reward?: string | null;
  // Only INCOMPLETE chapters are editable; completed ones are shown but locked
  completedChapterTitles: string[];
  incompleteChapters: ChapterDraft[];
}

interface QuestFormProps {
  open: boolean;
  onClose: () => void;
  initial?: QuestFormInitial;
}

export function QuestForm({ open, onClose, initial }: QuestFormProps) {
  const isEdit = Boolean(initial);
  const [chapters, setChapters] = useState<ChapterDraft[]>(
    initial?.incompleteChapters ?? [{ title: "" }]
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addChapter() {
    setChapters((prev) => [...prev, { title: "" }]);
  }

  function removeChapter(index: number) {
    setChapters((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  function updateChapter(index: number, patch: Partial<ChapterDraft>) {
    setChapters((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function handleSubmit(formData: FormData) {
    setError(null);

    // Combine completed (locked) chapters with editable ones in the payload.
    // The server expects ALL chapters in the chapters array, in order.
    const completedDrafts: ChapterDraft[] =
      initial?.completedChapterTitles.map((t) => ({ title: t })) ?? [];
    const all = [...completedDrafts, ...chapters];

    const trimmed = all.filter((c) => c.title.trim().length > 0);
    if (trimmed.length === 0) {
      setError("At least one chapter required.");
      return;
    }
    formData.set("chapters", JSON.stringify(trimmed));

    startTransition(async () => {
      const result = isEdit
        ? await updateQuestAction(initial!.id, formData)
        : await createQuestAction(formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "EDIT QUEST" : "NEW QUEST"}
      subtitle={isEdit ? "// MODIFY EXISTING" : "// INITIATE QUEST LINE"}
      size="lg"
      accentColor="quest"
    >
      <form action={handleSubmit} className="space-y-4">
        <Field label="CODENAME" hint="Short, evocative. Will display in ALL CAPS.">
          <TextInput
            name="codename"
            required
            maxLength={60}
            defaultValue={initial?.codename}
            placeholder="PROJECT NIGHTFALL"
            className="uppercase"
          />
        </Field>

        <Field label="DESCRIPTION" hint="What does completing this quest mean?">
          <Textarea
            name="description"
            required
            maxLength={500}
            defaultValue={initial?.description}
            placeholder="Build and launch personal portfolio site with 3 case studies"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="TOTAL XP" hint="Split evenly across chapters.">
            <TextInput
              type="number"
              name="totalXp"
              required
              min={0}
              max={100000}
              step={100}
              defaultValue={initial?.totalXp ?? 1000}
            />
          </Field>
          <Field label="REWARD" hint="Optional. Granted on completion.">
            <TextInput
              name="reward"
              maxLength={120}
              defaultValue={initial?.reward ?? ""}
              placeholder="WEEKEND TRIP"
            />
          </Field>
        </div>

        {/* Completed chapters (locked, edit mode only) */}
        {initial && initial.completedChapterTitles.length > 0 && (
          <div>
            <label className="hud-label mb-1.5 block">
              COMPLETED CHAPTERS // LOCKED
            </label>
            <div className="space-y-1">
              {initial.completedChapterTitles.map((title, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 border-l-2 border-l-vital-health/40 bg-vital-health/[0.04] px-3 py-2"
                >
                  <span className="font-mono text-[10px] text-fg-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-sm text-fg-secondary line-through opacity-60">
                    {title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editable chapters */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="hud-label">
              {initial && initial.completedChapterTitles.length > 0
                ? "REMAINING CHAPTERS"
                : "CHAPTERS // CHECKPOINTS"}
            </label>
            <span className="font-mono text-[10px] text-fg-muted">
              {chapters.length} / 50
            </span>
          </div>
          <div className="space-y-2">
            {chapters.map((c, i) => {
              const displayIndex =
                (initial?.completedChapterTitles.length ?? 0) + i + 1;
              return (
                <div
                  key={i}
                  className="flex items-start gap-2 border-l-2 border-l-vital-quest/30 bg-vital-quest/[0.03] px-3 py-2"
                >
                  <GripVertical className="mt-2 h-3 w-3 flex-shrink-0 text-fg-muted" />
                  <span className="mt-2 font-mono text-[10px] text-fg-muted">
                    {String(displayIndex).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <TextInput
                      value={c.title}
                      onChange={(e) => updateChapter(i, { title: e.target.value })}
                      placeholder={`Chapter ${displayIndex} title`}
                      maxLength={120}
                      className="!border-transparent !bg-transparent !px-0 !py-0.5"
                    />
                  </div>
                  {chapters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeChapter(i)}
                      className="mt-1 text-fg-tertiary transition-colors hover:text-magenta"
                      aria-label="Remove chapter"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {chapters.length < 50 && (
            <button
              type="button"
              onClick={addChapter}
              className="mt-2 flex w-full items-center justify-center gap-2 border border-dashed border-vital-quest/30 px-3 py-2 font-mono text-[11px] tracking-wider text-fg-tertiary transition-colors hover:border-vital-quest/60 hover:bg-vital-quest/5 hover:text-vital-quest"
            >
              <Plus className="h-3.5 w-3.5" />
              ADD CHAPTER
            </button>
          )}
        </div>

        <FormError message={error} />

        <FormButtons
          onCancel={onClose}
          submitLabel={isEdit ? "SAVE CHANGES" : "INITIATE QUEST"}
          isPending={isPending}
        />
      </form>
    </Modal>
  );
}
