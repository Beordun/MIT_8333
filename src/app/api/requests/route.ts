import { NextRequest } from "next/server";
import { Prisma, Priority, RequestStatus, RoleName } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasRequiredRole } from "@/lib/auth";
import { createRequestSchema } from "@/lib/validators";
import { ok, created, badRequest, unauthorized, forbidden, serverError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return unauthorized();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";
    const status = searchParams.get("status") as RequestStatus | null;
    const priority = searchParams.get("priority") as Priority | null;
    const categoryId = searchParams.get("categoryId")?.trim() ?? "";
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 10)));

    const where: Prisma.ServiceRequestWhereInput = {};

    // Role-based data scoping
    if (session.role === RoleName.STUDENT_STAFF) {
      where.requesterId = session.userId;
    } else if (session.role === RoleName.MAINTENANCE_OFFICER) {
      where.assignments = { some: { officerId: session.userId } };
    }

    if (status && Object.values(RequestStatus).includes(status)) {
      where.status = status;
    }
    if (priority && Object.values(Priority).includes(priority)) {
      where.priority = priority;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, requests] = await prisma.$transaction([
      prisma.serviceRequest.count({ where }),
      prisma.serviceRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slaHours: true } },
          requester: { select: { id: true, fullName: true, email: true, department: true } },
          assignments: {
            orderBy: { assignedAt: "desc" },
            take: 1,
            include: {
              officer: { select: { id: true, fullName: true, email: true } },
            },
          },
        },
      }),
    ]);

    return ok({
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return unauthorized();
    if (!hasRequiredRole(session, [RoleName.STUDENT_STAFF, RoleName.ADMIN])) {
      return forbidden("Only students, staff, or administrators can submit new requests.");
    }

    const body = await request.json().catch(() => null);
    const parsed = createRequestSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid service request payload.", parsed.error.flatten().fieldErrors);
    }

    const { title, description, location, categoryId, priority, evidenceUrl } = parsed.data;
    const category = await prisma.requestCategory.findUnique({ where: { id: categoryId } });
    if (!category) {
      return badRequest("Selected request category does not exist.");
    }

    const ticketNumber = `MIVA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const createdRequest = await prisma.$transaction(async (tx) => {
      const reqRecord = await tx.serviceRequest.create({
        data: {
          ticketNumber,
          title,
          description,
          location,
          priority,
          status: RequestStatus.PENDING,
          evidenceUrl: evidenceUrl ?? null,
          requesterId: session.userId,
          categoryId,
        },
        include: {
          category: { select: { id: true, name: true, slaHours: true } },
          requester: { select: { id: true, fullName: true, email: true, department: true } },
        },
      });

      await tx.statusUpdate.create({
        data: {
          requestId: reqRecord.id,
          updatedById: session.userId,
          oldStatus: null,
          newStatus: RequestStatus.PENDING,
          comment: "Service request submitted.",
        },
      });

      return reqRecord;
    });

    return created({ request: createdRequest });
  } catch (err) {
    return serverError(err);
  }
}

