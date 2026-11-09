import type { SelectUser } from "@repo/database/schema";
import { ApiError } from "../../common/errors/api-error";
import { TTL } from "./auth.constants";
import { userRepository } from "./user.repository";

/**
 * Soft-deleted accounts can be restored by signing in within the recovery window.
 * MUST be called only AFTER the caller's identity has been proven (password, OTP, social, passkey):
 * otherwise anyone who knows an email address could resurrect somebody else's account.
 */
export const restoreIfSoftDeleted = async (user: SelectUser): Promise<SelectUser> => {
  if (!user.deletedAt) return user;

  if (Date.now() - user.deletedAt.getTime() > TTL.accountRecoveryMs) {
    throw ApiError.forbidden("Account has been permanently deleted.");
  }
  return (await userRepository.update(user.id, { deletedAt: null })) ?? { ...user, deletedAt: null };
};
