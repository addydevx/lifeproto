"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/hud/Modal";
import {
  Field,
  TextInput,
  Textarea,
  FormButtons,
  FormError,
} from "@/components/hud/FormPrimitives";
import { createRewardAction, updateRewardAction } from "@/actions/rewards";

export interface RewardFormInitial {
  id: string;
  name: string;
  description?: string | null;
  cost: number;
}

interface RewardFormProps {
  open: boolean;
  onClose: () => void;
  initial?: RewardFormInitial;
}

export function RewardForm({ open, onClose, initial }: RewardFormProps) {
  const isEdit = Boolean(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateRewardAction(initial!.id, formData)
        : await createRewardAction(formData);
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
      title={isEdit ? "EDIT REWARD" : "NEW REWARD"}
      subtitle={isEdit ? "// MODIFY EXISTING" : "// CREATE NEW"}
      size="md"
      accentColor="discipline"
    >
      <form action={handleSubmit} className="space-y-4">
        <Field label="NAME" hint="Use ALL CAPS // FORMAT to match HUD aesthetic.">
          <TextInput
            name="name"
            required
            maxLength={80}
            defaultValue={initial?.name}
            placeholder="GAMING SESSION // 2H"
            className="uppercase"
          />
        </Field>

        <Field label="DESCRIPTION" hint="Optional. What this reward actually is.">
          <Textarea
            name="description"
            maxLength={300}
            defaultValue={initial?.description ?? ""}
            placeholder="Two uninterrupted hours of your favorite game."
          />
        </Field>

        <Field label="COST" hint="XP required to redeem. Most rewards: 100-2000.">
          <TextInput
            type="number"
            name="cost"
            required
            min={1}
            max={1000000}
            step={50}
            defaultValue={initial?.cost ?? 200}
          />
        </Field>

        <FormError message={error} />

        <FormButtons
          onCancel={onClose}
          submitLabel={isEdit ? "SAVE CHANGES" : "PROVISION REWARD"}
          isPending={isPending}
        />
      </form>
    </Modal>
  );
}
