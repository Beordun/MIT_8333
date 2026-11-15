"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Wrench, Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";

function validateStrongPassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw)) return "Password must include at least one capital letter.";
  if (!/[0-9]/.test(pw)) return "Password must include at least one number.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Password must include at least one special character.";
  return null;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const pwErr = validateStrongPassword(password);
    if (pwErr) {
      setError(pwErr);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Password reset failed.");
        return;
      }
      setSuccess(data.message || "Password reset successfully.");
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
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
            Reset your password
          </h1>
          <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}>
            Enter your 6-digit OTP and a new password
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

      {success && (
        <div
          className="mt-4 p-3 font-medium"
          style={{
            backgroundColor: "var(--tertiary-container-color)",
            color: "var(--on-tertiary-container-color)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {success}
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
            6-Digit Reset Code (10-minute expiry)
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

        <div className="space-y-1">
          <PasswordInput
            id="new-password"
            label="New Password"
            value={password}
            onChange={setPassword}
            minLength={8}
            autoComplete="new-password"
            placeholder="Enter new strong password"
          />
          <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}>
            At least 8 characters with 1 capital letter, 1 number and 1 special character.
          </p>
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
          {loading ? "Resetting password..." : "Update password"}
        </button>
      </form>

      <p className="mt-5 text-center" style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}>
        Need a new code?{" "}
        <Link href="/forgot-password" className="font-semibold underline" style={{ color: "var(--primary-color)" }}>
          Request again
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{ backgroundColor: "var(--background-color)" }}
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}

