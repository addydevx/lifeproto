"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface QuestCardProps {
  codename: string;
  description: string;
  currentChapter: number;
  totalChapters: number;
  progress: number; // 0..1
  reward?: string;
}

export function QuestCard({
  codename,
  description,
  currentChapter,
  totalChapters,
  progress,
  reward,
}: QuestCardProps) {
  return (
    <div className="group relative border border-vital-quest/30 bg-vital-quest/[0.04] p-4 transition-all hover:border-vital-quest/60 hover:bg-vital-quest/[0.07]">
      {/* corner accent */}
      <div className="absolute -top-px -left-px h-2 w-2 border-t border-l border-vital-quest" />
      <div className="absolute -bottom-px -right-px h-2 w-2 border-b border-r border-vital-quest" />

      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-display text-sm font-bold tracking-wider text-vital-quest">
          // {codename}
        </span>
        <span className="font-mono text-[10px] tracking-wider text-fg-tertiary">
          CH {String(currentChapter).padStart(2, "0")} / {String(totalChapters).padStart(2, "0")}
        </span>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-fg-secondary">{description}</p>

      <div className="relative h-[3px] w-full bg-vital-quest/15">
        <motion.div
          className="absolute inset-y-0 left-0 bg-vital-quest shadow-[0_0_6px_rgba(190,100,255,0.6)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1, delay: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </div>

      {reward && (
        <div className="mt-3 flex items-center justify-between border-t border-vital-quest/15 pt-2.5">
          <span className="hud-label text-fg-tertiary">REWARD ON COMPLETION</span>
          <div className="flex items-center gap-1 font-mono text-[11px] text-vital-quest">
            {reward}
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      )}
    </div>
  );
}
