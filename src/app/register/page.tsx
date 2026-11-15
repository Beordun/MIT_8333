"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";

function validateStrongPassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw)) return "Password must include at least one capital letter.";
  if (!/[0-9]/.test(pw)) return "Password must include at least one number.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Password must include at least one special character.";
  return null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, department, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed. Please check your details.");
        return;
      }
      router.push(`/verify-email?email=${encodeURIComponent(data.email || email)}`);
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
            <img
              src="/images/miva-logo.png"
              alt="MIVA Open University"
              className="h-9 w-auto shrink-0 object-contain"
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
          <div>
            <h1 className="font-bold" style={{ color: "var(--primary-color)", fontSize: "var(--font-size-xl)" }}>
              Create your account
            </h1>
            <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}>
              Student &amp; Staff Registration
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Toluwani Adeyemi"
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

          <div>
            <label htmlFor="department" className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
              Department or Hostel Block
            </label>
            <input
              id="department"
              name="department"
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. M.Sc. IT / Hostel Block B"
              className="w-full min-h-[44px] border px-3"
              style={{
                backgroundColor: "var(--surface-container-low-color)",
                borderColor: "var(--outline-variant-color)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-base)",
              }}
            />
          </div>

          <div className="space-y-1">
            <PasswordInput
              id="password"
              label="Password"
              value={password}
              onChange={setPassword}
              minLength={8}
              autoComplete="new-password"
              placeholder="Choose a strong password"
            />
            <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}>
              At least 8 characters with 1 capital letter, 1 number and 1 special character.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full min-h-[48px] items-center justify-center gap-2 font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "var(--on-primary-color)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-base)",
            }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p
          className="mt-5 text-center"
          style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}
        >
          Already registered?{" "}
          <Link href="/login" className="font-semibold underline" style={{ color: "var(--primary-color)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
