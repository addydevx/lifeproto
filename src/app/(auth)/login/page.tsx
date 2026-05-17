"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Terminal, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.08) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-6 flex items-center justify-center gap-2">
          <Terminal className="h-4 w-4 text-cyan" />
          <span className="font-mono text-xs tracking-[0.3em] text-cyan">NIGHT//OS</span>
        </div>

        <div className="hud-panel hud-corners p-8">
          <div className="mb-6">
            <div className="mb-2 font-mono text-[10px] tracking-[0.25em] text-cyan">
              // RESUME SESSION
            </div>
            <h1 className="font-display text-2xl font-bold tracking-wider text-fg-primary">
              OPERATOR AUTHENTICATION
            </h1>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="hud-label mb-1.5 block">IDENTIFIER</label>
              <input
                type="email"
                name="email"
                required
                disabled={isPending}
                placeholder="operator@nightos.sys"
                className="w-full border border-cyan/20 bg-ink-900/50 px-3 py-2.5 font-mono text-sm text-fg-primary placeholder:text-fg-muted focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan/30 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="hud-label mb-1.5 block">PASSPHRASE</label>
              <input
                type="password"
                name="password"
                required
                disabled={isPending}
                placeholder="••••••••••••"
                className="w-full border border-cyan/20 bg-ink-900/50 px-3 py-2.5 font-mono text-sm text-fg-primary placeholder:text-fg-muted focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan/30 disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 border border-magenta/40 bg-magenta/5 px-3 py-2">
                <AlertCircle className="mt-px h-3.5 w-3.5 flex-shrink-0 text-magenta" />
                <span className="font-mono text-[11px] text-magenta">{error}</span>
              </div>
            )}

            <button type="submit" disabled={isPending} className="hud-btn mt-2 w-full justify-center">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AUTHENTICATING…</span>
                </>
              ) : (
                <>
                  <span>ESTABLISH CONNECTION</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-cyan/15 pt-4 text-center">
            <Link
              href="/signup"
              className="font-mono text-[11px] tracking-wider text-fg-tertiary transition-colors hover:text-cyan"
            >
              NO OPERATOR PROFILE? → INITIATE
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center font-mono text-[10px] tracking-wider text-fg-muted">
          ENCRYPTED · GATEWAY · v0.1.0
        </div>
      </motion.div>
    </main>
  );
}
