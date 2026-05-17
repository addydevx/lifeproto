"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, BookOpen } from "lucide-react";
import { restartOnboardingAction } from "@/actions/onboarding";

export function ReplayTourButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleReplay() {
    startTransition(async () => {
      await restartOnboardingAction();
      router.push("/dashboard");
    });
  }

  return (
    <button onClick={handleReplay} disabled={isPending} className="hud-btn !py-1.5 !px-3 !text-[10px]">
      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <BookOpen className="h-3 w-3" />}
      <span>{isPending ? "STARTING…" : "REPLAY TOUR"}</span>
    </button>
  );
}
