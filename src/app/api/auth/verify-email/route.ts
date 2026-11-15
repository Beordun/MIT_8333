import { OtpType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, getDashboardPathForRole } from "@/lib/auth";
import { verifyEmailSchema } from "@/lib/validators";
import { verifyAndConsumeOtp } from "@/lib/otp";
import { ok, badRequest, serverError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = verifyEmailSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Please provide a valid email and 6-digit code.", parsed.error.flatten().fieldErrors);
    }

    const { email, code } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: { select: { name: true } } },
    });

    if (!user) {
      return badRequest("Invalid email or verification code.");
    }

    const verification = await verifyAndConsumeOtp(user.id, OtpType.EMAIL_VERIFICATION, code);
    if (!verification.ok) {
      return badRequest(verification.error);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
      tokenVersion: user.tokenVersion,
    });

    return ok({
      message: "Email verified successfully.",
      redirectTo: getDashboardPathForRole(user.role.name),
    });
  } catch (err) {
    return serverError(err);
  }
}

