"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  accentColor?: "cyan" | "magenta" | "quest" | "discipline";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

const accentClasses = {
  cyan: { text: "text-cyan", border: "border-cyan/30", glow: "shadow-[0_0_30px_rgba(0,229,255,0.15)]" },
  magenta: { text: "text-magenta", border: "border-magenta/30", glow: "shadow-[0_0_30px_rgba(255,0,128,0.15)]" },
  quest: { text: "text-vital-quest", border: "border-vital-quest/30", glow: "shadow-[0_0_30px_rgba(190,100,255,0.15)]" },
  discipline: { text: "text-vital-discipline", border: "border-vital-discipline/30", glow: "shadow-[0_0_30px_rgba(255,170,0,0.15)]" },
};

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  accentColor = "cyan",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const accent = accentClasses[accentColor];

  // Esc to close + lock body scroll
  useEffect(() => {
    if (!open) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Focus the first input in the modal
  useEffect(() => {
    if (open && dialogRef.current) {
      const firstInput = dialogRef.current.querySelector<HTMLElement>(
        "input, textarea, select, button"
      );
      firstInput?.focus();
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 px-4 py-8 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.99 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            className={cn(
              "relative w-full bg-ink-900/95 backdrop-blur-md",
              "border",
              accent.border,
              accent.glow,
              sizeClasses[size]
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* corner brackets */}
            <div className={cn("pointer-events-none absolute -top-px -left-px h-3 w-3 border-l border-t", accent.border.replace("/30", ""))} />
            <div className={cn("pointer-events-none absolute -top-px -right-px h-3 w-3 border-r border-t", accent.border.replace("/30", ""))} />
            <div className={cn("pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-l border-b", accent.border.replace("/30", ""))} />
            <div className={cn("pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-r border-b", accent.border.replace("/30", ""))} />

            {/* header */}
            <div className="flex items-start justify-between border-b border-cyan/10 px-5 py-4">
              <div>
                <h2 className={cn("font-display text-lg font-bold tracking-wider", accent.text)}>
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-0.5 font-mono text-[11px] tracking-wider text-fg-tertiary">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-fg-tertiary transition-colors hover:text-fg-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
