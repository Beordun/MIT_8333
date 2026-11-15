import { OtpType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie, getDashboardPathForRole } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { issueOtp } from "@/lib/otp";
import { sendAccountLockedEmail, sendVerificationOtpEmail } from "@/lib/mailer";
import { ok, badRequest, unauthorized, forbidden, serverError } from "@/lib/api-response";

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid login credentials format.", parsed.error.flatten().fieldErrors);
    }

    const { email, password, role: expectedRole } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: { select: { name: true } } },
    });

    if (!user) {
      return unauthorized("Invalid email or password.");
    }

    const now = new Date();
    if (user.lockedUntil && user.lockedUntil > now) {
      return forbidden(
        "Your account is temporarily locked after 5 failed sign-in attempts. Please wait 15 minutes or reset your password."
      );
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      const nextAttempts = user.failedLoginAttempts + 1;
      const shouldLock = nextAttempts >= MAX_FAILED_LOGIN_ATTEMPTS;
      const lockedUntil = shouldLock
        ? new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000)
        : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: nextAttempts,
          ...(shouldLock ? { lockedUntil } : {}),
        },
      });

      if (shouldLock) {
        await sendAccountLockedEmail(user.email, user.fullName);
        return forbidden(
          "Your account has been locked for 15 minutes after 5 failed sign-in attempts. Check your email or use Forgot Password to unlock it."
        );
      }

      return unauthorized("Invalid email or password.");
    }

    if (expectedRole && user.role.name !== expectedRole) {
      const nextAttempts = user.failedLoginAttempts + 1;
      const shouldLock = nextAttempts >= MAX_FAILED_LOGIN_ATTEMPTS;
      const lockedUntil = shouldLock
        ? new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000)
        : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: nextAttempts,
          ...(shouldLock ? { lockedUntil } : {}),
        },
      });

      if (shouldLock) {
        await sendAccountLockedEmail(user.email, user.fullName);
        return forbidden(
          "Your account has been locked for 15 minutes after 5 failed sign-in attempts. Check your email or use Forgot Password to unlock it."
        );
      }

      const portalName =
        expectedRole === "ADMIN"
          ? "Administrator"
          : expectedRole === "MAINTENANCE_OFFICER"
            ? "Maintenance Officer"
            : "Student / Staff";

      return forbidden(
        `Access denied. This account is not authorised for ${portalName} access.`
      );
    }

    // Reset failed login counter on valid password
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    if (!user.emailVerified) {
      const otpResult = await issueOtp(user.id, OtpType.EMAIL_VERIFICATION);
      if (otpResult.ok) {
        await sendVerificationOtpEmail(user.email, user.fullName, otpResult.code);
      }
      return ok({
        requiresVerification: true,
        email: user.email,
        message: "Please verify your email address with the 6-digit code sent to your inbox.",
      });
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
      tokenVersion: user.tokenVersion,
    });

    return ok({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        department: user.department,
        role: user.role.name,
      },
      redirectTo: getDashboardPathForRole(user.role.name),
    });
  } catch (err) {
    return serverError(err);
  }
}
