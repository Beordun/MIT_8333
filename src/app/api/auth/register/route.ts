import { OtpType, RoleName } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { issueOtp } from "@/lib/otp";
import { sendVerificationOtpEmail } from "@/lib/mailer";
import { created, badRequest, conflict, serverError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid registration details.", parsed.error.flatten().fieldErrors);
    }

    const { fullName, email, department, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return conflict("An account with this email already exists.");
    }

    const studentRole = await prisma.role.findUnique({
      where: { name: RoleName.STUDENT_STAFF },
    });
    if (!studentRole) {
      return serverError("Default STUDENT_STAFF role is not seeded.");
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        department,
        passwordHash,
        emailVerified: false,
        roleId: studentRole.id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        department: true,
      },
    });

    const otpResult = await issueOtp(user.id, OtpType.EMAIL_VERIFICATION);
    if (otpResult.ok) {
      await sendVerificationOtpEmail(user.email, user.fullName, otpResult.code);
    }

    return created({
      requiresVerification: true,
      email: user.email,
      message: "Account created. Please enter the 6-digit verification code sent to your email.",
    });
  } catch (err) {
    return serverError(err);
  }
}
