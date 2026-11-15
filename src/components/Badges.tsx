import type { Priority, RequestStatus } from "@/types/mivafix";

const STATUS_STYLES: Record<RequestStatus, { bg: string; fg: string; label: string }> = {
  PENDING: {
    bg: "var(--secondary-container-color)",
    fg: "var(--on-secondary-container-color)",
    label: "Pending",
  },
  ASSIGNED: {
    bg: "var(--primary-container-color)",
    fg: "var(--on-primary-container-color)",
    label: "Assigned",
  },
  IN_PROGRESS: {
    bg: "var(--primary-color)",
    fg: "var(--on-primary-color)",
    label: "In Progress",
  },
  RESOLVED: {
    bg: "var(--tertiary-container-color)",
    fg: "var(--on-tertiary-container-color)",
    label: "Resolved",
  },
  CLOSED: {
    bg: "var(--surface-variant-color)",
    fg: "var(--on-surface-variant-color)",
    label: "Closed",
  },
};

const PRIORITY_STYLES: Record<Priority, { bg: string; fg: string; label: string }> = {
  LOW: {
    bg: "var(--surface-container-high-color)",
    fg: "var(--on-surface-variant-color)",
    label: "Low",
  },
  MEDIUM: {
    bg: "var(--primary-container-color)",
    fg: "var(--on-primary-container-color)",
    label: "Medium",
  },
  HIGH: {
    bg: "var(--secondary-container-color)",
    fg: "var(--on-secondary-container-color)",
    label: "High",
  },
  CRITICAL: {
    bg: "var(--error-container-color)",
    fg: "var(--on-error-container-color)",
    label: "Critical",
  },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center font-semibold whitespace-nowrap"
      style={{
        backgroundColor: style.bg,
        color: style.fg,
        padding: "var(--spacing-1) var(--spacing-2_5)",
        borderRadius: "var(--radius-full)",
        fontSize: "var(--font-size-xs)",
      }}
    >
      {style.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const style = PRIORITY_STYLES[priority];
  return (
    <span
      className="inline-flex items-center font-medium whitespace-nowrap"
      style={{
        backgroundColor: style.bg,
        color: style.fg,
        padding: "var(--spacing-0_5) var(--spacing-2)",
        borderRadius: "var(--radius-sm)",
        fontSize: "var(--font-size-xs)",
      }}
    >
      {style.label}
    </span>
  );
}

