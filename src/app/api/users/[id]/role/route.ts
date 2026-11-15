import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasRequiredRole } from "@/lib/auth";
import { updateUserRoleSchema } from "@/lib/validators";
import { ok, badRequest, unauthorized, forbidden, notFound, serverError } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) return unauthorized();
    if (!hasRequiredRole(session, [RoleName.ADMIN])) {
      return forbidden("Only administrators can update user roles.");
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const parsed = updateUserRoleSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid role selection.", parsed.error.flatten().fieldErrors);
    }

    const [user, targetRole] = await Promise.all([
      prisma.user.findUnique({ where: { id } }),
      prisma.role.findUnique({ where: { name: parsed.data.role } }),
    ]);

    if (!user) return notFound("User not found.");
    if (!targetRole) return badRequest("Target role does not exist.");

    const updated = await prisma.user.update({
      where: { id },
      data: { roleId: targetRole.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        department: true,
        role: { select: { name: true } },
      },
    });

    return ok({ user: { ...updated, role: updated.role.name } });
  } catch (err) {
    return serverError(err);
  }
}

