import { ApiError } from "../../common/errors/api-error";
import { emailService } from "../../common/email/email.service";
import { redis } from "../../common/config/redis";
import { generateToken, hashToken } from "../../common/utils/crypto";
import { validateEmailSecurity } from "../../common/utils/email-validator";
import { comparePassword, hashPassword } from "../../common/utils/password";
import { runSafely } from "../../common/utils/safe-async";
import { REDIS_KEYS, TTL } from "./auth.constants";
import { toPublicUser, type PublicUser } from "./auth.mapper";
import type { UpdateProfileInput } from "./dto/account.dto";
import { oauthAccountRepository } from "./providers/oauth-account.repository";
import { sessionsService } from "./sessions/sessions.service";
import { userRepository } from "./user.repository";

/** Loads the user or throws 404. Accounts that are soft-deleted are treated as missing. */
const requireUser = async (userId: string) => {
  const user = await userRepository.findById(userId);
  if (!user || user.deletedAt) throw ApiError.notFound("User not found");
  return user;
};

/** Operations on the signed-in user's own account (profile, password, deletion, data export). */
export const accountService = {
  async getMe(userId: string): Promise<PublicUser> {
    const user = await requireUser(userId);
    const pendingEmail = await redis.get(REDIS_KEYS.pendingEmail(userId));
    return { ...toPublicUser(user), ...(pendingEmail && { pendingEmail }) };
  },

  async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await requireUser(userId);
    if (!user.password) throw ApiError.badRequest("You cannot change password for OAuth accounts.");

    if (!(await comparePassword(oldPassword, user.password))) {
      throw ApiError.unauthorized("Incorrect current password.");
    }

    await userRepository.update(userId, { password: await hashPassword(newPassword) });
    void runSafely("Password changed email", emailService.sendPasswordChangedEmail(user.email));
  },

  /** Soft delete: recoverable by logging in within the recovery window. */
  async deleteAccount(userId: string): Promise<void> {
    await requireUser(userId);
    await userRepository.update(userId, { deletedAt: new Date() });
    await sessionsService.revokeAll(userId);
  },

  async updateProfile(userId: string, { name, email }: UpdateProfileInput): Promise<PublicUser> {
    const user = await requireUser(userId);
    const updates: Parameters<typeof userRepository.update>[1] = {};
    if (name) updates.name = name;

    if (email && email !== user.email) {
      await validateEmailSecurity(email);
      if (await userRepository.findByEmail(email)) {
        throw ApiError.conflict("Email already in use by another account");
      }

      // The new address is NOT saved yet: it's parked in Redis until the owner proves they can read it.
      const { rawToken, hashedToken } = generateToken();
      updates.verificationToken = hashedToken;
      await redis.set(REDIS_KEYS.pendingEmail(userId), email, "EX", TTL.pendingEmailSec);

      void runSafely("Verification email", emailService.sendVerificationEmail(email, rawToken));
    }

    if (Object.keys(updates).length === 0) return toPublicUser(user);

    const updated = await userRepository.update(userId, updates);
    return toPublicUser(updated ?? user);
  },

  /** Builds the export, parks it in Redis for 24h and emails a download link. */
  async requestDataExport(userId: string, password: string | undefined): Promise<void> {
    const user = await requireUser(userId);

    // Re-authentication ("sudo mode") before releasing personal data
    if (user.password) {
      if (!password) throw ApiError.unauthorized("Password is required to export data");
      if (!(await comparePassword(password, user.password))) {
        throw ApiError.unauthorized("Incorrect password");
      }
    }

    const [sessions, oauthAccounts] = await Promise.all([
      sessionsService.listAllForUser(userId),
      oauthAccountRepository.listByUserId(userId),
    ]);

    const exportData = {
      profile: toPublicUser(user),
      security: { mfaEnabled: user.mfaEnabled, hasPassword: Boolean(user.password) },
      sessions: sessions.map((s) => ({
        browser: s.browser,
        os: s.os,
        device: s.device,
        ip: s.ip,
        isActive: s.isActive,
        lastActiveAt: s.lastActiveAt,
        createdAt: s.createdAt,
      })),
      connectedAccounts: oauthAccounts.map((a) => ({
        provider: a.provider,
        providerAccountId: a.providerAccountId,
        linkedAt: a.createdAt,
      })),
      exportedAt: new Date(),
    };

    // Only the hash is used as the Redis key, so Redis contents alone can't be turned into a download link
    const { rawToken, hashedToken } = generateToken();
    await redis.set(REDIS_KEYS.dataExport(hashedToken), JSON.stringify(exportData), "EX", TTL.dataExportSec);

    await emailService.sendDataExportEmail(user.email, rawToken);
  },

  async downloadExportedData(token: string): Promise<unknown> {
    const raw = await redis.get(REDIS_KEYS.dataExport(hashToken(token)));
    if (!raw) throw ApiError.badRequest("Download link is invalid or has expired");
    return JSON.parse(raw);
  },
};
