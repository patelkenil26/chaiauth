import crypto from "node:crypto";
import { authenticator } from "otplib";
import qrcode from "qrcode";
import type { SelectUser } from "@repo/database/schema";
import { ApiError } from "../../../common/errors/api-error";
import { redis } from "../../../common/config/redis";
import { decrypt, encrypt, keyedHash } from "../../../common/utils/encryption";
import { verifyMfaToken } from "../../../common/utils/jwt";
import { userRepository } from "../user.repository";

// Accept ±2 time-steps to tolerate clock drift between the server and the user's phone
authenticator.options = { window: 2 };

const ISSUER_NAME = "ChaiAuth";
const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_LENGTH = 8;
/** A TOTP code is valid for up to (2*window+1)*30s; remember used ones slightly longer. */
const USED_CODE_TTL_SEC = 180;

const generateBackupCodes = () =>
  Array.from({ length: BACKUP_CODE_COUNT }, () =>
    crypto.randomBytes(BACKUP_CODE_LENGTH / 2).toString("hex"),
  );

const requireUser = async (userId: string): Promise<SelectUser> => {
  const user = await userRepository.findById(userId);
  if (!user || user.deletedAt) throw ApiError.unauthorized("User no longer exists");
  return user;
};

const isTotpValid = (user: SelectUser, code: string): boolean => {
  if (!user.mfaSecret) return false;
  return authenticator.verify({ token: code, secret: decrypt(user.mfaSecret) });
};

/**
 * Verifies a TOTP or backup code for a user who has MFA configured.
 *  - Backup codes are single-use (atomic delete).
 *  - TOTP codes are single-use too: replaying a sniffed code inside its validity window is rejected.
 */
export const verifyMfaCode = async (user: SelectUser, code: string): Promise<void> => {
  if (code.length === BACKUP_CODE_LENGTH) {
    const spent = await userRepository.consumeBackupCode(user.id, keyedHash(code.toLowerCase()));
    if (!spent) throw ApiError.unauthorized("Invalid backup code");
    return;
  }

  if (!isTotpValid(user, code)) throw ApiError.unauthorized("Invalid authenticator code");

  const firstUse = await redis.set(`mfa_used:${user.id}:${code}`, "1", "EX", USED_CODE_TTL_SEC, "NX");
  if (!firstUse) throw ApiError.unauthorized("This code was already used. Wait for the next one.");
};

export const mfaService = {
  /**
   * Starts MFA setup. The secret stays INACTIVE (`mfaEnabled=false`) until the user proves
   * they can generate a code. Refuses when MFA is already on, otherwise a hijacked session
   * could silently swap the TOTP seed and lock the real owner out.
   */
  async generateSecret(userId: string) {
    const user = await requireUser(userId);
    if (user.mfaEnabled) {
      throw ApiError.conflict("MFA is already enabled. Disable it first to set it up again.");
    }

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, ISSUER_NAME, secret);
    const backupCodes = generateBackupCodes();

    await userRepository.update(userId, {
      mfaSecret: encrypt(secret),
      backupCodes: backupCodes.map((c) => keyedHash(c)),
    });

    // Raw backup codes are returned ONLY here, once. Only keyed hashes are stored.
    return { secret, qrCodeUrl: await qrcode.toDataURL(otpauthUrl), backupCodes };
  },

  async verifyAndEnable(userId: string, code: string): Promise<void> {
    const user = await requireUser(userId);
    if (user.mfaEnabled) throw ApiError.conflict("MFA is already enabled");
    if (!user.mfaSecret) throw ApiError.badRequest("MFA setup has not been initiated");
    if (!isTotpValid(user, code)) throw ApiError.badRequest("Invalid MFA code");

    await userRepository.update(userId, { mfaEnabled: true });
  },

  async disable(userId: string, code: string): Promise<void> {
    const user = await requireUser(userId);
    if (!user.mfaEnabled) throw ApiError.badRequest("MFA is already disabled");

    await verifyMfaCode(user, code);
    await userRepository.update(userId, { mfaEnabled: false, mfaSecret: null, backupCodes: null });
  },

  /** Second step of login: exchanges the short-lived MFA challenge token + code for a verified user. */
  async completeLogin(mfaToken: string, code: string): Promise<SelectUser> {
    let userId: string;
    try {
      userId = verifyMfaToken(mfaToken).id;
    } catch {
      throw ApiError.unauthorized("MFA session expired or invalid");
    }

    const user = await requireUser(userId);
    if (!user.mfaEnabled || !user.mfaSecret) throw ApiError.unauthorized("MFA is not set up correctly");

    await verifyMfaCode(user, code);
    return user;
  },
};
