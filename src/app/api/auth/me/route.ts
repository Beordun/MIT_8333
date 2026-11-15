import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { ok, unauthorized, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return unauthorized();

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        department: true,
        role: { select: { name: true } },
        createdAt: true,
      },
    });

    if (!user) return unauthorized();
    return ok({
      user: {
        ...user,
        role: user.role.name,
      },
    });
  } catch (err) {
    return serverError(err);
  }
}

