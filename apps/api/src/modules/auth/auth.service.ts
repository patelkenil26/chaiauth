import { ApiError } from "../../common/errors/api-error";
import { emailService } from "../../common/email/email.service";
import { redis } from "../../common/config/redis";
import { generateToken, generateOtp, hashToken, safeEqual } from "../../common/utils/crypto";
import { validateEmailSecurity } from "../../common/utils/email-validator";
import type { SelectUser } from "@repo/database/schema";
import { generateAccessToken, generateMfaToken, verifyRefreshToken } from "../../common/utils/jwt";
import { burnPasswordCheck, comparePassword, hashPassword } from "../../common/utils/password";
import { runSafely } from "../../common/utils/safe-async";
import { REDIS_KEYS, TTL } from "./auth.constants";
import { toPublicUser, type PublicUser } from "./auth.mapper";
import type { LoginInput } from "./dto/login.dto";
import type { SendOtpInput } from "./dto/otp.dto";
import type { RegisterInput } from "./dto/register.dto";
import { sessionsService } from "./sessions/sessions.service";
import { userRepository } from "./user.repository";

export type LoginOutcome =
  | { status: "mfa_required"; mfaToken: string; email: string }
  /** Credentials verified. Tokens are minted when the session is created (see auth.session.ts). */
  | { status: "authenticated"; user: SelectUser };

const INVALID_CREDENTIALS = "Invalid credentials";

export const authService = {
  async register(input: RegisterInput): Promise<PublicUser> {
    const { name, email, username, phone, password, role } = input;

    const existing = await userRepository.findByAnyIdentifier({ email, username, phone });
    if (existing) {
      if (existing.email === email) throw ApiError.conflict("Email already registered");
      if (username && existing.username === username) throw ApiError.conflict("Username already taken");
      if (phone && existing.phone === phone) throw ApiError.conflict("Phone number already registered");
      throw ApiError.conflict("User already exists");
    }

    // Blocks disposable domains and domains that cannot receive mail
    await validateEmailSecurity(email);

    const { rawToken, hashedToken } = generateToken();
    const user = await userRepository.create({
      name,
      email,
      username,
      phone,
      role,
      password: await hashPassword(password),
      verificationToken: hashedToken,
    });

    // The account exists already: a mail failure must not fail the registration.
    void runSafely("Verification email", emailService.sendVerificationEmail(email, rawToken));

    return toPublicUser(user);
  },

  async login(input: LoginInput): Promise<LoginOutcome> {
    const identifier = input.email ?? input.username ?? input.phone;
    if (!identifier) throw ApiError.badRequest("Please provide email, username, or phone");

    const user = await userRepository.findByLoginIdentifier(identifier);

    if (!user) {
      // Same cost and same message as a wrong password: no user enumeration
      if (input.password) await burnPasswordCheck(input.password);
      throw ApiError.unauthorized(INVALID_CREDENTIALS);
    }

    if (input.otp) {
      await this.consumeOtp(user.id, user.otpCode, user.otpExpires, input.otp);
    } else {
      // Social / passkey-only accounts have no password
      if (!user.password) {
        throw ApiError.unauthorized("Please login using your social account (Google/GitHub)");
      }
      const matches = await comparePassword(input.password ?? "", user.password);
      if (!matches) throw ApiError.unauthorized(INVALID_CREDENTIALS);

      // An emailed OTP is itself proof of email ownership; a password login is not.
      if (!user.isVerified) throw ApiError.forbidden("Please verify your email before logging in");
    }

    // Credentials are valid from here on. Only now may a soft-deleted account be restored.
    if (user.deletedAt) {
      if (Date.now() - user.deletedAt.getTime() > TTL.accountRecoveryMs) {
        throw ApiError.forbidden("Account has been permanently deleted.");
      }
      await userRepository.update(user.id, { deletedAt: null });
      user.deletedAt = null;
    }

    if (user.mfaEnabled) {
      return { status: "mfa_required", mfaToken: generateMfaToken({ id: user.id }), email: user.email };
    }

    return { status: "authenticated", user };
  },

  /** Validates and burns a one-time code. Codes are stored hashed and compared in constant time. */
  async consumeOtp(userId: string, storedHash: string | null, expires: Date | null, otp: string) {
    if (!storedHash || !expires) {
      throw ApiError.unauthorized("No OTP was requested. Please request an OTP first.");
    }
    if (Date.now() > expires.getTime()) {
      throw ApiError.unauthorized("OTP has expired. Please request a new one.");
    }
    if (!safeEqual(hashToken(otp), storedHash)) throw ApiError.unauthorized("Invalid OTP.");

    await userRepository.update(userId, { otpCode: null, otpExpires: null });
  },

  async sendOtp({ email, phone }: SendOtpInput): Promise<void> {
    const user = await userRepository.findByAnyIdentifier({ email, phone });

    // Always succeed from the caller's point of view (no user enumeration)
    if (!user) return;

    const otp = generateOtp();
    await userRepository.update(user.id, {
      otpCode: hashToken(otp),
      otpExpires: new Date(Date.now() + TTL.otpMs),
    });

    // Delivery is by email; SMS (Twilio / SNS) plugs in here later.
    void runSafely("OTP email", emailService.sendOtpEmail(user.email, otp));
  },

  /** Issues a new access token for a valid, non-revoked refresh token. */
  async refresh(refreshToken: string | undefined): Promise<{ accessToken: string }> {
    if (!refreshToken) throw ApiError.unauthorized("Refresh token missing");

    let userId: string;
    try {
      userId = verifyRefreshToken(refreshToken).id;
    } catch {
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    const user = await userRepository.findById(userId);
    if (!user || user.deletedAt) throw ApiError.unauthorized("User no longer exists");

    // `sessions` is the single source of truth for live refresh tokens
    const session = await sessionsService.findActiveByRefreshToken(refreshToken);
    if (!session) throw ApiError.unauthorized("Session was revoked, please log in again");

    await sessionsService.touch(session.id);
    return { accessToken: generateAccessToken({ id: user.id, role: user.role, sid: session.id }) };
  },

  async logout(userId: string, refreshToken: string | undefined): Promise<void> {
    if (refreshToken) await sessionsService.revokeByRefreshToken(userId, refreshToken);
  },

  async verifyEmail(token: string): Promise<void> {
    const user = await userRepository.findByVerificationToken(hashToken(token));
    if (!user) throw ApiError.badRequest("Invalid or expired verification token");

    // An email change is only applied once the NEW address is verified
    const pendingKey = REDIS_KEYS.pendingEmail(user.id);
    const pendingEmail = await redis.get(pendingKey);

    if (pendingEmail) {
      const owner = await userRepository.findByEmail(pendingEmail);
      if (owner && owner.id !== user.id) throw ApiError.conflict("Email already in use by another account");
    }

    await userRepository.update(user.id, {
      isVerified: true,
      verificationToken: null,
      ...(pendingEmail && { email: pendingEmail }),
    });
    if (pendingEmail) await redis.del(pendingKey);

    void runSafely("Welcome email", emailService.sendWelcomeEmail(pendingEmail ?? user.email, user.name));
  },

  /** Responds the same whether or not the email exists (no user enumeration). */
  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);
    if (!user || user.deletedAt) return;

    const { rawToken, hashedToken } = generateToken();
    await userRepository.update(user.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + TTL.resetPasswordMs),
    });

    void runSafely("Reset password email", emailService.sendResetPasswordEmail(email, rawToken));
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await userRepository.findByValidResetToken(hashToken(token));
    if (!user) throw ApiError.badRequest("Invalid or expired reset token");

    await userRepository.update(user.id, {
      password: await hashPassword(newPassword),
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    // Whoever knew the old password (or held a stolen session) must be signed out everywhere
    await sessionsService.revokeAll(user.id);

    void runSafely("Password changed email", emailService.sendPasswordChangedEmail(user.email));
  },
};
