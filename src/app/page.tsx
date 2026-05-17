"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GlitchText } from "@/components/hud/GlitchText";
import { ChevronRight, Terminal, Target, GitBranch, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Animated grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.08) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />

      {/* Floating accent line */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/3 h-px bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />

      {/* Top status bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-cyan/10 px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-cyan shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
          <span className="font-mono text-[10px] tracking-[0.2em] text-cyan">
            SYSTEM // STANDBY
          </span>
        </div>
        <div className="font-mono text-[10px] tracking-wider text-fg-tertiary">
          AUTH GATEWAY // v0.1.0
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-57px)] max-w-6xl flex-col items-center justify-center px-6 py-12">
        {/* Logo / brand */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center gap-3"
        >
          <Terminal className="h-5 w-5 text-cyan" />
          <span className="font-mono text-xs tracking-[0.3em] text-fg-secondary">
            NIGHT//OS
          </span>
        </motion.div>

        {/* Hero headline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          <div className="mb-4 font-mono text-[11px] tracking-[0.3em] text-cyan">
            // OPERATOR PROTOCOL INITIATED
          </div>
          <h1 className="font-display text-5xl font-black tracking-tight text-fg-primary md:text-7xl">
            TURN YOUR LIFE
            <br />
            INTO A{" "}
            <GlitchText className="text-cyan text-glow-cyan" as="span">
              SYSTEM
            </GlitchText>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-fg-secondary">
            Daily directives. Long-form quests. Stat progression. Real rewards
            when you actually do the work. Your discipline, quantified.
          </p>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link href="/signup" className="hud-btn">
            <span>INITIATE PROTOCOL</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="font-mono text-xs uppercase tracking-hud text-fg-tertiary transition-colors hover:text-cyan"
          >
            Resume existing session →
          </Link>
        </motion.div>

        {/* Feature blocks */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-24 grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-3"
        >
          {[
            {
              code: "01",
              icon: Target,
              title: "DUAL QUEST SYSTEM",
              desc: "Daily directives that reset, plus long-arc quest lines with chapters. Habits and ambition, structured.",
            },
            {
              code: "02",
              icon: GitBranch,
              title: "VITAL STATS",
              desc: "Health, Mind, Discipline, Social. Every task you complete moves the bars. See yourself in numbers.",
            },
            {
              code: "03",
              icon: Zap,
              title: "REWARD CACHE",
              desc: "Earn XP. Spend it on what you actually enjoy. The things you love, gated behind the things you should.",
            },
          ].map((feat, i) => (
            <div
              key={feat.code}
              className="hud-panel hud-corners relative p-5 transition-colors hover:border-cyan/40"
            >
              <div className="mb-3 flex items-center justify-between">
                <feat.icon className="h-5 w-5 text-cyan" strokeWidth={1.5} />
                <span className="font-mono text-[10px] tracking-wider text-fg-muted">
                  //{feat.code}
                </span>
              </div>
              <h3 className="mb-2 font-display text-sm font-bold tracking-wider text-fg-primary">
                {feat.title}
              </h3>
              <p className="text-xs leading-relaxed text-fg-secondary">
                {feat.desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Bottom telemetry strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-24 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[10px] tracking-wider text-fg-muted"
        >
          <span>SECURE.CHANNEL: ACTIVE</span>
          <span className="text-cyan/30">//</span>
          <span>ENCRYPTION: AES-256</span>
          <span className="text-cyan/30">//</span>
          <span>NODES: 0001</span>
          <span className="text-cyan/30">//</span>
          <span className="text-cyan">READY FOR INPUT</span>
        </motion.div>
      </div>
    </main>
  );
}
