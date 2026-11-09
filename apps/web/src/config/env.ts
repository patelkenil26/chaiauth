import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url("API URL must be a valid URL"),
  NEXT_PUBLIC_OIDC_URL: z.string().url("OIDC URL must be a valid URL").optional(),
  NEXT_PUBLIC_FRONTEND_URL: z.string().url("Frontend URL must be a valid URL").default("http://localhost:3000"),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1, "Turnstile site key is required"),
});

// Validate `process.env` against our schema
const parsedEnv = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_OIDC_URL: process.env.NEXT_PUBLIC_OIDC_URL,
  NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
});

if (!parsedEnv.success) {
  console.error("Invalid frontend environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
