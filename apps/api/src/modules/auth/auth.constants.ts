import { days, minutes } from "../../common/utils/duration";

export const REFRESH_COOKIE_NAME = "refreshToken";

/** Redis key builders: one place, so keys never drift between modules. */
export const REDIS_KEYS = {
  pendingEmail: (userId: string) => `pending_email:${userId}`,
  dataExport: (tokenHash: string) => `export_data:${tokenHash}`,
  /** token hash -> userId */
  magicLink: (tokenHash: string) => `magic_link:${tokenHash}`,
  /** userId -> hash of that user's newest link, so a new request invalidates the previous one */
  magicLinkOf: (userId: string) => `magic_link_user:${userId}`,
} as const;

export const TTL = {
  /** Password reset link validity. */
  resetPasswordMs: minutes(15),
  /** Emailed one-time login code validity. */
  otpMs: minutes(10),
  /** Magic sign-in link validity, in seconds for Redis EX. */
  magicLinkSec: 15 * 60,
  /** Pending (unverified) email change, in seconds for Redis EX. */
  pendingEmailSec: 15 * 60,
  /** Data export download link, in seconds for Redis EX. */
  dataExportSec: 24 * 60 * 60,
  /** Soft-deleted accounts can still be recovered by logging in within this window. */
  accountRecoveryMs: days(30),
} as const;
