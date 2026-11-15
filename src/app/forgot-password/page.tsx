"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to process request.");
        return;
      }
      router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{ backgroundColor: "var(--background-color)" }}
    >
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
              Forgot password
            </h1>
            <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}>
              Receive a single-use 6-digit reset code
            </p>
          </div>
        </div>

        <p className="mt-4" style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}>
          Enter your university email address. We will send a 6-digit verification code that expires after 10 minutes.
        </p>

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
              placeholder="name@miva.edu.ng"
              className="w-full min-h-[44px] border px-3"
              style={{
                backgroundColor: "var(--surface-container-low-color)",
                borderColor: "var(--outline-variant-color)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-base)",
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
            {loading ? "Sending code..." : "Send 6-digit code"}
          </button>
        </form>

        <p className="mt-5 text-center" style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}>
          Remembered your password?{" "}
          <Link href="/login" className="font-semibold underline" style={{ color: "var(--primary-color)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

