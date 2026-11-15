"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Wrench, BookOpen, Clock } from "lucide-react";
import type { RoleName } from "@/types/mivafix";

interface AppHeaderProps {
  fullName: string;
  role: RoleName;
}

const ROLE_LABELS: Record<RoleName, string> = {
  STUDENT_STAFF: "Student / Staff",
  MAINTENANCE_OFFICER: "Maintenance Officer",
  ADMIN: "Administrator",
};

const ACTIVITY_STORAGE_KEY = "mivafix_last_activity";

export function AppHeader({ fullName, role }: AppHeaderProps) {
  const router = useRouter();
  const timeoutSeconds = role === "MAINTENANCE_OFFICER" ? 600 : 300;
  const [secondsLeft, setSecondsLeft] = useState(timeoutSeconds);
  const lastActivityRef = useRef<number>(Date.now());
  const lastRefreshRef = useRef<number>(Date.now());

  const handleLogout = useCallback(async (idle = false) => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.push(idle ? "/?session=expired" : "/");
    router.refresh();
  }, [router]);

  const recordActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, String(now));
    } catch {
      // ignore storage errors
    }

    // Refresh server session cookie at most once every 60 seconds while active
    if (now - lastRefreshRef.current >= 60_000) {
      lastRefreshRef.current = now;
      fetch("/api/auth/refresh", { method: "POST" }).then((res) => {
        if (res.status === 401) {
          handleLogout(true);
        }
      }).catch(() => null);
    }
  }, [handleLogout]);

  useEffect(() => {
    recordActivity();

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    const onUserEvent = () => recordActivity();
    events.forEach((evt) => window.addEventListener(evt, onUserEvent, { passive: true }));

    const onStorage = (e: StorageEvent) => {
      if (e.key === ACTIVITY_STORAGE_KEY && e.newValue) {
        const ts = Number(e.newValue);
        if (!Number.isNaN(ts) && ts > lastActivityRef.current) {
          lastActivityRef.current = ts;
        }
      }
    };
    window.addEventListener("storage", onStorage);

    const interval = window.setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, timeoutSeconds - elapsedSec);
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(interval);
        handleLogout(true);
      }
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, onUserEvent));
      window.removeEventListener("storage", onStorage);
      window.clearInterval(interval);
    };
  }, [recordActivity, timeoutSeconds, handleLogout]);

  return (
    <>
      <header
        className="sticky top-0 z-30 w-full border-b"
        style={{
          backgroundColor: "var(--surface-container-lowest-color)",
          borderColor: "var(--outline-variant-color)",
          boxShadow: "var(--elevation-1)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/"
              aria-label="MivaFix landing page"
              className="flex items-center gap-2.5 shrink-0 transition-opacity hover:opacity-85"
            >
              <img
                src="/images/miva-logo.png"
                alt="MIVA Open University"
                className="h-8 w-auto shrink-0 object-contain"
              />
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center"
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "var(--on-primary-color)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <Wrench className="h-4 w-4" />
              </div>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="font-bold tracking-tight transition-opacity hover:opacity-85"
                  style={{ color: "var(--primary-color)", fontSize: "var(--font-size-lg)" }}
                >
                  MivaFix
                </Link>
                <span
                  className="hidden sm:inline-block font-medium"
                  style={{
                    backgroundColor: "var(--primary-container-color)",
                    color: "var(--on-primary-container-color)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "var(--font-size-xs)",
                  }}
                >
                  {ROLE_LABELS[role]}
                </span>
              </div>
              <p
                className="truncate"
                style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}
              >
                {fullName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/api-docs"
              className="inline-flex min-h-[44px] items-center gap-1.5 px-3 font-medium transition-opacity hover:opacity-80"
              style={{
                color: "var(--primary-color)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">API Docs</span>
            </Link>
            <button
              type="button"
              onClick={() => handleLogout(false)}
              className="inline-flex min-h-[44px] items-center gap-1.5 px-3 font-medium cursor-pointer transition-opacity hover:opacity-85"
              style={{
                backgroundColor: "var(--surface-container-color)",
                color: "var(--on-surface-color)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {secondsLeft <= 60 && secondsLeft > 0 && (
        <div
          role="alert"
          className="mx-auto mt-3 flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5"
          style={{
            backgroundColor: "var(--secondary-container-color)",
            color: "var(--on-secondary-container-color)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          <span className="flex items-center gap-2 font-medium">
            <Clock className="h-4 w-4 shrink-0" />
            You will be signed out due to inactivity in {secondsLeft}s.
          </span>
          <button
            type="button"
            onClick={recordActivity}
            className="min-h-[36px] px-3 font-semibold cursor-pointer"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "var(--on-primary-color)",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--font-size-xs)",
            }}
          >
            Stay signed in
          </button>
        </div>
      )}
    </>
  );
}
