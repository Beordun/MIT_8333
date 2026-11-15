"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Wrench, X, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { TicketTimelineModal } from "@/components/TicketTimelineModal";
import { FieldError } from "@/components/FieldError";
import type { RequestItem, RequestStatus } from "@/types/mivafix";

export default function OfficerDashboardPage() {
  const [userName, setUserName] = useState("Maintenance Officer");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timelineId, setTimelineId] = useState<string | null>(null);
  const [updatingReq, setUpdatingReq] = useState<RequestItem | null>(null);
  const [newStatus, setNewStatus] = useState<RequestStatus>("IN_PROGRESS");
  const [comment, setComment] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, reqRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/requests?limit=30"),
      ]);
      if (meRes.ok) {
        const me = await meRes.json();
        setUserName(me.user.fullName);
      }
      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequests(data.requests);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleStatusSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttemptedSubmit(true);
    if (!updatingReq || !comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/requests/${updatingReq.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, comment }),
      });
      if (res.ok) {
        setToast(`Updated ${updatingReq.ticketNumber} to ${newStatus.replace("_", " ")}.`);
        setTimeout(() => setToast(""), 4000);
        setUpdatingReq(null);
        setAttemptedSubmit(false);
        setComment("");
        loadData();
      }
    } finally {
      setSubmitting(false);
    }
  }

  const assignedCount = requests.filter((r) => r.status === "ASSIGNED").length;
  const inProgressCount = requests.filter((r) => r.status === "IN_PROGRESS").length;
  const resolvedCount = requests.filter((r) => r.status === "RESOLVED" || r.status === "CLOSED").length;

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: "var(--background-color)" }}>
      <AppHeader fullName={userName} role="MAINTENANCE_OFFICER" />

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-5">
        {toast && (
          <div
            className="p-3 font-medium"
            style={{
              backgroundColor: "var(--tertiary-container-color)",
              color: "var(--on-tertiary-container-color)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            {toast}
          </div>
        )}

        <div>
          <h1 className="font-bold" style={{ color: "var(--on-surface-color)", fontSize: "var(--font-size-2xl)" }}>
            Assigned Maintenance Jobs
          </h1>
          <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}>
            Inspect assigned campus faults, record repair notes, and mark jobs as resolved.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Assigned", value: assignedCount },
            { label: "In Progress", value: inProgressCount },
            { label: "Completed", value: resolvedCount },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="border"
              style={{
                backgroundColor: "var(--surface-container-lowest-color)",
                borderColor: "var(--outline-variant-color)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--spacing-4)",
                boxShadow: "var(--elevation-1)",
              }}
            >
              <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}>{kpi.label}</p>
              <p className="mt-1 font-bold" style={{ color: "var(--primary-color)", fontSize: "var(--font-size-2xl)" }}>
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {loading ? (
          <p className="py-8 text-center" style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}>
            Loading assigned jobs...
          </p>
        ) : requests.length === 0 ? (
          <div
            className="border p-8 text-center"
            style={{
              backgroundColor: "var(--surface-container-lowest-color)",
              borderColor: "var(--outline-variant-color)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <p className="font-semibold">No jobs assigned yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="border"
                style={{
                  backgroundColor: "var(--surface-container-lowest-color)",
                  borderColor: "var(--outline-variant-color)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--spacing-4)",
                  boxShadow: "var(--elevation-1)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold" style={{ color: "var(--primary-color)", fontSize: "var(--font-size-xs)" }}>
                    {req.ticketNumber} · {req.category.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={req.priority} />
                    <StatusBadge status={req.status} />
                  </div>
                </div>

                <h2 className="mt-2 font-semibold" style={{ color: "var(--on-surface-color)", fontSize: "var(--font-size-base)" }}>
                  {req.title}
                </h2>
                <p className="mt-1 flex items-center gap-1.5" style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}>
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {req.location} · Reported by {req.requester.fullName}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUpdatingReq(req);
                      setNewStatus(req.status === "ASSIGNED" ? "IN_PROGRESS" : "RESOLVED");
                    }}
                    className="inline-flex min-h-[44px] flex-1 sm:flex-none items-center justify-center gap-1.5 px-4 font-semibold cursor-pointer"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "var(--on-primary-color)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    <Wrench className="h-4 w-4" />
                    Update Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimelineId(req.id)}
                    className="inline-flex min-h-[44px] items-center justify-center border px-4 font-medium cursor-pointer"
                    style={{
                      backgroundColor: "var(--surface-container-low-color)",
                      borderColor: "var(--outline-variant-color)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    Details &amp; Photo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {updatingReq && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div
            className="w-full max-w-md"
            style={{
              backgroundColor: "var(--surface-container-lowest-color)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--spacing-6)",
              boxShadow: "var(--elevation-4)",
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--outline-variant-color)" }}>
              <h2 className="font-bold" style={{ fontSize: "var(--font-size-lg)" }}>
                Update {updatingReq.ticketNumber}
              </h2>
              <button
                type="button"
                onClick={() => setUpdatingReq(null)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form noValidate onSubmit={handleStatusSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  New Status
                </label>
                <select
                  id="officer-status-select"
                  name="status"
                  aria-label="New request status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RequestStatus)}
                  className="w-full min-h-[44px] border px-3"
                  style={{
                    backgroundColor: "var(--surface-container-low-color)",
                    borderColor: "var(--outline-variant-color)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  Work / Resolution Note
                </label>
                <textarea
                  required
                  minLength={3}
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe the inspection or repair carried out..."
                  className="w-full border p-3"
                  style={{
                    backgroundColor: "var(--surface-container-low-color)",
                    borderColor:
                      attemptedSubmit && !comment.trim()
                        ? "var(--error-color)"
                        : "var(--outline-variant-color)",
                    borderRadius: "var(--radius-md)",
                  }}
                />
                <FieldError show={attemptedSubmit && !comment.trim()} />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full min-h-[48px] items-center justify-center gap-2 font-semibold cursor-pointer disabled:opacity-60"
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "var(--on-primary-color)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Status Update
              </button>
            </form>
          </div>
        </div>
      )}

      <TicketTimelineModal requestId={timelineId} onClose={() => setTimelineId(null)} />
    </div>
  );
}

