import { z } from "zod";

/**
 * Single source of truth for environment configuration.
 * Validated once at startup (fail fast), then exposed as a typed, grouped `config` object.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8000),

  // Public URLs
  BASE_URL: z.url().default("http://localhost:8000"),
  API_URL: z.url().optional(),
  FRONTEND_URL: z.url().default("http://localhost:3000"),
  /** Comma-separated list of browser origins allowed by CORS. */
  ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),
  /** OIDC issuer (`iss` claim). Defaults to BASE_URL. */
  ISSUER_URL: z.url().optional(),

  /** 32-byte key as 64 hex chars: encrypts TOTP secrets, keys backup-code hashes. */
  DATA_ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, "DATA_ENCRYPTION_KEY must be 64 hex characters (32 bytes)"),

  // Infrastructure
  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),

  // JWT (HS256 session tokens)
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // Email (Resend)
  RESEND_API_KEY: z.string().default(""),
  EMAIL_FROM: z.string().default("ChaiAuth <onboarding@resend.dev>"),

  // Social providers
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  GITHUB_CLIENT_ID: z.string().default(""),
  GITHUB_CLIENT_SECRET: z.string().default(""),

  // Anti-bot (Cloudflare Turnstile)
  TURNSTILE_SECRET_KEY: z.string().default(""),
});

function loadEnv(source: NodeJS.ProcessEnv) {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}

const env = loadEnv(process.env);
const apiUrl = env.API_URL ?? `${env.BASE_URL}/api`;

export const config = {
  app: {
    env: env.NODE_ENV,
    isProduction: env.NODE_ENV === "production",
    port: env.PORT,
    baseUrl: env.BASE_URL,
    apiUrl,
    frontendUrl: env.FRONTEND_URL,
    allowedOrigins: env.ALLOWED_ORIGINS.split(",")
      .map((o) => o.trim().replace(/\/+$/, ""))
      .filter(Boolean),
  },
  redis: { host: env.REDIS_HOST, port: env.REDIS_PORT },
  security: { encryptionKey: Buffer.from(env.DATA_ENCRYPTION_KEY, "hex") },
  webauthn: {
    rpName: "ChaiAuth",
    // Relying-party id is the frontend hostname (e.g. localhost, auth.example.com)
    rpId: new URL(env.FRONTEND_URL).hostname,
    origin: new URL(env.FRONTEND_URL).origin,
  },
  jwt: {
    issuer: env.ISSUER_URL ?? env.BASE_URL,
    accessSecret: env.JWT_ACCESS_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  email: { resendApiKey: env.RESEND_API_KEY, from: env.EMAIL_FROM },
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackUrl: `${apiUrl}/auth/providers/google/callback`,
  },
  github: {
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    callbackUrl: `${apiUrl}/auth/providers/github/callback`,
  },
  turnstile: { secretKey: env.TURNSTILE_SECRET_KEY },
} as const;

export type AppConfig = typeof config;
