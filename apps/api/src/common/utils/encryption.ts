import crypto from "node:crypto";
import { config } from "../config/env.config";

/**
 * Application-level encryption for secrets that must be recoverable (e.g. TOTP seeds).
 * AES-256-GCM: confidential + tamper-evident. Stored as `v1.<iv>.<tag>.<ciphertext>` (base64url).
 */
const ALGORITHM = "aes-256-gcm";
const VERSION = "v1";

export const encrypt = (plaintext: string): string => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, config.security.encryptionKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv, tag, ciphertext].map((p) => (typeof p === "string" ? p : p.toString("base64url"))).join(".");
};

export const decrypt = (payload: string): string => {
  const [version, iv, tag, ciphertext] = payload.split(".");
  if (version !== VERSION || !iv || !tag || !ciphertext) throw new Error("Unsupported ciphertext format");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    config.security.encryptionKey,
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
};

/**
 * Keyed hash (HMAC-SHA256). Use for LOW-ENTROPY secrets such as backup codes: a plain SHA-256
 * of an 8-character code can be brute-forced offline from a DB dump; an HMAC cannot without the key.
 */
export const keyedHash = (value: string): string =>
  crypto.createHmac("sha256", config.security.encryptionKey).update(value).digest("hex");
