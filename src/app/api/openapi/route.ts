import { NextResponse } from "next/server";

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "MivaFix — University Maintenance & Service Request API",
    version: "1.0.0",
    description:
      "RESTful API for MIT 8333 campus maintenance ticketing, officer dispatch, audit logging, and reporting.",
  },
  paths: {
    "/api/auth/register": {
      post: { summary: "Register a Student/Staff account & send 6-digit verification OTP", tags: ["Auth"] },
    },
    "/api/auth/verify-email": {
      post: { summary: "Verify email address with single-use 6-digit OTP (10m expiry)", tags: ["Auth"] },
    },
    "/api/auth/resend-verification": {
      post: { summary: "Resend 6-digit email verification code", tags: ["Auth"] },
    },
    "/api/auth/login": {
      post: { summary: "Authenticate user, enforce 5-attempt lockout & issue JWT cookie", tags: ["Auth"] },
    },
    "/api/auth/logout": {
      post: { summary: "Revoke active session token & sign out to landing page", tags: ["Auth"] },
    },
    "/api/auth/refresh": {
      post: { summary: "Renew rolling inactivity session token (5m standard / 10m officer)", tags: ["Auth"] },
    },
    "/api/auth/forgot-password": {
      post: { summary: "Send single-use 6-digit password reset OTP (10m expiry) via Nodemailer", tags: ["Auth"] },
    },
    "/api/auth/reset-password": {
      post: { summary: "Verify 6-digit OTP, set new strong password & revoke older sessions", tags: ["Auth"] },
    },
    "/api/auth/me": {
      get: { summary: "Get current authenticated user profile", tags: ["Auth"] },
    },
    "/api/categories": {
      get: { summary: "List maintenance request categories & SLAs", tags: ["Categories"] },
    },
    "/api/requests": {
      get: { summary: "List role-scoped service requests (search, filter, pagination)", tags: ["Requests"] },
      post: { summary: "Submit a new service request with optional fault image", tags: ["Requests"] },
    },
    "/api/requests/{id}": {
      get: { summary: "Get full request details, assignment, and audit timeline", tags: ["Requests"] },
      delete: { summary: "Delete a service request (Admin only)", tags: ["Requests"] },
    },
    "/api/requests/{id}/status": {
      patch: { summary: "Update request status & append StatusUpdate log (Officer/Admin)", tags: ["Requests"] },
    },
    "/api/requests/{id}/assign": {
      post: { summary: "Assign a Maintenance Officer to a request (Admin only)", tags: ["Requests"] },
    },
    "/api/users": {
      get: { summary: "List users with optional role filter (Admin only)", tags: ["Users"] },
      post: { summary: "Create a verified Maintenance Officer, Admin, or Student/Staff user (Admin only)", tags: ["Users"] },
    },
    "/api/users/{id}/role": {
      patch: { summary: "Update a user's RBAC role (Admin only)", tags: ["Users"] },
    },
    "/api/reports/export": {
      get: { summary: "Export maintenance requests as CSV (Admin only)", tags: ["Reports"] },
    },
  },
};

export async function GET() {
  return NextResponse.json(openApiSpec);
}

