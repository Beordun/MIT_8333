import { NextResponse } from "next/server";

/** Standardized 200 OK JSON response. */
export function ok<T>(data: T) {
  return NextResponse.json(data, { status: 200 });
}

/** Standardized 201 Created JSON response. */
export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

/** Standardized 400 Bad Request JSON response. */
export function badRequest(error: string, details?: unknown) {
  return NextResponse.json({ error, ...(details ? { details } : {}) }, { status: 400 });
}

/** Standardized 401 Unauthorized JSON response. */
export function unauthorized(error = "Authentication required.") {
  return NextResponse.json({ error }, { status: 401 });
}

/** Standardized 403 Forbidden JSON response. */
export function forbidden(error = "You do not have permission to perform this action.") {
  return NextResponse.json({ error }, { status: 403 });
}

/** Standardized 404 Not Found JSON response. */
export function notFound(error = "Requested resource was not found.") {
  return NextResponse.json({ error }, { status: 404 });
}

/** Standardized 409 Conflict JSON response. */
export function conflict(error: string) {
  return NextResponse.json({ error }, { status: 409 });
}

/** Standardized 500 Internal Server Error JSON response. */
export function serverError(err: unknown) {
  console.error("API Error:", err);
  const devDetail =
    process.env.NODE_ENV !== "production" && err instanceof Error ? ` (${err.message})` : "";
  return NextResponse.json(
    { error: `An unexpected server error occurred.${devDetail}` },
    { status: 500 }
  );
}

