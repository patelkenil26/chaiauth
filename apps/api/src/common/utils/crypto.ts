import crypto from "node:crypto";

/** SHA-256 hex digest. Used to store tokens/codes so a DB leak does not leak usable secrets. */
export const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

/** Cryptographically random token plus its hash (store the hash, send the raw value). */
export const generateToken = (bytes = 32): { rawToken: string; hashedToken: string } => {
  const rawToken = crypto.randomBytes(bytes).toString("hex");
  return { rawToken, hashedToken: hashToken(rawToken) };
};

/** Uniformly distributed numeric OTP (CSPRNG, not Math.random). */
export const generateOtp = (digits = 6): string =>
  crypto.randomInt(0, 10 ** digits).toString().padStart(digits, "0");

/** Constant-time string comparison (avoids timing side channels). */
export const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};
