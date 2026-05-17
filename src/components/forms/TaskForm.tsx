"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/hud/Modal";
import {
  Field,
  TextInput,
  Textarea,
  VitalPicker,
  CadencePicker,
  FormButtons,
  FormError,
} from "@/components/hud/FormPrimitives";
import { createTaskAction, updateTaskAction } from "@/actions/tasks";

type Vital = "health" | "mind" | "discipline" | "social";
type Cadence = "daily" | "weekly" | "oneshot";

export interface TaskFormInitial {
  id: string;
  title: string;
  description?: string | null;
  vital: Vital;
  vitalGain: number;
  xp: number;
  cadence: Cadence;
}

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  initial?: TaskFormInitial;
}

export function TaskForm({ open, onClose, initial }: TaskFormProps) {
  const isEdit = Boolean(initial);
  const [vital, setVital] = useState<Vital>(initial?.vital ?? "discipline");
  const [cadence, setCadence] = useState<Cadence>(initial?.cadence ?? "daily");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateTaskAction(initial!.id, formData)
        : await createTaskAction(formData);
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
      title={isEdit ? "EDIT DIRECTIVE" : "NEW DIRECTIVE"}
      subtitle={isEdit ? "// MODIFY EXISTING" : "// CREATE NEW"}
      size="md"
    >
      <form action={handleSubmit} className="space-y-4">
        <Field label="TITLE">
          <TextInput
            name="title"
            required
            maxLength={120}
            defaultValue={initial?.title}
            placeholder="Morning protocol // 30 min movement"
          />
        </Field>

        <Field label="DESCRIPTION" hint="Optional. Notes to your future self.">
          <Textarea
            name="description"
            maxLength={500}
            defaultValue={initial?.description ?? ""}
            placeholder="What does success look like for this directive?"
          />
        </Field>

        <Field label="VITAL // WHAT IT BUILDS">
          <VitalPicker name="vital" value={vital} onChange={setVital} />
        </Field>

        <Field label="CADENCE // HOW OFTEN">
          <CadencePicker name="cadence" value={cadence} onChange={setCadence} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="XP REWARD" hint="0-1000">
            <TextInput
              type="number"
              name="xp"
              required
              min={0}
              max={1000}
              step={10}
              defaultValue={initial?.xp ?? 80}
            />
          </Field>
          <Field label="VITAL GAIN" hint="0-10 per completion">
            <TextInput
              type="number"
              name="vitalGain"
              required
              min={0}
              max={10}
              defaultValue={initial?.vitalGain ?? 2}
            />
          </Field>
        </div>

        <FormError message={error} />

        <FormButtons
          onCancel={onClose}
          submitLabel={isEdit ? "SAVE CHANGES" : "PROVISION DIRECTIVE"}
          isPending={isPending}
        />
      </form>
    </Modal>
  );
}
