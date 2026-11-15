import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { ok, unauthorized, serverError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return unauthorized();

    const categories = await prisma.requestCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, description: true, slaHours: true },
    });

    return ok({ categories });
  } catch (err) {
    return serverError(err);
  }
}

