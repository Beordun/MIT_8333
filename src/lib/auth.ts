import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { RoleName } from "@prisma/client";
import {
  SESSION_COOKIE_NAME,
  signSessionToken,
  verifySessionToken,
  getIdleTimeoutSeconds,
  type SessionUser,
} from "./jwt";

export {
  SESSION_COOKIE_NAME,
  getDashboardPathForRole,
  getIdleTimeoutSeconds,
  type SessionUser,
} from "./jwt";

/** Hashes a plaintext password using bcrypt with 10 salt rounds. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/** Verifies a plaintext password against a stored bcrypt hash. */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Creates a signed JWT and stores it in an HTTP-only cookie with role-specific idle maxAge. */
export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await signSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getIdleTimeoutSeconds(user.role),
  });
}

/** Clears the active session cookie on logout. */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/** Reads and verifies the current user's session from cookies. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Checks whether a session user has one of the allowed RBAC roles. */
export function hasRequiredRole(user: SessionUser | null, allowedRoles: RoleName[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
