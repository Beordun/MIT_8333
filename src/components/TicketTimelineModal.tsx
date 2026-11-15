"use client";

import { useEffect, useState } from "react";
import { X, Clock, MapPin, UserCheck } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import type { RequestDetail } from "@/types/mivafix";

interface TicketTimelineModalProps {
  requestId: string | null;
  onClose: () => void;
}

export function TicketTimelineModal({ requestId, onClose }: TicketTimelineModalProps) {
  const [detail, setDetail] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!requestId) return;
    setLoading(true);
    setError("");
    fetch(`/api/requests/${requestId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to load request details.");
        setDetail(data.request);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [requestId]);

  if (!requestId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: "var(--surface-container-lowest-color)",
          borderTopLeftRadius: "var(--radius-xl)",
          borderTopRightRadius: "var(--radius-xl)",
          borderBottomLeftRadius: "var(--radius-xl)",
          borderBottomRightRadius: "var(--radius-xl)",
          padding: "var(--spacing-6)",
          boxShadow: "var(--elevation-4)",
        }}
      >
        <div className="flex items-start justify-between gap-3 border-b pb-3" style={{ borderColor: "var(--outline-variant-color)" }}>
          <div>
            <p className="font-semibold" style={{ color: "var(--primary-color)", fontSize: "var(--font-size-xs)" }}>
              {detail?.ticketNumber ?? "Loading ticket..."}
            </p>
            <h2 className="font-bold" style={{ color: "var(--on-surface-color)", fontSize: "var(--font-size-lg)" }}>
              {detail?.title ?? "Request Details"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center cursor-pointer"
            style={{
              backgroundColor: "var(--surface-container-color)",
              borderRadius: "var(--radius-full)",
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading && (
          <p className="py-8 text-center" style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}>
            Loading ticket timeline...
          </p>
        )}

        {error && (
          <p className="my-4 p-3 rounded" style={{ backgroundColor: "var(--error-container-color)", color: "var(--on-error-container-color)", fontSize: "var(--font-size-sm)" }}>
            {error}
          </p>
        )}

        {!loading && detail && (
          <div className="mt-4 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={detail.status} />
              <PriorityBadge priority={detail.priority} />
              <span
                className="font-medium"
                style={{
                  backgroundColor: "var(--surface-container-color)",
                  color: "var(--on-surface-variant-color)",
                  padding: "var(--spacing-0_5) var(--spacing-2)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "var(--font-size-xs)",
                }}
              >
                {detail.category.name}
              </span>
            </div>

            <div className="space-y-2" style={{ fontSize: "var(--font-size-sm)" }}>
              <p className="flex items-center gap-2" style={{ color: "var(--on-surface-variant-color)" }}>
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{detail.location}</span>
              </p>
              <p style={{ color: "var(--on-surface-color)" }}>{detail.description}</p>
              {detail.assignments[0] && (
                <p className="flex items-center gap-2 pt-1 font-medium" style={{ color: "var(--primary-color)" }}>
                  <UserCheck className="h-4 w-4 shrink-0" />
                  <span>Assigned Officer: {detail.assignments[0].officer.fullName}</span>
                </p>
              )}
            </div>

            {detail.evidenceUrl && (
              <div>
                <p className="mb-1.5 font-semibold" style={{ fontSize: "var(--font-size-xs)", color: "var(--on-surface-variant-color)" }}>
                  Fault Evidence Photo
                </p>
                <img
                  src={detail.evidenceUrl}
                  alt="Fault evidence"
                  className="max-h-56 w-full object-cover border"
                  style={{
                    borderRadius: "var(--radius-md)",
                    borderColor: "var(--outline-variant-color)",
                  }}
                />
              </div>
            )}

            <div>
              <h3 className="mb-3 flex items-center gap-1.5 font-semibold" style={{ fontSize: "var(--font-size-sm)", color: "var(--on-surface-color)" }}>
                <Clock className="h-4 w-4" />
                Activity &amp; Audit Trail
              </h3>
              <ol className="space-y-3 border-l-2 pl-4" style={{ borderColor: "var(--primary-container-color)" }}>
                {detail.statusUpdates.map((item) => (
                  <li key={item.id} className="relative">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold" style={{ fontSize: "var(--font-size-xs)", color: "var(--primary-color)" }}>
                        {item.newStatus.replace("_", " ")}
                      </span>
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--on-surface-variant-color)" }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-0.5" style={{ fontSize: "var(--font-size-sm)", color: "var(--on-surface-color)" }}>
                      {item.comment}
                    </p>
                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--on-surface-variant-color)" }}>
                      By {item.updatedBy.fullName}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

