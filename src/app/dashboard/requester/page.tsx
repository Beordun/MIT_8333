"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, Camera, MapPin, Clock, X, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { TicketTimelineModal } from "@/components/TicketTimelineModal";
import { FieldError } from "@/components/FieldError";
import type { CategoryItem, Priority, RequestItem, RequestStatus } from "@/types/mivafix";

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 900;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = () => reject(new Error("Invalid image file."));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });
}

export default function RequesterDashboardPage() {
  const [userName, setUserName] = useState("Student");
  const [userEmail, setUserEmail] = useState("");
  const [defaultLocation, setDefaultLocation] = useState("");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  function openCreateModal() {
    setFormError("");
    setAttemptedSubmit(false);
    if (!location.trim() && defaultLocation) {
      setLocation(defaultLocation);
    }
    setShowCreate(true);
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "30" });
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);

      const [meRes, reqRes, catRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch(`/api/requests?${params.toString()}`),
        fetch("/api/categories"),
      ]);

      if (meRes.ok) {
        const me = await meRes.json();
        setUserName(me.user.fullName);
        setUserEmail(me.user.email || "");
        const savedLoc = me.user.department || "";
        setDefaultLocation(savedLoc);
        setLocation((prev) => (prev.trim() ? prev : savedLoc));
      }
      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequests(data.requests);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories);
        if (!categoryId && catData.categories[0]) {
          setCategoryId(catData.categories[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      setEvidenceUrl(dataUrl);
    } catch {
      setFormError("Could not process selected photo. Please try another image.");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setAttemptedSubmit(true);
    setFormError("");

    if (!title.trim() || !categoryId || !location.trim() || !description.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, categoryId, location, priority, description, evidenceUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Unable to submit request.");
        return;
      }
      setShowCreate(false);
      setAttemptedSubmit(false);
      setTitle("");
      setLocation(defaultLocation);
      setDescription("");
      setEvidenceUrl(null);
      setToast(`Ticket ${data.request.ticketNumber} submitted.`);
      setTimeout(() => setToast(""), 4000);
      loadData();
    } catch {
      setFormError("Network error while submitting request.");
    } finally {
      setSubmitting(false);
    }
  }

  const counts = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "PENDING" || r.status === "ASSIGNED").length,
    inProgress: requests.filter((r) => r.status === "IN_PROGRESS").length,
    resolved: requests.filter((r) => r.status === "RESOLVED" || r.status === "CLOSED").length,
  };

  return (
    <div className="min-h-screen pb-24 sm:pb-10" style={{ backgroundColor: "var(--background-color)" }}>
      <AppHeader fullName={userName} role="STUDENT_STAFF" />

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

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-bold" style={{ color: "var(--on-surface-color)", fontSize: "var(--font-size-2xl)" }}>
              My Maintenance Requests
            </h1>
            <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}>
              Report campus faults and track repair progress in real time.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="hidden sm:inline-flex min-h-[44px] items-center gap-2 px-4 font-semibold cursor-pointer"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "var(--on-primary-color)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <Plus className="h-4 w-4" />
            Report Fault
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total", value: counts.total },
            { label: "Queued", value: counts.pending },
            { label: "In Progress", value: counts.inProgress },
            { label: "Resolved", value: counts.resolved },
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
              <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}>
                {kpi.label}
              </p>
              <p className="mt-1 font-bold" style={{ color: "var(--primary-color)", fontSize: "var(--font-size-2xl)" }}>
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--on-surface-variant-color)" }}
            />
            <input
              id="requester-search"
              name="search"
              aria-label="Search maintenance requests"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket number, title, or location"
              className="w-full min-h-[44px] border pl-9 pr-3"
              style={{
                backgroundColor: "var(--surface-container-lowest-color)",
                borderColor: "var(--outline-variant-color)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-sm)",
              }}
            />
          </div>
          <select
            id="requester-status-filter"
            name="statusFilter"
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RequestStatus | "")}
            className="min-h-[44px] border px-3"
            style={{
              backgroundColor: "var(--surface-container-lowest-color)",
              borderColor: "var(--outline-variant-color)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Mobile Card List (375px+ first) */}
        {loading ? (
          <p className="py-8 text-center" style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}>
            Loading your requests...
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
            <p className="font-semibold" style={{ color: "var(--on-surface-color)" }}>
              No maintenance requests found
            </p>
            <p className="mt-1" style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}>
              Tap Report Fault below to log a new issue.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {requests.map((req) => (
                <button
                  key={req.id}
                  type="button"
                  onClick={() => setSelectedId(req.id)}
                  className="w-full border text-left cursor-pointer"
                  style={{
                    backgroundColor: "var(--surface-container-lowest-color)",
                    borderColor: "var(--outline-variant-color)",
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--spacing-4)",
                    boxShadow: "var(--elevation-1)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold" style={{ color: "var(--primary-color)", fontSize: "var(--font-size-xs)" }}>
                      {req.ticketNumber}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                  <h2 className="mt-1.5 font-semibold" style={{ color: "var(--on-surface-color)", fontSize: "var(--font-size-base)" }}>
                    {req.title}
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5" style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}>
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {req.location}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <PriorityBadge priority={req.priority} />
                    <span className="flex items-center gap-1" style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}>
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Desktop Table */}
            <div
              className="hidden md:block overflow-x-auto border"
              style={{
                backgroundColor: "var(--surface-container-lowest-color)",
                borderColor: "var(--outline-variant-color)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--elevation-1)",
              }}
            >
              <table className="w-full text-left" style={{ fontSize: "var(--font-size-sm)" }}>
                <thead style={{ backgroundColor: "var(--surface-container-low-color)", color: "var(--on-surface-variant-color)" }}>
                  <tr>
                    <th className="px-4 py-3 font-semibold">Ticket</th>
                    <th className="px-4 py-3 font-semibold">Issue &amp; Location</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Priority</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-t" style={{ borderColor: "var(--outline-variant-color)" }}>
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--primary-color)" }}>
                        {req.ticketNumber}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium" style={{ color: "var(--on-surface-color)" }}>{req.title}</p>
                        <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}>{req.location}</p>
                      </td>
                      <td className="px-4 py-3">{req.category.name}</td>
                      <td className="px-4 py-3"><PriorityBadge priority={req.priority} /></td>
                      <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedId(req.id)}
                          className="min-h-[36px] px-3 font-medium underline cursor-pointer"
                          style={{ color: "var(--primary-color)" }}
                        >
                          Timeline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* Sticky Mobile Primary CTA */}
      <div className="fixed bottom-4 left-4 right-4 z-20 sm:hidden">
        <button
          type="button"
          onClick={openCreateModal}
          className="flex w-full min-h-[52px] items-center justify-center gap-2 font-semibold cursor-pointer"
          style={{
            backgroundColor: "var(--primary-color)",
            color: "var(--on-primary-color)",
            borderRadius: "var(--radius-full)",
            boxShadow: "var(--elevation-3)",
            fontSize: "var(--font-size-base)",
          }}
        >
          <Plus className="h-5 w-5" />
          Report Fault
        </button>
      </div>

      {/* New Request Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--surface-container-lowest-color)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--spacing-6)",
              boxShadow: "var(--elevation-4)",
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--outline-variant-color)" }}>
              <h2 className="font-bold" style={{ fontSize: "var(--font-size-lg)" }}>
                Report a Maintenance Fault
              </h2>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                aria-label="Close form"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div
                className="mt-3 p-3 font-medium"
                style={{
                  backgroundColor: "var(--error-container-color)",
                  color: "var(--on-error-container-color)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                {formError}
              </div>
            )}

            <form noValidate onSubmit={handleCreate} className="mt-4 space-y-3.5">
              {/* Auto-populated Requester Profile Strip */}
              <div
                className="flex flex-wrap items-center justify-between gap-2 border p-3"
                style={{
                  backgroundColor: "var(--surface-container-low-color)",
                  borderColor: "var(--outline-variant-color)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--font-size-xs)",
                }}
              >
                <div>
                  <p className="font-semibold" style={{ color: "var(--on-surface-color)" }}>
                    {userName} {userEmail ? `(${userEmail})` : ""}
                  </p>
                  {defaultLocation && (
                    <p className="mt-0.5 flex items-center gap-1" style={{ color: "var(--on-surface-variant-color)" }}>
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      Registered Location: <span className="font-medium">{defaultLocation}</span>
                    </p>
                  )}
                </div>
                {defaultLocation && location !== defaultLocation && (
                  <button
                    type="button"
                    onClick={() => setLocation(defaultLocation)}
                    className="font-semibold underline cursor-pointer"
                    style={{ color: "var(--primary-color)" }}
                  >
                    Use my room
                  </button>
                )}
              </div>

              <div>
                <label className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  Fault Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken ceiling fan in Room 102"
                  className="w-full min-h-[44px] border px-3"
                  style={{
                    backgroundColor: "var(--surface-container-low-color)",
                    borderColor:
                      attemptedSubmit && !title.trim()
                        ? "var(--error-color)"
                        : "var(--outline-variant-color)",
                    borderRadius: "var(--radius-md)",
                  }}
                />
                <FieldError show={attemptedSubmit && !title.trim()} />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                    Category
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full min-h-[44px] border px-3"
                    style={{
                      backgroundColor: "var(--surface-container-low-color)",
                      borderColor: "var(--outline-variant-color)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full min-h-[44px] border px-3"
                    style={{
                      backgroundColor: "var(--surface-container-low-color)",
                      borderColor: "var(--outline-variant-color)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label className="block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                    Location (Hostel Block &amp; Room or Building)
                  </label>
                  {defaultLocation && location === defaultLocation && (
                    <span
                      className="font-medium"
                      style={{ color: "var(--tertiary-color)", fontSize: "var(--font-size-xs)" }}
                    >
                      Auto-filled from profile
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Hostel Block B, Room 204"
                  className="w-full min-h-[44px] border px-3"
                  style={{
                    backgroundColor: "var(--surface-container-low-color)",
                    borderColor:
                      attemptedSubmit && !location.trim()
                        ? "var(--error-color)"
                        : "var(--outline-variant-color)",
                    borderRadius: "var(--radius-md)",
                  }}
                />
                <FieldError show={attemptedSubmit && !location.trim()} />
              </div>

              <div>
                <label className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the fault clearly so the technician arrives prepared..."
                  className="w-full border p-3"
                  style={{
                    backgroundColor: "var(--surface-container-low-color)",
                    borderColor:
                      attemptedSubmit && !description.trim()
                        ? "var(--error-color)"
                        : "var(--outline-variant-color)",
                    borderRadius: "var(--radius-md)",
                  }}
                />
                <FieldError show={attemptedSubmit && !description.trim()} />
              </div>

              <div>
                <label className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  Photo Evidence (Optional)
                </label>
                <label
                  className="flex min-h-[48px] cursor-pointer items-center justify-center gap-2 border border-dashed px-3"
                  style={{
                    backgroundColor: "var(--surface-container-low-color)",
                    borderColor: "var(--outline-color)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  <Camera className="h-4 w-4" />
                  <span>{evidenceUrl ? "Change fault photo" : "Take or upload fault photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {evidenceUrl && (
                  <img
                    src={evidenceUrl}
                    alt="Preview"
                    className="mt-2 max-h-40 w-full object-cover"
                    style={{ borderRadius: "var(--radius-md)" }}
                  />
                )}
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
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      )}

      <TicketTimelineModal requestId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}

