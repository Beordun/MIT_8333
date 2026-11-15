import { z } from "zod";
import { Priority, RequestStatus, RoleName } from "@prisma/client";

export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must include at least one capital letter.")
  .regex(/[0-9]/, "Password must include at least one number.")
  .regex(/[^A-Za-z0-9]/, "Password must include at least one special character.");

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  email: z.string().trim().email("Please enter a valid email address.").toLowerCase(),
  department: z.string().trim().min(2, "Department or hostel/unit is required."),
  password: strongPasswordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").toLowerCase(),
  password: z.string().min(1, "Password is required."),
  role: z.nativeEnum(RoleName).optional(),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").toLowerCase(),
  code: z.string().trim().regex(/^\d{6}$/, "Please enter a valid 6-digit code."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").toLowerCase(),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address.").toLowerCase(),
  code: z.string().trim().regex(/^\d{6}$/, "Please enter a valid 6-digit code."),
  password: strongPasswordSchema,
});

export const createRequestSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters.").max(120),
  description: z.string().trim().min(10, "Please describe the fault in at least 10 characters.").max(1000),
  location: z.string().trim().min(3, "Location (e.g., Block B, Room 204) is required.").max(120),
  categoryId: z.string().min(1, "Please select a category."),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  evidenceUrl: z
    .string()
    .max(2_000_000, "Image payload is too large (max ~1.5MB).")
    .optional()
    .nullable(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(RequestStatus),
  comment: z.string().trim().min(3, "Please provide a short status note.").max(500),
});

export const assignOfficerSchema = z.object({
  officerId: z.string().min(1, "Please select a Maintenance Officer."),
  notes: z.string().trim().max(500).optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(RoleName),
});

export const adminCreateUserSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  email: z.string().trim().email("Please enter a valid email address.").toLowerCase(),
  department: z.string().trim().min(2, "Department or unit is required."),
  role: z.nativeEnum(RoleName),
  password: strongPasswordSchema,
});
