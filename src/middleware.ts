import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
  getDashboardPathForRole,
} from "@/lib/jwt";

const ROLE_ROUTE_MAP: Record<string, string> = {
  "/dashboard/admin": "ADMIN",
  "/dashboard/officer": "MAINTENANCE_OFFICER",
  "/dashboard/requester": "STUDENT_STAFF",
};

const SHORTCUT_REDIRECTS: Record<string, string> = {
  "/admin": "/dashboard/admin",
  "/officer": "/dashboard/officer",
  "/requester": "/dashboard/requester",
  "/student": "/dashboard/requester",
};

const AUTH_MODE_REDIRECTS: Record<string, string> = {
  "/register": "register",
  "/verify-email": "verify-email",
  "/forgot-password": "forgot",
  "/reset-password": "reset",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (SHORTCUT_REDIRECTS[pathname]) {
    return NextResponse.redirect(new URL(SHORTCUT_REDIRECTS[pathname], request.url));
  }

  if (AUTH_MODE_REDIRECTS[pathname]) {
    const targetUrl = new URL("/login", request.url);
    targetUrl.searchParams.set("mode", AUTH_MODE_REDIRECTS[pathname]);
    const email = request.nextUrl.searchParams.get("email");
    if (email) targetUrl.searchParams.set("email", email);
    return NextResponse.redirect(targetUrl);
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // Protect all /dashboard/** routes
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Enforce role-specific dashboard isolation
    for (const [prefix, requiredRole] of Object.entries(ROLE_ROUTE_MAP)) {
      if (pathname.startsWith(prefix) && session.role !== requiredRole) {
        return NextResponse.redirect(new URL(getDashboardPathForRole(session.role), request.url));
      }
    }
  }

  // Always show the login/register form and clear any previous session cookie
  // so shared university computers never auto-login without credentials
  if ((pathname === "/login" || pathname === "/register") && token) {
    const response = NextResponse.next();
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin",
    "/officer",
    "/requester",
    "/student",
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
  ],
};
