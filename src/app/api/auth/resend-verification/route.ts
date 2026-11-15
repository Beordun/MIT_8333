import { OtpType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";
import { issueOtp } from "@/lib/otp";
import { sendVerificationOtpEmail } from "@/lib/mailer";
import { ok, badRequest, serverError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Please enter a valid email address.");
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (user && !user.emailVerified) {
      const otpResult = await issueOtp(user.id, OtpType.EMAIL_VERIFICATION);
      if (!otpResult.ok) {
        return badRequest(otpResult.error);
      }
      await sendVerificationOtpEmail(user.email, user.fullName, otpResult.code);
    }

    return ok({
      message: "If an unverified account exists for that email, a new 6-digit code has been sent.",
    });
  } catch (err) {
    return serverError(err);
  }
}

