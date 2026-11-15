import { OtpType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, clearSessionCookie } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validators";
import { verifyAndConsumeOtp } from "@/lib/otp";
import { sendPasswordChangedEmail } from "@/lib/mailer";
import { ok, badRequest, serverError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Please check your reset details.", parsed.error.flatten().fieldErrors);
    }

    const { email, code, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return badRequest("Invalid email or 6-digit reset code.");
    }

    const verification = await verifyAndConsumeOtp(user.id, OtpType.PASSWORD_RESET, code);
    if (!verification.ok) {
      return badRequest(verification.error);
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        emailVerified: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        tokenVersion: { increment: 1 },
      },
    });

    await clearSessionCookie();
    await sendPasswordChangedEmail(user.email, user.fullName);

    return ok({
      message: "Your password has been reset. You can now sign in with your new password.",
    });
  } catch (err) {
    return serverError(err);
  }
}

