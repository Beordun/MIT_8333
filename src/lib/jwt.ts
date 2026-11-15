import { SignJWT, jwtVerify } from "jose";
import type { RoleName } from "@prisma/client";

export const SESSION_COOKIE_NAME = "mivafix_session";

export interface SessionUser {
  userId: string;
  email: string;
  fullName: string;
  role: RoleName;
  tokenVersion?: number;
}

/** Returns role-specific inactivity timeout in seconds (600s for Officers, 300s for others). */
export function getIdleTimeoutSeconds(role: RoleName): number {
  return role === "MAINTENANCE_OFFICER" ? 600 : 300;
}

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not configured.");
  }
  return new TextEncoder().encode(secret);
}

/** Signs an HS256 JWT with role-specific inactivity lifetime (5m or 10m). */
export async function signSessionToken(payload: SessionUser): Promise<string> {
  const timeoutSec = getIdleTimeoutSeconds(payload.role);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${timeoutSec}s`)
    .sign(getJwtSecretKey());
}

/** Verifies a JWT string and returns the SessionUser payload, or null if invalid/expired. */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    if (!payload.userId || !payload.email || !payload.role) {
      return null;
    }
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      fullName: String(payload.fullName ?? ""),
      role: payload.role as RoleName,
      tokenVersion: typeof payload.tokenVersion === "number" ? payload.tokenVersion : 0,
    };
  } catch {
    return null;
  }
}

/** Maps a user's RBAC role to their home dashboard route. */
export function getDashboardPathForRole(role: RoleName): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "MAINTENANCE_OFFICER":
      return "/dashboard/officer";
    case "STUDENT_STAFF":
    default:
      return "/dashboard/requester";
  }
}
