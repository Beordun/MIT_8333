import { prisma } from "@/lib/prisma";
import { clearSessionCookie, getSessionUser } from "@/lib/auth";
import { ok, serverError } from "@/lib/api-response";

export async function POST() {
  try {
    const session = await getSessionUser();
    if (session) {
      await prisma.user
        .update({
          where: { id: session.userId },
          data: { tokenVersion: { increment: 1 } },
        })
        .catch(() => null);
    }
    await clearSessionCookie();
    return ok({ message: "Signed out.", redirectTo: "/" });
  } catch (err) {
    return serverError(err);
  }
}
