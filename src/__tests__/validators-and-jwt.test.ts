import { describe, it, expect, beforeAll } from "vitest";
import {
  registerSchema,
  createRequestSchema,
  updateStatusSchema,
  resetPasswordSchema,
} from "@/lib/validators";
import {
  signSessionToken,
  verifySessionToken,
  getDashboardPathForRole,
  getIdleTimeoutSeconds,
} from "@/lib/jwt";
import { generateSixDigitOtp } from "@/lib/otp";

describe("Input Validators, OTP & JWT Session Helpers", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test-only-secret-key-for-vitest-suite";
  });

  it("validates a strong student registration password (8+ chars, capital, number, special char)", () => {
    const result = registerSchema.safeParse({
      fullName: "Toluwani Adeyemi",
      email: "tolu@miva.edu.ng",
      department: "M.Sc. IT",
      password: "Password123!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects weak passwords missing capital letter, number, or special character", () => {
    expect(
      registerSchema.safeParse({
        fullName: "Test User",
        email: "test@miva.edu.ng",
        department: "ICT",
        password: "password123", // missing capital & special char
      }).success
    ).toBe(false);
  });

  it("validates 6-digit OTP format on password reset", () => {
    expect(
      resetPasswordSchema.safeParse({
        email: "tolu@miva.edu.ng",
        code: "482910",
        password: "NewPassword1!",
      }).success
    ).toBe(true);
  });

  it("generates a 6-digit numeric OTP", () => {
    const otp = generateSixDigitOtp();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it("validates service request creation payload", () => {
    const result = createRequestSchema.safeParse({
      title: "Leaking pipe in Hostel B",
      description: "Water is leaking continuously under the washbasin.",
      location: "Hostel Block B, Room 12",
      categoryId: "cat_123",
      priority: "HIGH",
    });
    expect(result.success).toBe(true);
  });

  it("rejects status updates without a comment", () => {
    const result = updateStatusSchema.safeParse({
      status: "IN_PROGRESS",
      comment: "ok",
    });
    expect(result.success).toBe(false);
  });

  it("signs and verifies a JWT session token with role-specific idle timeouts", async () => {
    expect(getIdleTimeoutSeconds("STUDENT_STAFF")).toBe(300);
    expect(getIdleTimeoutSeconds("ADMIN")).toBe(300);
    expect(getIdleTimeoutSeconds("MAINTENANCE_OFFICER")).toBe(600);

    const token = await signSessionToken({
      userId: "user_1",
      email: "student@miva.edu.ng",
      fullName: "Toluwani Adeyemi",
      role: "STUDENT_STAFF",
      tokenVersion: 2,
    });
    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.role).toBe("STUDENT_STAFF");
    expect(decoded?.tokenVersion).toBe(2);
  });

  it("maps RBAC roles to the correct dashboard routes", () => {
    expect(getDashboardPathForRole("ADMIN")).toBe("/dashboard/admin");
    expect(getDashboardPathForRole("MAINTENANCE_OFFICER")).toBe("/dashboard/officer");
    expect(getDashboardPathForRole("STUDENT_STAFF")).toBe("/dashboard/requester");
  });
});
