import { OtpType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";
import { issueOtp } from "@/lib/otp";
import { sendPasswordResetOtpEmail } from "@/lib/mailer";
import { ok, badRequest, serverError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Please enter a valid email address.", parsed.error.flatten().fieldErrors);
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (user) {
      const otpResult = await issueOtp(user.id, OtpType.PASSWORD_RESET);
      if (!otpResult.ok) {
        return badRequest(otpResult.error);
      }
      await sendPasswordResetOtpEmail(user.email, user.fullName, otpResult.code);
    }

    // Generic message prevents email enumeration
    return ok({
      message: "If an account exists for that email address, a 6-digit reset code has been sent.",
    });
  } catch (err) {
    return serverError(err);
  }
}

