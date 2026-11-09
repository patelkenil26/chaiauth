import { rateLimit, type Options } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis";
import { config } from "../config/env.config";

interface LimiterOptions {
  /** Redis key prefix, unique per limiter. */
  prefix: string;
  windowMs: number;
  max: number;
  message: string;
  /** Count only failed (status >= 400) requests. */
  skipSuccessfulRequests?: boolean;
  handler?: Options["handler"];
}

/** Factory so every limiter shares the same Redis store + header conventions. */
const createRateLimiter = ({
  prefix,
  windowMs,
  max,
  message,
  skipSuccessfulRequests = false,
  handler,
}: LimiterOptions) =>
  rateLimit({
    windowMs,
    limit: max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    store: new RedisStore({
      sendCommand: (command: string, ...args: string[]) =>
        redis.call(command, ...args) as Promise<never>,
      prefix,
    }),
    message: { success: false, message, code: "TOO_MANY_REQUESTS" },
    ...(handler && { handler }),
  });

const MINUTE = 60 * 1000;

/** All other APIs: 100 requests / 15 min per IP. */
export const globalLimiter = createRateLimiter({
  prefix: "rl_global:",
  windowMs: 15 * MINUTE,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

/** Register / refresh / MFA setup: 5 requests / min per IP. */
export const authLimiter = createRateLimiter({
  prefix: "rl_auth:",
  windowMs: MINUTE,
  max: 5,
  message: "Too many authentication attempts, please try again after 1 minute",
});

/** Login / password reset / MFA verify: lock the IP for 15 min after 5 attempts. */
export const strictAuthLimiter = createRateLimiter({
  prefix: "rl_strict_auth:",
  windowMs: 15 * MINUTE,
  max: 5,
  // Only FAILED attempts count, so legitimate users are never locked out by their own successful logins
  skipSuccessfulRequests: true,
  message: "Too many failed attempts. Please try again after 15 minutes.",
});

/**
 * Endpoints that always answer 200 (to avoid user enumeration) but send an email:
 * every call counts, otherwise they could be used to spam someone's inbox.
 */
export const emailActionLimiter = createRateLimiter({
  prefix: "rl_email_action:",
  windowMs: 15 * MINUTE,
  max: 5,
  message: "Too many requests. Please try again after 15 minutes.",
});

const OAUTH_LIMIT_MESSAGE = "Too many authentication attempts, please try again after 1 minute";

/** OAuth redirects: browsers get bounced back to the login page with the error. */
export const oauthLimiter = createRateLimiter({
  prefix: "rl_oauth:",
  windowMs: MINUTE,
  max: 5,
  message: OAUTH_LIMIT_MESSAGE,
  handler: (req, res, _next, options) => {
    if (req.accepts("html")) {
      const url = `${config.app.frontendUrl}/login?error=${encodeURIComponent(OAUTH_LIMIT_MESSAGE)}`;
      return res.redirect(url);
    }
    res.status(options.statusCode).json(options.message);
  },
});
