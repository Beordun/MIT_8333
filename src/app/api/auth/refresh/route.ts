import { prisma } from "@/lib/prisma";
import { getSessionUser, setSessionCookie, clearSessionCookie, getIdleTimeoutSeconds } from "@/lib/auth";
import { ok, unauthorized, serverError } from "@/lib/api-response";

export async function POST() {
  try {
    const session = await getSessionUser();
    if (!session) return unauthorized("Session expired.");

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { role: { select: { name: true } } },
    });

    if (!user || user.tokenVersion !== (session.tokenVersion ?? 0)) {
      await clearSessionCookie();
      return unauthorized("Session is no longer valid.");
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
      tokenVersion: user.tokenVersion,
    });

    return ok({
      refreshed: true,
      timeoutSeconds: getIdleTimeoutSeconds(user.role.name),
    });
  } catch (err) {
    return serverError(err);
  }
}

