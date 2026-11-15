"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Search, UserPlus, Users, ClipboardList, X, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { TicketTimelineModal } from "@/components/TicketTimelineModal";
import { PasswordInput } from "@/components/PasswordInput";
import { FieldError } from "@/components/FieldError";
import type { RequestItem, RoleName, UserItem } from "@/types/mivafix";

export default function AdminDashboardPage() {
  const [userName, setUserName] = useState("Administrator");
  const [tab, setTab] = useState<"requests" | "users">("requests");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [officers, setOfficers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [timelineId, setTimelineId] = useState<string | null>(null);
  const [assigningReq, setAssigningReq] = useState<RequestItem | null>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  // Create Staff / Officer Modal state
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newRole, setNewRole] = useState<RoleName>("MAINTENANCE_OFFICER");
  const [newPassword, setNewPassword] = useState("");
  const [attemptedCreateUser, setAttemptedCreateUser] = useState(false);
  const [userFormError, setUserFormError] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);

      const [meRes, reqRes, usersRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch(`/api/requests?${params.toString()}`),
        fetch("/api/users"),
      ]);

      if (meRes.ok) {
        const me = await meRes.json();
        setUserName(me.user.fullName);
      }
      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequests(data.requests);
      }
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users);
        const officerList = uData.users.filter((u: UserItem) => u.role === "MAINTENANCE_OFFICER");
        setOfficers(officerList);
        if (!selectedOfficerId && officerList[0]) {
          setSelectedOfficerId(officerList[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, selectedOfficerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAssignSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assigningReq || !selectedOfficerId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/requests/${assigningReq.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officerId: selectedOfficerId, notes: assignNotes }),
      });
      if (res.ok) {
        setToast(`Assigned ${assigningReq.ticketNumber} successfully.`);
        setTimeout(() => setToast(""), 4000);
        setAssigningReq(null);
        setAssignNotes("");
        loadData();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRoleChange(userId: string, role: RoleName) {
    const res = await fetch(`/api/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setToast("User role updated.");
      setTimeout(() => setToast(""), 3000);
      loadData();
    }
  }

  async function handleCreateUserSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttemptedCreateUser(true);
    setUserFormError("");

    if (!newFullName.trim() || !newEmail.trim() || !newDepartment.trim() || !newPassword) {
      return;
    }

    setCreatingUser(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newFullName,
          email: newEmail,
          department: newDepartment,
          role: newRole,
          password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUserFormError(data.error || "Unable to create user account.");
        return;
      }
      setShowCreateUser(false);
      setAttemptedCreateUser(false);
      setNewFullName("");
      setNewEmail("");
      setNewDepartment("");
      setNewPassword("");
      setToast(`Created ${data.user.role.replace("_", " ")} account for ${data.user.fullName}.`);
      setTimeout(() => setToast(""), 4000);
      loadData();
    } catch {
      setUserFormError("Network error while creating user.");
    } finally {
      setCreatingUser(false);
    }
  }

  const unassignedCount = requests.filter((r) => r.status === "PENDING").length;
  const activeCount = requests.filter((r) => r.status === "ASSIGNED" || r.status === "IN_PROGRESS").length;
  const resolvedCount = requests.filter((r) => r.status === "RESOLVED" || r.status === "CLOSED").length;

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: "var(--background-color)" }}>
      <AppHeader fullName={userName} role="ADMIN" />

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
              Facilities Control Centre
            </h1>
            <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}>
              Triage campus complaints, dispatch officers, manage users, and export reports.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCreateUser(true)}
              className="inline-flex min-h-[44px] items-center gap-2 border px-4 font-semibold cursor-pointer"
              style={{
                backgroundColor: "var(--surface-container-lowest-color)",
                borderColor: "var(--outline-variant-color)",
                color: "var(--primary-color)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              <UserPlus className="h-4 w-4" />
              Add Officer / User
            </button>
            <a
              href="/api/reports/export"
              className="inline-flex min-h-[44px] items-center gap-2 px-4 font-semibold"
              style={{
                backgroundColor: "var(--primary-color)",
                color: "var(--on-primary-color)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </a>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Tickets", value: requests.length },
            { label: "Unassigned", value: unassignedCount },
            { label: "Active Repairs", value: activeCount },
            { label: "Resolved", value: resolvedCount },
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

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b pb-2" style={{ borderColor: "var(--outline-variant-color)" }}>
          <button
            type="button"
            onClick={() => setTab("requests")}
            className="inline-flex min-h-[44px] items-center gap-2 px-4 font-semibold cursor-pointer"
            style={{
              backgroundColor: tab === "requests" ? "var(--primary-container-color)" : "transparent",
              color: tab === "requests" ? "var(--on-primary-container-color)" : "var(--on-surface-variant-color)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <ClipboardList className="h-4 w-4" />
            Service Requests ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("users")}
            className="inline-flex min-h-[44px] items-center gap-2 px-4 font-semibold cursor-pointer"
            style={{
              backgroundColor: tab === "users" ? "var(--primary-container-color)" : "transparent",
              color: tab === "users" ? "var(--on-primary-container-color)" : "var(--on-surface-variant-color)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <Users className="h-4 w-4" />
            Users &amp; Roles ({users.length})
          </button>
        </div>

        {tab === "requests" ? (
          <>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: "var(--on-surface-variant-color)" }}
                />
                <input
                  id="admin-search"
                  name="search"
                  aria-label="Search campus requests"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ticket, title, or location"
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
                id="admin-status-filter"
                name="statusFilter"
                aria-label="Filter requests by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
              </select>
            </div>

            {loading ? (
              <p className="py-8 text-center" style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}>
                Loading campus requests...
              </p>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="space-y-3 md:hidden">
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
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold" style={{ color: "var(--primary-color)", fontSize: "var(--font-size-xs)" }}>
                          {req.ticketNumber}
                        </span>
                        <StatusBadge status={req.status} />
                      </div>
                      <h2 className="mt-1.5 font-semibold" style={{ fontSize: "var(--font-size-base)" }}>{req.title}</h2>
                      <p className="mt-1" style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}>
                        {req.location} · {req.requester.fullName}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setAssigningReq(req)}
                          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 px-3 font-semibold cursor-pointer"
                          style={{
                            backgroundColor: "var(--primary-color)",
                            color: "var(--on-primary-color)",
                            borderRadius: "var(--radius-md)",
                            fontSize: "var(--font-size-xs)",
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                          {req.assignments[0] ? "Reassign" : "Assign Officer"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimelineId(req.id)}
                          className="inline-flex min-h-[44px] items-center justify-center border px-3 font-medium cursor-pointer"
                          style={{
                            borderColor: "var(--outline-variant-color)",
                            borderRadius: "var(--radius-md)",
                            fontSize: "var(--font-size-xs)",
                          }}
                        >
                          Timeline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
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
                        <th className="px-4 py-3 font-semibold">Fault &amp; Location</th>
                        <th className="px-4 py-3 font-semibold">Priority</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Officer</th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((req) => (
                        <tr key={req.id} className="border-t" style={{ borderColor: "var(--outline-variant-color)" }}>
                          <td className="px-4 py-3 font-semibold" style={{ color: "var(--primary-color)" }}>
                            {req.ticketNumber}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium">{req.title}</p>
                            <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-xs)" }}>
                              {req.location} · {req.requester.fullName}
                            </p>
                          </td>
                          <td className="px-4 py-3"><PriorityBadge priority={req.priority} /></td>
                          <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                          <td className="px-4 py-3">{req.assignments[0]?.officer.fullName ?? "Unassigned"}</td>
                          <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setAssigningReq(req)}
                              className="px-3 py-1.5 font-semibold cursor-pointer"
                              style={{
                                backgroundColor: "var(--primary-container-color)",
                                color: "var(--on-primary-container-color)",
                                borderRadius: "var(--radius-md)",
                                fontSize: "var(--font-size-xs)",
                              }}
                            >
                              {req.assignments[0] ? "Reassign" : "Assign"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setTimelineId(req.id)}
                              className="px-2 py-1.5 font-medium underline cursor-pointer"
                              style={{ color: "var(--primary-color)", fontSize: "var(--font-size-xs)" }}
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
          </>
        ) : (
          <div
            className="overflow-x-auto border"
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
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t" style={{ borderColor: "var(--outline-variant-color)" }}>
                    <td className="px-4 py-3 font-medium">{u.fullName}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.department}</td>
                    <td className="px-4 py-3">
                      <select
                        id={`role-select-${u.id}`}
                        name={`role-${u.id}`}
                        aria-label={`Role for ${u.fullName}`}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as RoleName)}
                        className="min-h-[40px] border px-2"
                        style={{
                          backgroundColor: "var(--surface-container-low-color)",
                          borderColor: "var(--outline-variant-color)",
                          borderRadius: "var(--radius-md)",
                        }}
                      >
                        <option value="STUDENT_STAFF">Student / Staff</option>
                        <option value="MAINTENANCE_OFFICER">Maintenance Officer</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {assigningReq && (
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
                Assign Officer to {assigningReq.ticketNumber}
              </h2>
              <button
                type="button"
                onClick={() => setAssigningReq(null)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  Maintenance Officer
                </label>
                <select
                  required
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  className="w-full min-h-[44px] border px-3"
                  style={{
                    backgroundColor: "var(--surface-container-low-color)",
                    borderColor: "var(--outline-variant-color)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  {officers.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.fullName} ({off.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  Dispatch Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Any instructions or safety notes for the officer..."
                  className="w-full border p-3"
                  style={{
                    backgroundColor: "var(--surface-container-low-color)",
                    borderColor: "var(--outline-variant-color)",
                    borderRadius: "var(--radius-md)",
                  }}
                />
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
                Confirm Assignment
              </button>
            </form>
          </div>
        </div>
      )}

      {showCreateUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div
            className="w-full max-w-md max-h-[92vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--surface-container-lowest-color)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--spacing-6)",
              boxShadow: "var(--elevation-4)",
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--outline-variant-color)" }}>
              <h2 className="font-bold" style={{ fontSize: "var(--font-size-lg)" }}>
                Create Officer or User Account
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateUser(false)}
                aria-label="Close modal"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {userFormError && (
              <div
                className="mt-3 p-3 font-medium"
                style={{
                  backgroundColor: "var(--error-container-color)",
                  color: "var(--on-error-container-color)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                {userFormError}
              </div>
            )}

            <form noValidate onSubmit={handleCreateUserSubmit} className="mt-4 space-y-3.5">
              <div>
                <label htmlFor="newFullName" className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  Full Name
                </label>
                <input
                  id="newFullName"
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Engr. Musa Ibrahim"
                  className="w-full min-h-[44px] border px-3"
                  style={{
                    backgroundColor: "var(--surface-container-low-color)",
                    borderColor:
                      attemptedCreateUser && !newFullName.trim()
                        ? "var(--error-color)"
                        : "var(--outline-variant-color)",
                    borderRadius: "var(--radius-md)",
                  }}
                />
                <FieldError show={attemptedCreateUser && !newFullName.trim()} />
              </div>

              <div>
                <label htmlFor="newEmail" className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  University Email
                </label>
                <input
                  id="newEmail"
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="musa@miva.edu.ng"
                  className="w-full min-h-[44px] border px-3"
                  style={{
                    backgroundColor: "var(--surface-container-low-color)",
                    borderColor:
                      attemptedCreateUser && !newEmail.trim()
                        ? "var(--error-color)"
                        : "var(--outline-variant-color)",
                    borderRadius: "var(--radius-md)",
                  }}
                />
                <FieldError show={attemptedCreateUser && !newEmail.trim()} />
              </div>

              <div>
                <label htmlFor="newDepartment" className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  Department / Unit
                </label>
                <input
                  id="newDepartment"
                  type="text"
                  required
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="e.g. Plumbing & Water Works"
                  className="w-full min-h-[44px] border px-3"
                  style={{
                    backgroundColor: "var(--surface-container-low-color)",
                    borderColor:
                      attemptedCreateUser && !newDepartment.trim()
                        ? "var(--error-color)"
                        : "var(--outline-variant-color)",
                    borderRadius: "var(--radius-md)",
                  }}
                />
                <FieldError show={attemptedCreateUser && !newDepartment.trim()} />
              </div>

              <div>
                <label htmlFor="newRole" className="mb-1 block font-medium" style={{ fontSize: "var(--font-size-sm)" }}>
                  Role
                </label>
                <select
                  id="newRole"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as RoleName)}
                  className="w-full min-h-[44px] border px-3"
                  style={{
                    backgroundColor: "var(--surface-container-low-color)",
                    borderColor: "var(--outline-variant-color)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <option value="MAINTENANCE_OFFICER">Maintenance Officer</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="STUDENT_STAFF">Student / Staff</option>
                </select>
              </div>

              <PasswordInput
                id="newPassword"
                label="Initial Password"
                value={newPassword}
                onChange={setNewPassword}
                minLength={8}
                autoComplete="new-password"
                placeholder="Strong initial password"
                showStrength
                showRequiredError={attemptedCreateUser}
              />

              <button
                type="submit"
                disabled={creatingUser}
                className="flex w-full min-h-[48px] items-center justify-center gap-2 font-semibold cursor-pointer disabled:opacity-60"
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "var(--on-primary-color)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                {creatingUser && <Loader2 className="h-4 w-4 animate-spin" />}
                {creatingUser ? "Creating & emailing user..." : "Create Account & Send Email"}
              </button>
            </form>
          </div>
        </div>
      )}

      <TicketTimelineModal requestId={timelineId} onClose={() => setTimelineId(null)} />
    </div>
  );
}
