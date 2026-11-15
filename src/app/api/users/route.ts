import { NextRequest } from "next/server";
import { RoleName } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hasRequiredRole, hashPassword } from "@/lib/auth";
import { adminCreateUserSchema } from "@/lib/validators";
import { sendStaffAccountCreatedEmail } from "@/lib/mailer";
import { ok, created, badRequest, unauthorized, forbidden, conflict, serverError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return unauthorized();
    if (!hasRequiredRole(session, [RoleName.ADMIN])) {
      return forbidden("Only administrators can view the user directory.");
    }

    const roleFilter = new URL(request.url).searchParams.get("role") as RoleName | null;

    const users = await prisma.user.findMany({
      where:
        roleFilter && Object.values(RoleName).includes(roleFilter)
          ? { role: { name: roleFilter } }
          : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        department: true,
        createdAt: true,
        role: { select: { name: true } },
      },
    });

    return ok({
      users: users.map((u) => ({
        ...u,
        role: u.role.name,
      })),
    });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return unauthorized();
    if (!hasRequiredRole(session, [RoleName.ADMIN])) {
      return forbidden("Only administrators can create staff or officer accounts.");
    }

    const body = await request.json().catch(() => null);
    const parsed = adminCreateUserSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Please check the new user details.", parsed.error.flatten().fieldErrors);
    }

    const { fullName, email, department, role, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return conflict("An account with this email address already exists.");
    }

    const roleRecord = await prisma.role.findUnique({ where: { name: role } });
    if (!roleRecord) {
      return badRequest("Selected role does not exist.");
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        department,
        passwordHash,
        emailVerified: true,
        roleId: roleRecord.id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        department: true,
        createdAt: true,
        role: { select: { name: true } },
      },
    });

    await sendStaffAccountCreatedEmail(user.email, user.fullName, user.role.name, password);

    return created({
      user: {
        ...user,
        role: user.role.name,
      },
    });
  } catch (err) {
    return serverError(err);
  }
}
