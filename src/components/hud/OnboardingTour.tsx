"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { GlitchText } from "@/components/hud/GlitchText";
import { completeOnboardingAction } from "@/actions/onboarding";

interface Step {
  title: string;
  subtitle: string;
  body: string;
  hint?: string;
}

const STEPS: Step[] = [
  {
    title: "WELCOME, OPERATOR",
    subtitle: "// SYSTEM BRIEFING // 01 OF 06",
    body: "You're now connected to NIGHT//OS — a system that turns your daily life into a tracked, gamified protocol. Complete directives, run quests, earn XP, redeem rewards. Discipline, quantified.",
    hint: "Take the tour to see how each module works. You can skip and replay anytime from your operator profile.",
  },
  {
    title: "DAILY DIRECTIVES",
    subtitle: "// MODULE 00 // CORE LOOP",
    body: "Directives are recurring tasks you commit to. Each one is tagged with a VITAL (Health, Mind, Discipline, Social) and pays out XP on completion. Click a directive to mark it complete — your stats grow, your streak extends, your XP accrues.",
    hint: "Click '+ ADD DIRECTIVE' on the dashboard to define your first one.",
  },
  {
    title: "QUEST LOG",
    subtitle: "// MODULE 01 // LONG-FORM PROJECTS",
    body: "Quests are bigger objectives broken into chapters. Each chapter completed awards a slice of XP. Finish all chapters → quest cleared. Quests are how you ship long-term work: building something, learning a skill, hitting a milestone.",
    hint: "Initiate your first quest from the QUEST LOG page. Define chapters as concrete checkpoints.",
  },
  {
    title: "SKILL MATRIX",
    subtitle: "// MODULE 02 // VITAL TRACKING",
    body: "Every directive you complete moves a VITAL bar. The Skill Matrix shows your current values plus 30-day trends. You can see, in numbers, where your effort actually goes — and where it doesn't.",
    hint: "Stats are read-only — they reflect your real actions. They can't be edited directly.",
  },
  {
    title: "REWARD CACHE",
    subtitle: "// MODULE 03 // INCENTIVE SYSTEM",
    body: "Define rewards you actually enjoy — a gaming session, a movie night, ordering food — and price them in XP. Earn the XP through directives and quests, then spend it on the things you love. The things you love, gated behind the things you should.",
    hint: "Create your first reward. Set the cost low enough that it feels earnable in a week.",
  },
  {
    title: "OPERATOR PROFILE",
    subtitle: "// MODULE 04 // YOUR STATUS",
    body: "Your profile shows level, total XP, streak, longest streak, lifetime directives completed, rewards redeemed. It's the long-view dashboard. You can also replay this tour from the profile page anytime.",
    hint: "That's the full system. Now go define your first directive and start earning XP.",
  },
];

interface OnboardingTourProps {
  show: boolean;
}

export function OnboardingTour({ show }: OnboardingTourProps) {
  const [open, setOpen] = useState(show);
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setOpen(show);
  }, [show]);

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }
  function prev() {
    setStep((s) => Math.max(0, s - 1));
  }
  function skip() {
    finish();
  }
  function finish() {
    setOpen(false);
    startTransition(async () => {
      await completeOnboardingAction();
    });
  }

  if (!open) return null;

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[75] flex items-center justify-center bg-ink-950/90 backdrop-blur-md px-4"
        >
          {/* Animated scan line background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,229,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.06) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              maskImage: "radial-gradient(ellipse at center, black 20%, transparent 80%)",
            }}
          />

          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative w-full max-w-xl border border-cyan/30 bg-ink-900/95 backdrop-blur-md"
            style={{ boxShadow: "0 0 60px rgba(0,229,255,0.12), inset 0 0 30px rgba(0,229,255,0.04)" }}
          >
            {[
              "top-0 left-0 border-t border-l",
              "top-0 right-0 border-t border-r",
              "bottom-0 left-0 border-b border-l",
              "bottom-0 right-0 border-b border-r",
            ].map((pos) => (
              <span key={pos} className={`pointer-events-none absolute h-3 w-3 border-cyan ${pos}`} />
            ))}

            {/* Skip button */}
            <button
              onClick={skip}
              className="absolute right-3 top-3 z-10 text-fg-tertiary transition-colors hover:text-fg-primary"
              aria-label="Skip tour"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-8">
              <div className="mb-2 font-mono text-[10px] tracking-[0.3em] text-cyan">
                {current.subtitle}
              </div>
              <h2 className="mb-3 font-display text-2xl font-black tracking-wider text-fg-primary md:text-3xl">
                <GlitchText className="inline-block" as="span">
                  {current.title}
                </GlitchText>
              </h2>

              <p className="mb-4 text-sm leading-relaxed text-fg-secondary">{current.body}</p>

              {current.hint && (
                <div className="border-l-2 border-l-cyan/40 bg-cyan/[0.04] px-3 py-2">
                  <div className="hud-label mb-1 text-cyan">PROTOCOL HINT</div>
                  <p className="font-mono text-xs leading-relaxed text-fg-secondary">{current.hint}</p>
                </div>
              )}
            </div>

            {/* Progress + nav */}
            <div className="border-t border-cyan/15 bg-ink-950/60 px-6 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-wider text-fg-tertiary">
                  STEP {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
                </span>
                <span className="font-mono text-[10px] tracking-wider text-cyan">
                  {Math.round(progress)}% LOADED
                </span>
              </div>
              <div className="mb-4 relative h-[3px] w-full bg-cyan/15">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-cyan shadow-[0_0_8px_rgba(0,229,255,0.8)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <div className="flex items-center justify-between">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={prev}
                    className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-hud text-fg-tertiary transition-colors hover:text-fg-primary"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    PREV
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={skip}
                    className="font-mono text-xs uppercase tracking-hud text-fg-tertiary transition-colors hover:text-fg-primary"
                  >
                    SKIP TOUR
                  </button>
                )}

                <button
                  type="button"
                  onClick={next}
                  disabled={isPending}
                  className="hud-btn !py-2 !px-4"
                >
                  <span>{step === STEPS.length - 1 ? "BEGIN PROTOCOL" : "NEXT"}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
