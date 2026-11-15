import { NextRequest } from "next/server";
import { RequestStatus, RoleName } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasRequiredRole } from "@/lib/auth";
import { assignOfficerSchema } from "@/lib/validators";
import { sendTicketStatusEmail } from "@/lib/mailer";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/api-response";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) return unauthorized();
    if (!hasRequiredRole(session, [RoleName.ADMIN])) {
      return forbidden("Only administrators can assign maintenance officers.");
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const parsed = assignOfficerSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid assignment payload.", parsed.error.flatten().fieldErrors);
    }

    const [serviceRequest, officer] = await Promise.all([
      prisma.serviceRequest.findUnique({
        where: { id },
        include: { requester: { select: { email: true, fullName: true } } },
      }),
      prisma.user.findUnique({
        where: { id: parsed.data.officerId },
        include: { role: { select: { name: true } } },
      }),
    ]);

    if (!serviceRequest) return notFound("Service request not found.");
    if (!officer || officer.role.name !== RoleName.MAINTENANCE_OFFICER) {
      return badRequest("Selected user is not a valid Maintenance Officer.");
    }

    const result = await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.create({
        data: {
          requestId: id,
          officerId: officer.id,
          assignedById: session.userId,
          notes: parsed.data.notes ?? null,
        },
      });

      const updatedRequest = await tx.serviceRequest.update({
        where: { id },
        data: {
          status:
            serviceRequest.status === RequestStatus.PENDING
              ? RequestStatus.ASSIGNED
              : serviceRequest.status,
        },
      });

      await tx.statusUpdate.create({
        data: {
          requestId: id,
          updatedById: session.userId,
          oldStatus: serviceRequest.status,
          newStatus: updatedRequest.status,
          comment: `Assigned to ${officer.fullName}${parsed.data.notes ? `: ${parsed.data.notes}` : "."}`,
        },
      });

      return { assignment, request: updatedRequest };
    });

    await sendTicketStatusEmail(
      serviceRequest.requester.email,
      serviceRequest.requester.fullName,
      serviceRequest.ticketNumber,
      serviceRequest.title,
      result.request.status,
      `Assigned to ${officer.fullName}${parsed.data.notes ? `: ${parsed.data.notes}` : "."}`
    );

    return ok(result);
  } catch (err) {
    return serverError(err);
  }
}

