"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { logoutAction } from "@/actions/auth";
import {
  LayoutGrid,
  Target,
  GitBranch,
  Gift,
  User,
  LogOut,
  Loader2,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "DASHBOARD", code: "00", icon: LayoutGrid },
  { href: "/quests", label: "QUEST LOG", code: "01", icon: Target },
  { href: "/skills", label: "SKILL MATRIX", code: "02", icon: GitBranch },
  { href: "/rewards", label: "REWARD CACHE", code: "03", icon: Gift },
  { href: "/profile", label: "OPERATOR", code: "04", icon: User },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [, startNavTransition] = useTransition();
  const [isLogoutPending, startLogoutTransition] = useTransition();
  // Tracks which link was clicked while navigation is pending. Cleared once pathname catches up.
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  function navigateTo(href: string) {
    if (pathname === href || href === pendingHref) return;
    setPendingHref(href);
    startNavTransition(() => {
      router.push(href);
    });
  }

  // Once the pathname matches the pending href, clear the pending state
  if (pendingHref && pathname.startsWith(pendingHref)) {
    // Schedule clearing to avoid setState during render
    setTimeout(() => setPendingHref(null), 0);
  }

  function handleLogout() {
    startLogoutTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col border-r border-cyan/15 bg-ink-950/80 backdrop-blur-md lg:flex">
      <div className="border-b border-cyan/15 px-6 py-5">
        <div className="font-display text-xl font-bold tracking-[0.2em] text-cyan text-glow-cyan">
          NIGHT//OS
        </div>
        <div className="mt-1 font-mono text-[10px] tracking-wider text-fg-muted">
          v0.1.0 // PROTOCOL ACTIVE
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="mb-2 px-3 hud-label">SYSTEM MODULES</div>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            // Show "active" optimistically — either current path matches, or this item is the click target
            const isCurrent = pathname === item.href || pathname.startsWith(item.href + "/");
            const isPendingTarget = pendingHref === item.href;
            const active = isPendingTarget || isCurrent;
            const showLoader = isPendingTarget && pendingHref !== null && !isCurrent;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch
                  onClick={(e) => {
                    // Use router.push so we can drive the optimistic pending state.
                    // Without this, Next.js handles navigation directly and our state never fires.
                    e.preventDefault();
                    navigateTo(item.href);
                  }}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 font-mono text-xs tracking-wider transition-colors",
                    active
                      ? "bg-cyan/10 text-cyan"
                      : "text-fg-tertiary hover:bg-ink-800/60 hover:text-fg-secondary"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-0 h-full w-[2px] bg-cyan shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
                  )}
                  <span className="text-[10px] text-fg-muted">{item.code}</span>
                  {showLoader ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  )}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 mb-2 px-3 hud-label">SESSION</div>
        <button
          onClick={handleLogout}
          disabled={isLogoutPending}
          className="group flex w-full items-center gap-3 px-3 py-2.5 font-mono text-xs tracking-wider text-fg-tertiary transition-colors hover:bg-magenta/5 hover:text-magenta disabled:opacity-50"
        >
          <span className="text-[10px] text-fg-muted">--</span>
          {isLogoutPending ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
          ) : (
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
          )}
          <span>{isLogoutPending ? "DISCONNECTING…" : "DISCONNECT"}</span>
        </button>
      </nav>

      <div className="border-t border-cyan/15 px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="hud-label">UPTIME</span>
          <span className="font-mono text-[10px] text-vital-health">ONLINE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-vital-health shadow-[0_0_6px_rgba(0,255,157,0.8)]" />
          <span className="font-mono text-[10px] text-fg-tertiary">SECURE CHANNEL</span>
        </div>
      </div>
    </aside>
  );
}
