"use client";

import { AlertCircle } from "lucide-react";

interface FieldErrorProps {
  show?: boolean;
  message?: string;
}

export function FieldError({
  show = false,
  message = "This is a required field",
}: FieldErrorProps) {
  if (!show) return null;

  return (
    <div
      role="alert"
      className="mt-1.5 flex items-center gap-2 px-3 py-2 font-medium"
      style={{
        backgroundColor: "var(--error-container-color)",
        color: "var(--on-error-container-color)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--font-size-xs)",
      }}
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

