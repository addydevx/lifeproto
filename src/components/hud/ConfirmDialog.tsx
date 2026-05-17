"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/hud/Modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<{ error: string } | { success: true } | void>;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "default" | "danger";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "CONFIRM",
  variant = "danger",
}: ConfirmDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await onConfirm();
      if (result && "error" in result) {
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
      title={title}
      subtitle="// CONFIRMATION REQUIRED"
      size="sm"
      accentColor={variant === "danger" ? "magenta" : "cyan"}
    >
      <p className="mb-4 text-sm leading-relaxed text-fg-secondary">{message}</p>

      {error && (
        <div className="mb-4 flex items-start gap-2 border border-magenta/40 bg-magenta/5 px-3 py-2">
          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-magenta" />
          <span className="font-mono text-[11px] text-magenta">{error}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-cyan/10 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="px-4 py-2 font-mono text-xs uppercase tracking-hud text-fg-tertiary transition-colors hover:text-fg-primary disabled:opacity-50"
        >
          CANCEL
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className={variant === "danger" ? "hud-btn hud-btn-danger" : "hud-btn"}
        >
          {isPending ? "PROCESSING…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
