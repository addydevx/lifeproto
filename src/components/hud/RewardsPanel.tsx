"use client";

import { useState, useTransition } from "react";
import { Lock, AlertCircle, Check, Loader2, Plus, MoreVertical, Pencil, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { redeemRewardAction, deactivateRewardAction } from "@/actions/rewards";
import { RewardForm, type RewardFormInitial } from "@/components/forms/RewardForm";
import { ConfirmDialog } from "@/components/hud/ConfirmDialog";
import { useTelemetry } from "@/lib/stores/telemetry";
import { spawnXpAt } from "@/components/hud/FloatingXp";

export interface RewardData {
  id: string;
  name: string;
  description: string | null;
  cost: number;
}

interface RewardsPanelProps {
  rewards: RewardData[];
  currentXp: number;
}

export function RewardsPanel({ rewards, currentXp }: RewardsPanelProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RewardFormInitial | undefined>(undefined);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(r: RewardData) {
    setEditing({ id: r.id, name: r.name, description: r.description, cost: r.cost });
    setFormOpen(true);
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-end">
        <button onClick={openCreate} className="hud-btn">
          <Plus className="h-4 w-4" />
          <span>NEW REWARD</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {rewards.length === 0 ? (
          <div className="col-span-full border border-dashed border-vital-discipline/30 p-10 text-center">
            <div className="font-mono text-xs text-fg-tertiary">
              NO REWARDS CONFIGURED // CREATE ONE TO START
            </div>
            <button
              onClick={openCreate}
              className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-vital-discipline hover:underline"
            >
              <Plus className="h-3 w-3" /> CREATE FIRST REWARD
            </button>
          </div>
        ) : (
          rewards.map((r) => (
            <RewardItem
              key={r.id}
              reward={r}
              currentXp={currentXp}
              onEdit={() => openEdit(r)}
            />
          ))
        )}
      </div>

      <RewardForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />
    </>
  );
}

interface RewardItemProps {
  reward: RewardData;
  currentXp: number;
  onEdit: () => void;
}

function RewardItem({ reward, currentXp, onEdit }: RewardItemProps) {
  const available = currentXp >= reward.cost;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);
  const log = useTelemetry((s) => s.log);

  function handleRedeem(e: React.MouseEvent) {
    setError(null);
    setSuccess(false);
    const clickX = e.clientX;
    const clickY = e.clientY;
    startTransition(async () => {
      // Spawn XP loss indicator instantly
      spawnXpAt({ clientX: clickX, clientY: clickY }, reward.cost, "loss");

      const result = await redeemRewardAction(reward.id);
      if ("error" in result) {
        setError(result.error);
        setTimeout(() => setError(null), 3000);
        log("REDEMPTION FAILED", { severity: "critical", detail: result.error });
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        log("REWARD REDEEMED", {
          severity: "success",
          detail: `${reward.name} :: −${reward.cost} XP`,
        });
      }
    });
  }

  return (
    <div
      className={cn(
        "group relative border p-4 transition-all",
        available
          ? "border-vital-discipline/30 bg-vital-discipline/[0.04] hover:border-vital-discipline/60"
          : "border-fg-muted/20 bg-ink-800/30 opacity-70"
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-display text-sm font-bold tracking-wider text-fg-primary">
          {reward.name}
        </span>
        <div className="flex items-center gap-2">
          {!available && <Lock className="h-3 w-3 text-fg-muted" />}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 100)}
              className="text-fg-muted opacity-0 transition-opacity hover:text-fg-primary group-hover:opacity-100"
              aria-label="Reward actions"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 min-w-[140px] border border-cyan/30 bg-ink-900/95 shadow-lg backdrop-blur-md">
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
                    setDeactivateConfirm(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs text-fg-secondary hover:bg-magenta/10 hover:text-magenta"
                >
                  <Archive className="h-3 w-3" /> ARCHIVE
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {reward.description && (
        <p className="mb-3 text-[11px] leading-relaxed text-fg-tertiary">{reward.description}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-fg-tertiary">
          COST // {reward.cost.toLocaleString()} XP
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

      <ConfirmDialog
        open={deactivateConfirm}
        onClose={() => setDeactivateConfirm(false)}
        onConfirm={() => deactivateRewardAction(reward.id)}
        title="ARCHIVE REWARD"
        message={`Archive "${reward.name}"? It will no longer appear in the reward cache. Redemption history is preserved.`}
        confirmLabel="ARCHIVE"
        variant="danger"
      />
    </div>
  );
}
