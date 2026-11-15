"use client";

import { useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { FieldError } from "@/components/FieldError";

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  rightSlot?: React.ReactNode;
  showStrength?: boolean;
  showRequiredError?: boolean;
}

const STRENGTH_META = [
  { label: "Too short", color: "var(--outline-variant-color)" },
  { label: "Weak", color: "var(--error-color)" },
  { label: "Fair", color: "var(--secondary-color)" },
  { label: "Good", color: "var(--primary-color)" },
  { label: "Strong", color: "var(--tertiary-color)" },
];

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder = "Enter your password",
  autoComplete = "current-password",
  minLength,
  rightSlot,
  showStrength = true,
  showRequiredError = false,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const isMissing = showRequiredError && !value;

  const checks = [
    { label: "8+ chars", met: value.length >= 8 },
    { label: "Capital letter", met: /[A-Z]/.test(value) },
    { label: "Number", met: /[0-9]/.test(value) },
    { label: "Special char", met: /[^A-Za-z0-9]/.test(value) },
  ];
  const score = checks.filter((c) => c.met).length;
  const meta = STRENGTH_META[score];

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="block font-medium"
          style={{ color: "var(--on-surface-color)", fontSize: "var(--font-size-sm)" }}
        >
          {label}
        </label>
        {rightSlot}
      </div>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[44px] border pl-3 pr-11"
          style={{
            backgroundColor: "var(--surface-container-low-color)",
            borderColor: isMissing ? "var(--error-color)" : "var(--outline-variant-color)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-base)",
          }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-0 top-0 flex h-[44px] w-[44px] items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
          style={{ color: "var(--on-surface-variant-color)" }}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <FieldError show={isMissing} />

      {showStrength && value.length > 0 && (
        <div className="mt-2 space-y-1.5" aria-live="polite">
          <div className="flex items-center justify-between gap-2">
            <div className="grid flex-1 grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((step) => (
                <span
                  key={step}
                  className="h-1.5 block transition-colors"
                  style={{
                    borderRadius: "var(--radius-full)",
                    backgroundColor: step <= score ? meta.color : "var(--surface-container-high-color)",
                  }}
                />
              ))}
            </div>
            <span
              className="font-semibold"
              style={{ color: meta.color, fontSize: "var(--font-size-xs)" }}
            >
              {meta.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 pt-0.5">
            {checks.map((c) => (
              <span
                key={c.label}
                className="inline-flex items-center gap-1"
                style={{
                  color: c.met ? "var(--tertiary-color)" : "var(--on-surface-variant-color)",
                  fontSize: "var(--font-size-xs)",
                }}
              >
                <Check className="h-3 w-3 shrink-0" style={{ opacity: c.met ? 1 : 0.35 }} />
                {c.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
