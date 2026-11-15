import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasRequiredRole } from "@/lib/auth";
import { updateStatusSchema } from "@/lib/validators";
import { sendTicketStatusEmail } from "@/lib/mailer";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) return unauthorized();
    if (!hasRequiredRole(session, [RoleName.MAINTENANCE_OFFICER, RoleName.ADMIN])) {
      return forbidden("Only maintenance officers or administrators can update request status.");
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid status update payload.", parsed.error.flatten().fieldErrors);
    }

    const existing = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        assignments: { select: { officerId: true } },
        requester: { select: { email: true, fullName: true } },
      },
    });
    if (!existing) return notFound("Service request not found.");

    if (
      session.role === RoleName.MAINTENANCE_OFFICER &&
      !existing.assignments.some((a) => a.officerId === session.userId)
    ) {
      return forbidden("You can only update requests assigned to you.");
    }

    const { status, comment } = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      const reqRecord = await tx.serviceRequest.update({
        where: { id },
        data: { status },
      });

      await tx.statusUpdate.create({
        data: {
          requestId: id,
          updatedById: session.userId,
          oldStatus: existing.status,
          newStatus: status,
          comment,
        },
      });

      return reqRecord;
    });

    await sendTicketStatusEmail(
      existing.requester.email,
      existing.requester.fullName,
      existing.ticketNumber,
      existing.title,
      status,
      comment
    );

    return ok({ request: updated });
  } catch (err) {
    return serverError(err);
  }
}

