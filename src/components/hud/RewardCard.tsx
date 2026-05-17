"use client";

import { useTransition, useState } from "react";
import { Lock, AlertCircle, Check, Loader2 } from "lucide-react";
import { redeemRewardAction } from "@/actions/rewards";

interface RewardCardProps {
  id: string;
  name: string;
  description: string | null;
  cost: number;
  currentXp: number;
}

export function RewardCard({ id, name, description, cost, currentXp }: RewardCardProps) {
  const available = currentXp >= cost;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleRedeem() {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await redeemRewardAction(id);
      if (result && "error" in result) {
        setError(result.error);
        setTimeout(() => setError(null), 3000);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <div
      className={`group relative border p-4 transition-all ${
        available
          ? "border-vital-discipline/30 bg-vital-discipline/[0.04] hover:border-vital-discipline/60"
          : "border-fg-muted/20 bg-ink-800/30 opacity-70"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-sm font-bold tracking-wider text-fg-primary">
          {name}
        </span>
        {!available && <Lock className="h-3 w-3 text-fg-muted" />}
      </div>
      {description && (
        <p className="mb-3 text-[11px] leading-relaxed text-fg-tertiary">{description}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-fg-tertiary">
          COST // {cost.toLocaleString()} XP
        </span>
        <button
          disabled={!available || isPending}
          onClick={handleRedeem}
          className={
            available && !isPending
              ? "hud-btn !py-1.5 !px-3 !text-[10px]"
              : "cursor-not-allowed font-mono text-[10px] tracking-wider text-fg-muted"
          }
        >
          {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
          {success && <Check className="h-3 w-3 text-vital-health" />}
          {!available && !isPending
            ? "INSUFFICIENT XP"
            : success
              ? "REDEEMED"
              : isPending
                ? "PROCESSING…"
                : "REDEEM"}
        </button>
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-1.5 border-l-2 border-l-magenta bg-magenta/5 px-2 py-1">
          <AlertCircle className="h-3 w-3 text-magenta" />
          <span className="font-mono text-[10px] text-magenta">{error}</span>
        </div>
      )}
    </div>
  );
}
