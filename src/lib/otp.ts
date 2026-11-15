import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import type { OtpType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const OTP_EXPIRY_MINUTES = 10;
export const MAX_OTP_ATTEMPTS = 5;
export const OTP_COOLDOWN_SECONDS = 60;
export const MAX_OTP_REQUESTS_PER_WINDOW = 3;

/** Generates a cryptographically random 6-digit numeric OTP string. */
export function generateSixDigitOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/** Issues a new 6-digit OTP (10-minute expiry), invalidating older unused OTPs of the same type. */
export async function issueOtp(
  userId: string,
  type: OtpType
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  const now = new Date();
  const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);

  const recentOtps = await prisma.verificationOtp.findMany({
    where: {
      userId,
      type,
      createdAt: { gte: fifteenMinsAgo },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentOtps.length >= MAX_OTP_REQUESTS_PER_WINDOW) {
    return {
      ok: false,
      error: "Too many code requests. Please wait 15 minutes before requesting another code.",
    };
  }

  const latest = recentOtps[0];
  if (latest && now.getTime() - latest.createdAt.getTime() < OTP_COOLDOWN_SECONDS * 1000) {
    return {
      ok: false,
      error: "Please wait 60 seconds before requesting another code.",
    };
  }

  const code = generateSixDigitOtp();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.$transaction([
    // Invalidate all previous unused codes of this type for this user
    prisma.verificationOtp.updateMany({
      where: { userId, type, usedAt: null },
      data: { usedAt: now },
    }),
    prisma.verificationOtp.create({
      data: {
        userId,
        type,
        codeHash,
        expiresAt,
      },
    }),
  ]);

  return { ok: true, code };
}

/** Verifies a 6-digit OTP and marks it used so it can never be reused. */
export async function verifyAndConsumeOtp(
  userId: string,
  type: OtpType,
  code: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const now = new Date();

  const record = await prisma.verificationOtp.findFirst({
    where: {
      userId,
      type,
      usedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return { ok: false, error: "Invalid or already used verification code." };
  }

  if (record.expiresAt <= now) {
    await prisma.verificationOtp.update({
      where: { id: record.id },
      data: { usedAt: now },
    });
    return { ok: false, error: "This 6-digit code has expired. Please request a new one." };
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.verificationOtp.update({
      where: { id: record.id },
      data: { usedAt: now },
    });
    return { ok: false, error: "Too many incorrect attempts. Please request a new code." };
  }

  const matches = await bcrypt.compare(code, record.codeHash);
  if (!matches) {
    const nextAttempts = record.attempts + 1;
    await prisma.verificationOtp.update({
      where: { id: record.id },
      data: {
        attempts: nextAttempts,
        ...(nextAttempts >= MAX_OTP_ATTEMPTS ? { usedAt: now } : {}),
      },
    });
    return { ok: false, error: "Invalid 6-digit verification code." };
  }

  await prisma.verificationOtp.update({
    where: { id: record.id },
    data: { usedAt: now },
  });

  return { ok: true };
}

