"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TimerProvider } from "./components/TimerProvider";
import { TimerBadge } from "./components/TimerBadge";
import { LockScreen } from "./components/LockScreen";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [pin, setPin] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null | undefined>(undefined);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    let unsubscribe = () => {};

    import("@funberry/supabase")
      .then(async ({ getParent, getCurrentUser, supabase }) => {
        const user = await getCurrentUser();
        if (!mounted) return;
        setAuthUserId(user?.id ?? null);
        if (user) {
          const p = await getParent();
          if (mounted) setPin(p?.pin ?? null);
        } else {
          setPin(null);
        }

        const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
          const nextUserId = session?.user?.id ?? null;
          if (!mounted) return;
          setAuthUserId(nextUserId);
          if (!nextUserId) {
            setPin(null);
            return;
          }
          const p = await getParent();
          if (mounted) setPin(p?.pin ?? null);
        });
        unsubscribe = () => data.subscription.unsubscribe();
      })
      .catch(() => {
        if (!mounted) return;
        setAuthUserId(null);
        setPin(null);
      });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const isParentSurface = pathname?.startsWith("/dashboard");
  // The kid play surface (/play) has its own themed Home control, so the global
  // floating Home button is hidden there to avoid a confusing duplicate button.
  const hideFloatingHome =
    pathname === "/" ||
    pathname?.startsWith("/play") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/auth") ||
    pathname?.startsWith("/admin");
  const homeHref = isParentSurface ? "/dashboard" : "/play";

  return (
    <TimerProvider
      key={`timer-${authUserId ?? "guest"}`}
      pin={pin}
      storageKey={`funberrykids_timer_${authUserId ?? "guest"}`}
      enabled={Boolean(authUserId)}
    >
      <TimerBadge />
      <LockScreen />
      {!hideFloatingHome ? (
        <Link
          href={homeHref}
          aria-label={isParentSurface ? "Go to parent home" : "Go to play home"}
          className="fixed left-4 top-20 z-[60] inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-2 text-xs font-extrabold text-slate-800 shadow-[0_8px_18px_-10px_rgba(15,23,42,0.45)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
        >
          <span aria-hidden>🏠</span>
          Home
        </Link>
      ) : null}
      {children}
    </TimerProvider>
  );
}
