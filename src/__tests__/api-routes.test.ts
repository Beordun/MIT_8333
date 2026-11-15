import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getSessionUser: vi.fn(),
  hasRequiredRole: (user: { role: string } | null, roles: string[]) =>
    Boolean(user && roles.includes(user.role)),
  verifyPassword: vi.fn(),
  setSessionCookie: vi.fn(),
  getDashboardPathForRole: (role: string) =>
    role === "ADMIN" ? "/dashboard/admin" : "/dashboard/requester",
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    serviceRequest: { findUnique: vi.fn() },
  },
}));

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as requestsPost } from "@/app/api/requests/route";
import { POST as assignPost } from "@/app/api/requests/[id]/assign/route";

describe("Backend API Endpoint Security & RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when logging in with an unknown email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "nobody@miva.edu.ng", password: "wrong" }),
    });

    const res = await loginPost(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when creating a service request without a session", async () => {
    vi.mocked(getSessionUser).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/requests", {
      method: "POST",
      body: JSON.stringify({ title: "Broken light" }),
    });

    const res = await requestsPost(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 when a STUDENT_STAFF user tries to assign an officer", async () => {
    vi.mocked(getSessionUser).mockResolvedValueOnce({
      userId: "student_1",
      email: "student@miva.edu.ng",
      fullName: "Student User",
      role: "STUDENT_STAFF",
    });

    const req = new NextRequest("http://localhost:3000/api/requests/req_1/assign", {
      method: "POST",
      body: JSON.stringify({ officerId: "officer_1" }),
    });

    const res = await assignPost(req, { params: Promise.resolve({ id: "req_1" }) });
    expect(res.status).toBe(403);
  });
});

