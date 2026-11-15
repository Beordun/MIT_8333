"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Wrench, Loader2 } from "lucide-react";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed.");
        return;
      }
      router.push(data.redirectTo || "/dashboard/requester");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");
    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not resend code.");
    } else {
      setInfo(data.message || "A new 6-digit code has been sent.");
    }
  }

  return (
    <div
      className="w-full max-w-md"
      style={{
        backgroundColor: "var(--surface-container-lowest-color)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--spacing-6)",
        boxShadow: "var(--elevation-2)",
        border: "1px solid var(--outline-variant-color)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <Link href="/" aria-label="Return to landing page" className="flex items-center gap-2.5 shrink-0 transition-opacity hover:opacity-85">
          <img src="/images/miva-logo.png" alt="MIVA Open University" className="h-9 w-auto shrink-0 object-contain" />
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
        <div>
          <h1 className="font-bold" style={{ color: "var(--primary-color)", fontSize: "var(--font-size-xl)" }}>
            Verify your email
          </h1>
          <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}>
            Enter the 6-digit code (expires in 10 minutes)
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 p-3 font-medium"
          style={{
            backgroundColor: "var(--error-container-color)",
            color: "var(--on-error-container-color)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {error}
        </div>
      )}

      {info && (
        <div
          className="mt-4 p-3 font-medium"
          style={{
            backgroundColor: "var(--tertiary-container-color)",
            color: "var(--on-tertiary-container-color)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {info}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
            University Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-[44px] border px-3"
            style={{
              backgroundColor: "var(--surface-container-low-color)",
              borderColor: "var(--outline-variant-color)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-base)",
            }}
          />
        </div>

        <div>
          <label htmlFor="code" className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
            6-Digit Verification Code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="w-full min-h-[44px] border px-3 tracking-widest font-semibold"
            style={{
              backgroundColor: "var(--surface-container-low-color)",
              borderColor: "var(--outline-variant-color)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-lg)",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full min-h-[48px] items-center justify-center gap-2 font-semibold cursor-pointer disabled:opacity-60"
          style={{
            backgroundColor: "var(--primary-color)",
            color: "var(--on-primary-color)",
            borderRadius: "var(--radius-md)",
          }}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Verify &amp; Continue
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between" style={{ fontSize: "var(--font-size-xs)" }}>
        <button
          type="button"
          onClick={handleResend}
          className="font-semibold underline cursor-pointer"
          style={{ color: "var(--primary-color)" }}
        >
          Resend 6-digit code
        </button>
        <Link href="/login" className="underline" style={{ color: "var(--on-surface-variant-color)" }}>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{ backgroundColor: "var(--background-color)" }}
    >
      <Suspense fallback={null}>
        <VerifyEmailForm />
      </Suspense>
    </main>
  );
}

