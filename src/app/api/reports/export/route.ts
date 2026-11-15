import { NextResponse } from "next/server";
import { RoleName } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasRequiredRole } from "@/lib/auth";
import { unauthorized, forbidden, serverError } from "@/lib/api-response";

function escapeCsv(value: string): string {
  const safe = value.replace(/"/g, '""');
  return `"${safe}"`;
}

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return unauthorized();
    if (!hasRequiredRole(session, [RoleName.ADMIN])) {
      return forbidden("Only administrators can export maintenance reports.");
    }

    const requests = await prisma.serviceRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        requester: { select: { fullName: true, email: true, department: true } },
        assignments: {
          orderBy: { assignedAt: "desc" },
          take: 1,
          include: { officer: { select: { fullName: true } } },
        },
      },
    });

    const header = [
      "Ticket Number",
      "Title",
      "Category",
      "Location",
      "Priority",
      "Status",
      "Requester",
      "Department",
      "Assigned Officer",
      "Created At",
    ].join(",");

    const rows = requests.map((r) =>
      [
        escapeCsv(r.ticketNumber),
        escapeCsv(r.title),
        escapeCsv(r.category.name),
        escapeCsv(r.location),
        escapeCsv(r.priority),
        escapeCsv(r.status),
        escapeCsv(r.requester.fullName),
        escapeCsv(r.requester.department),
        escapeCsv(r.assignments[0]?.officer.fullName ?? "Unassigned"),
        escapeCsv(r.createdAt.toISOString()),
      ].join(",")
    );

    const csv = [header, ...rows].join("\n");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="mivafix-requests-report.csv"`,
      },
    });
  } catch (err) {
    return serverError(err);
  }
}

