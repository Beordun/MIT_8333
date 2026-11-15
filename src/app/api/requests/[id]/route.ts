import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasRequiredRole } from "@/lib/auth";
import { ok, unauthorized, forbidden, notFound, serverError } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) return unauthorized();

    const { id } = await context.params;
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slaHours: true } },
        requester: { select: { id: true, fullName: true, email: true, department: true } },
        assignments: {
          orderBy: { assignedAt: "desc" },
          include: {
            officer: { select: { id: true, fullName: true, email: true, department: true } },
            assignedBy: { select: { id: true, fullName: true } },
          },
        },
        statusUpdates: {
          orderBy: { createdAt: "asc" },
          include: {
            updatedBy: {
              select: { id: true, fullName: true, role: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (!serviceRequest) return notFound("Service request not found.");

    // RBAC check
    if (session.role === RoleName.STUDENT_STAFF && serviceRequest.requesterId !== session.userId) {
      return forbidden("You can only view your own service requests.");
    }
    if (
      session.role === RoleName.MAINTENANCE_OFFICER &&
      !serviceRequest.assignments.some((a) => a.officerId === session.userId)
    ) {
      return forbidden("You can only view requests assigned to you.");
    }

    return ok({ request: serviceRequest });
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) return unauthorized();
    if (!hasRequiredRole(session, [RoleName.ADMIN])) {
      return forbidden("Only administrators can delete service requests.");
    }

    const { id } = await context.params;
    const existing = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!existing) return notFound("Service request not found.");

    await prisma.serviceRequest.delete({ where: { id } });
    return ok({ message: "Service request deleted." });
  } catch (err) {
    return serverError(err);
  }
}

