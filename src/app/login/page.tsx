"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, Loader2, GraduationCap, HardHat, ShieldCheck } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";
import { FieldError } from "@/components/FieldError";

type LoginRole = "STUDENT_STAFF" | "MAINTENANCE_OFFICER" | "ADMIN";
type AuthMode = "login" | "register" | "verify-email" | "forgot" | "reset";

const ROLE_TABS: {
  id: LoginRole;
  label: string;
  subtitle: string;
  placeholder: string;
  buttonText: string;
  icon: typeof GraduationCap;
}[] = [
  {
    id: "STUDENT_STAFF",
    label: "Student / Staff",
    subtitle: "Report campus faults and track repair progress",
    placeholder: "student@miva.edu.ng",
    buttonText: "Sign in as Student / Staff",
    icon: GraduationCap,
  },
  {
    id: "MAINTENANCE_OFFICER",
    label: "Maintenance",
    subtitle: "View assigned jobs and log field repair updates",
    placeholder: "officer@miva.edu.ng",
    buttonText: "Sign in as Maintenance Officer",
    icon: HardHat,
  },
  {
    id: "ADMIN",
    label: "Admin",
    subtitle: "Dispatch officers, manage users and export reports",
    placeholder: "admin@miva.edu.ng",
    buttonText: "Sign in as Administrator",
    icon: ShieldCheck,
  },
];

function validateStrongPassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw)) return "Password must include at least one capital letter.";
  if (!/[0-9]/.test(pw)) return "Password must include at least one number.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Password must include at least one special character.";
  return null;
}

export default function UnifiedAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [selectedRole, setSelectedRole] = useState<LoginRole>("STUDENT_STAFF");

  // Shared & mode-specific form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Feedback banners
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get("role");
    const modeParam = params.get("mode");
    const emailParam = params.get("email");

    if (
      roleParam === "STUDENT_STAFF" ||
      roleParam === "MAINTENANCE_OFFICER" ||
      roleParam === "ADMIN"
    ) {
      setSelectedRole(roleParam);
    }

    if (
      modeParam === "login" ||
      modeParam === "register" ||
      modeParam === "verify-email" ||
      modeParam === "forgot" ||
      modeParam === "reset"
    ) {
      setMode(modeParam);
    }

    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  const activeTab = ROLE_TABS.find((t) => t.id === selectedRole) ?? ROLE_TABS[0];

  function switchMode(nextMode: AuthMode, nextInfo = "") {
    setMode(nextMode);
    setAttemptedSubmit(false);
    setError("");
    setInfo(nextInfo);
    setPassword("");
    setCode("");
  }

  function handleTabChange(role: LoginRole) {
    setSelectedRole(role);
    setAttemptedSubmit(false);
    setError("");
    setInfo("");
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttemptedSubmit(true);
    if (!email.trim() || !password) {
      return;
    }

    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sign in failed. Please check your details.");
        return;
      }
      if (data.requiresVerification) {
        if (data.email) setEmail(data.email);
        switchMode(
          "verify-email",
          data.message || "Please verify your email address with the 6-digit code sent to your inbox."
        );
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

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttemptedSubmit(true);
    setError("");
    setInfo("");

    if (!fullName.trim() || !email.trim() || !department.trim() || !roomNumber.trim() || !password) {
      return;
    }

    const pwErr = validateStrongPassword(password);
    if (pwErr) {
      setError(pwErr);
      return;
    }

    const combinedLocation = `${department.trim()}, ${roomNumber.trim()}`;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          department: combinedLocation,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed. Please check your details.");
        return;
      }
      if (data.email) setEmail(data.email);
      switchMode(
        "verify-email",
        data.message || "Account created! Enter the 6-digit code sent to your email."
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttemptedSubmit(true);
    setError("");
    setInfo("");

    if (!email.trim() || !code.trim()) {
      return;
    }

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

  async function handleResendVerification() {
    setError("");
    setInfo("");
    if (!email.trim()) {
      setAttemptedSubmit(true);
      return;
    }
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not resend code.");
      } else {
        setInfo(data.message || "A new 6-digit verification code has been sent.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  }

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttemptedSubmit(true);
    setError("");
    setInfo("");

    if (!email.trim()) {
      return;
    }

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
      switchMode(
        "reset",
        data.message || "Enter the 6-digit reset code sent to your email and choose a new password."
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttemptedSubmit(true);
    setError("");
    setInfo("");

    if (!email.trim() || !code.trim() || !password) {
      return;
    }

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
      switchMode(
        "login",
        data.message || "Password updated! Please sign in with your new password."
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const headerMeta: Record<AuthMode, { title: string; subtitle: string }> = {
    login: {
      title: "Sign in to MivaFix",
      subtitle: activeTab.subtitle,
    },
    register: {
      title: "Create your account",
      subtitle: "Student & Staff Self-Registration",
    },
    "verify-email": {
      title: "Verify your email",
      subtitle: "Enter the 6-digit code sent to your inbox (10-min expiry)",
    },
    forgot: {
      title: "Forgot password",
      subtitle: "Receive a single-use 6-digit reset code",
    },
    reset: {
      title: "Reset your password",
      subtitle: "Enter your 6-digit code and choose a new password",
    },
  };

  function getFieldStyle(isMissing: boolean) {
    return {
      backgroundColor: "var(--surface-container-low-color)",
      borderColor: isMissing ? "var(--error-color)" : "var(--outline-variant-color)",
      borderRadius: "var(--radius-md)",
      fontSize: "var(--font-size-base)",
    } as const;
  }

  const primaryButtonStyle = {
    backgroundColor: "var(--primary-color)",
    color: "var(--on-primary-color)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--font-size-base)",
  } as const;

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{ backgroundColor: "var(--background-color)" }}
    >
      <div
        className="w-full max-w-md transition-all duration-200"
        style={{
          backgroundColor: "var(--surface-container-lowest-color)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--spacing-6)",
          boxShadow: "var(--elevation-2)",
          border: "1px solid var(--outline-variant-color)",
        }}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            aria-label="Return to landing page"
            className="flex items-center gap-2.5 shrink-0 transition-opacity hover:opacity-85"
          >
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
              {headerMeta[mode].title}
            </h1>
            <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}>
              {headerMeta[mode].subtitle}
            </p>
          </div>
        </div>

        {/* 3-Role Tab Switcher (Shown in Login mode) */}
        {mode === "login" && (
          <div
            role="tablist"
            aria-label="Select portal role"
            className="mt-5 grid grid-cols-3 gap-1 p-1"
            style={{
              backgroundColor: "var(--surface-container-color)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--outline-variant-color)",
            }}
          >
            {ROLE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedRole === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabChange(tab.id)}
                  className="flex min-h-[44px] flex-col items-center justify-center gap-1 px-2 py-1.5 font-semibold cursor-pointer transition-all"
                  style={{
                    backgroundColor: isActive ? "var(--primary-color)" : "transparent",
                    color: isActive ? "var(--on-primary-color)" : "var(--on-surface-variant-color)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--font-size-xs)",
                    boxShadow: isActive ? "var(--elevation-1)" : "none",
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate max-w-full">{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Alert Banners */}
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
            role="status"
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

        {/* 1. LOGIN VIEW */}
        {mode === "login" && (
          <>
            <form noValidate onSubmit={handleLoginSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1 block font-medium"
                  style={{ color: "var(--on-surface-color)", fontSize: "var(--font-size-sm)" }}
                >
                  University Email
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab.placeholder}
                  className="w-full min-h-[44px] border px-3"
                  style={getFieldStyle(attemptedSubmit && !email.trim())}
                />
                <FieldError show={attemptedSubmit && !email.trim()} />
              </div>

              <PasswordInput
                id="login-password"
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="Enter your password"
                autoComplete="current-password"
                showRequiredError={attemptedSubmit}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="font-semibold underline cursor-pointer"
                    style={{ color: "var(--primary-color)", fontSize: "var(--font-size-xs)" }}
                  >
                    Forgot password?
                  </button>
                }
              />

              <button
                type="submit"
                disabled={loading}
                className="flex w-full min-h-[48px] items-center justify-center gap-2 font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-60"
                style={primaryButtonStyle}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Signing in..." : activeTab.buttonText}
              </button>
            </form>

            {selectedRole === "STUDENT_STAFF" ? (
              <p
                className="mt-5 text-center"
                style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}
              >
                New student or staff member?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="font-semibold underline cursor-pointer"
                  style={{ color: "var(--primary-color)" }}
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p
                className="mt-5 text-center"
                style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}
              >
                {selectedRole === "MAINTENANCE_OFFICER"
                  ? "Maintenance Officer accounts are provisioned by the Facilities Administrator."
                  : "Administrator accounts are provisioned by the Facilities Administration team."}
              </p>
            )}
          </>
        )}

        {/* 2. REGISTER VIEW */}
        {mode === "register" && (
          <>
            <form noValidate onSubmit={handleRegisterSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="reg-fullName" className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  Full Name
                </label>
                <input
                  id="reg-fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Toluwani Adeyemi"
                  className="w-full min-h-[44px] border px-3"
                  style={getFieldStyle(attemptedSubmit && !fullName.trim())}
                />
                <FieldError show={attemptedSubmit && !fullName.trim()} />
              </div>

              <div>
                <label htmlFor="reg-email" className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  University Email
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@miva.edu.ng"
                  className="w-full min-h-[44px] border px-3"
                  style={getFieldStyle(attemptedSubmit && !email.trim())}
                />
                <FieldError show={attemptedSubmit && !email.trim()} />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="reg-department" className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                    Hostel Block / Building
                  </label>
                  <input
                    id="reg-department"
                    name="department"
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Hostel Block B"
                    className="w-full min-h-[44px] border px-3"
                    style={getFieldStyle(attemptedSubmit && !department.trim())}
                  />
                  <FieldError show={attemptedSubmit && !department.trim()} />
                </div>

                <div>
                  <label htmlFor="reg-room" className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                    Room / Office No.
                  </label>
                  <input
                    id="reg-room"
                    name="roomNumber"
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. Room 204"
                    className="w-full min-h-[44px] border px-3"
                    style={getFieldStyle(attemptedSubmit && !roomNumber.trim())}
                  />
                  <FieldError show={attemptedSubmit && !roomNumber.trim()} />
                </div>
              </div>

              <div className="space-y-1">
                <PasswordInput
                  id="reg-password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Choose a strong password"
                  showRequiredError={attemptedSubmit}
                />
                <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}>
                  At least 8 characters with 1 capital letter, 1 number and 1 special character.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full min-h-[48px] items-center justify-center gap-2 font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-60"
                style={primaryButtonStyle}
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
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-semibold underline cursor-pointer"
                style={{ color: "var(--primary-color)" }}
              >
                Sign in
              </button>
            </p>
          </>
        )}

        {/* 3. VERIFY EMAIL OTP VIEW */}
        {mode === "verify-email" && (
          <>
            <form noValidate onSubmit={handleVerifyEmailSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="verify-email" className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  University Email
                </label>
                <input
                  id="verify-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[44px] border px-3"
                  style={getFieldStyle(attemptedSubmit && !email.trim())}
                />
                <FieldError show={attemptedSubmit && !email.trim()} />
              </div>

              <div>
                <label htmlFor="verify-code" className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  6-Digit Verification Code
                </label>
                <input
                  id="verify-code"
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
                  style={{ ...getFieldStyle(attemptedSubmit && !code.trim()), fontSize: "var(--font-size-lg)" }}
                />
                <FieldError show={attemptedSubmit && !code.trim()} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full min-h-[48px] items-center justify-center gap-2 font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-60"
                style={primaryButtonStyle}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between" style={{ fontSize: "var(--font-size-xs)" }}>
              <button
                type="button"
                onClick={handleResendVerification}
                className="font-semibold underline cursor-pointer"
                style={{ color: "var(--primary-color)" }}
              >
                Resend 6-digit code
              </button>
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="underline cursor-pointer"
                style={{ color: "var(--on-surface-variant-color)" }}
              >
                Back to sign in
              </button>
            </div>
          </>
        )}

        {/* 4. FORGOT PASSWORD VIEW */}
        {mode === "forgot" && (
          <>
            <p className="mt-4" style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}>
              Enter your university email address. We will send a 6-digit verification code that expires after 10 minutes.
            </p>

            <form noValidate onSubmit={handleForgotSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="forgot-email" className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  University Email
                </label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@miva.edu.ng"
                  className="w-full min-h-[44px] border px-3"
                  style={getFieldStyle(attemptedSubmit && !email.trim())}
                />
                <FieldError show={attemptedSubmit && !email.trim()} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full min-h-[48px] items-center justify-center gap-2 font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-60"
                style={primaryButtonStyle}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Sending code..." : "Send 6-digit code"}
              </button>
            </form>

            <p className="mt-5 text-center" style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}>
              Remembered your password?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-semibold underline cursor-pointer"
                style={{ color: "var(--primary-color)" }}
              >
                Sign in
              </button>
            </p>
          </>
        )}

        {/* 5. RESET PASSWORD VIEW */}
        {mode === "reset" && (
          <>
            <form noValidate onSubmit={handleResetSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="reset-email" className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  University Email
                </label>
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[44px] border px-3"
                  style={getFieldStyle(attemptedSubmit && !email.trim())}
                />
                <FieldError show={attemptedSubmit && !email.trim()} />
              </div>

              <div>
                <label htmlFor="reset-code" className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  6-Digit Reset Code (10-minute expiry)
                </label>
                <input
                  id="reset-code"
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
                  style={{ ...getFieldStyle(attemptedSubmit && !code.trim()), fontSize: "var(--font-size-lg)" }}
                />
                <FieldError show={attemptedSubmit && !code.trim()} />
              </div>

              <div className="space-y-1">
                <PasswordInput
                  id="reset-password"
                  label="New Password"
                  value={password}
                  onChange={setPassword}
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Enter new strong password"
                  showRequiredError={attemptedSubmit}
                />
                <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}>
                  At least 8 characters with 1 capital letter, 1 number and 1 special character.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full min-h-[48px] items-center justify-center gap-2 font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-60"
                style={primaryButtonStyle}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Resetting password..." : "Update password"}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between" style={{ fontSize: "var(--font-size-xs)" }}>
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="font-semibold underline cursor-pointer"
                style={{ color: "var(--primary-color)" }}
              >
                Request a new code
              </button>
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="underline cursor-pointer"
                style={{ color: "var(--on-surface-variant-color)" }}
              >
                Back to sign in
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
