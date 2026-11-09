import { z } from "zod";

/**
 * Reusable field-level schemas. Compose these in every module's DTOs so validation
 * rules (and their error messages) stay identical across the whole API.
 */

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Please provide a valid email address"));

export const nameField = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name cannot exceed 50 characters");

export const usernameField = z.string().trim().min(3).max(50);

export const phoneField = z.string().trim().min(10).max(20);

/** Password policy (mirrors the frontend). Max 72: bcrypt ignores everything after 72 bytes. */
export const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password cannot exceed 72 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

/** Opaque token in a URL path / body (hex strings produced by `generateToken`). */
export const tokenField = z.string().trim().min(1, "Token is required").max(512);

export const uuidField = z.uuid("Invalid id");
