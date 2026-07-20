import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

// Deliberately excludes SYSTEM_ADMIN, SAFETY_OFFICER, and DEPOT_MANAGER —
// those are internal, higher-trust roles that should only be granted by
// an existing admin via /admin/users, never picked by someone signing
// themselves up on a public form.
export const SELF_SERVE_ROLES = ["CONTRACTOR", "SUPERVISOR"] as const;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name."),
    email: z.string().email("Enter a valid email address."),
    department: z.string().trim().max(120).optional(),
    role: z.enum(SELF_SERVE_ROLES, {
      message: "Select the role that matches your work on site.",
    }),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });
