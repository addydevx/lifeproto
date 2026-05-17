"use client";

import { cn } from "@/lib/utils";
import { type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label className="hud-label mb-1.5 block">{label}</label>
      {children}
      {hint && (
        <p className="mt-1 font-mono text-[10px] tracking-wider text-fg-muted">{hint}</p>
      )}
    </div>
  );
}

const baseInputClass =
  "w-full border border-cyan/20 bg-ink-900/50 px-3 py-2 font-mono text-sm text-fg-primary placeholder:text-fg-muted focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan/30 disabled:opacity-50 transition-colors";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input {...rest} className={cn(baseInputClass, className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return <textarea {...rest} className={cn(baseInputClass, "min-h-[80px] resize-y leading-relaxed", className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props;
  return (
    <select
      {...rest}
      className={cn(baseInputClass, "uppercase appearance-none cursor-pointer", className)}
    />
  );
}

// Tile-style vital picker. Visually richer than a dropdown.
interface VitalPickerProps {
  name: string;
  value: "health" | "mind" | "discipline" | "social";
  onChange: (v: "health" | "mind" | "discipline" | "social") => void;
}

const vitalOptions = [
  { value: "health" as const, label: "HEALTH", color: "text-vital-health", border: "border-vital-health", bg: "bg-vital-health/10" },
  { value: "mind" as const, label: "MIND", color: "text-vital-mind", border: "border-vital-mind", bg: "bg-vital-mind/10" },
  { value: "discipline" as const, label: "DISCIPLINE", color: "text-vital-discipline", border: "border-vital-discipline", bg: "bg-vital-discipline/10" },
  { value: "social" as const, label: "SOCIAL", color: "text-vital-social", border: "border-vital-social", bg: "bg-vital-social/10" },
];

export function VitalPicker({ name, value, onChange }: VitalPickerProps) {
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {vitalOptions.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "border px-3 py-2 font-mono text-[11px] tracking-wider transition-all",
                active
                  ? `${opt.border} ${opt.bg} ${opt.color}`
                  : "border-cyan/15 bg-ink-900/40 text-fg-tertiary hover:border-cyan/40 hover:text-fg-secondary"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

interface CadencePickerProps {
  name: string;
  value: "daily" | "weekly" | "oneshot";
  onChange: (v: "daily" | "weekly" | "oneshot") => void;
}

const cadenceOptions = [
  { value: "daily" as const, label: "DAILY" },
  { value: "weekly" as const, label: "WEEKLY" },
  { value: "oneshot" as const, label: "ONE-SHOT" },
];

export function CadencePicker({ name, value, onChange }: CadencePickerProps) {
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <div className="grid grid-cols-3 gap-2">
        {cadenceOptions.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "border px-3 py-2 font-mono text-[11px] tracking-wider transition-all",
                active
                  ? "border-cyan bg-cyan/10 text-cyan"
                  : "border-cyan/15 bg-ink-900/40 text-fg-tertiary hover:border-cyan/40 hover:text-fg-secondary"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

interface FormButtonsProps {
  onCancel: () => void;
  submitLabel: string;
  isPending?: boolean;
  variant?: "default" | "danger";
}

export function FormButtons({ onCancel, submitLabel, isPending, variant = "default" }: FormButtonsProps) {
  return (
    <div className="mt-2 flex items-center justify-end gap-2 border-t border-cyan/10 pt-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={isPending}
        className="px-4 py-2 font-mono text-xs uppercase tracking-hud text-fg-tertiary transition-colors hover:text-fg-primary disabled:opacity-50"
      >
        CANCEL
      </button>
      <button
        type="submit"
        disabled={isPending}
        className={cn("hud-btn", variant === "danger" && "hud-btn-danger")}
      >
        {isPending ? "PROCESSING…" : submitLabel}
      </button>
    </div>
  );
}

interface FormErrorProps {
  message: string | null;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 border border-magenta/40 bg-magenta/5 px-3 py-2">
      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-magenta" />
      <span className="font-mono text-[11px] text-magenta">{message}</span>
    </div>
  );
}
