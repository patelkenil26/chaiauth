import dns from "node:dns/promises";
import { logger } from "@repo/logger";
// Package ships a JSON array of disposable domains
import disposableDomains from "disposable-email-blocklist";
import { ApiError } from "../errors/api-error";

const disposableSet = new Set<string>(disposableDomains as unknown as string[]);

/**
 * Rejects disposable domains and domains that cannot receive mail (no MX records).
 * Transient DNS failures are logged and allowed through so real users are never blocked by DNS outages.
 */
export const validateEmailSecurity = async (email: string): Promise<void> => {
  const parts = email.split("@");
  if (parts.length !== 2 || !parts[1]) throw ApiError.badRequest("Invalid email format");
  const domain = parts[1].toLowerCase();

  if (disposableSet.has(domain)) {
    throw ApiError.badRequest("Temporary or disposable emails are not allowed. Please use a valid email.");
  }

  try {
    const mxRecords = await dns.resolveMx(domain);
    if (mxRecords.length === 0) {
      throw ApiError.badRequest(`The domain "${domain}" cannot receive emails.`);
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      throw ApiError.badRequest(`The domain "${domain}" does not exist or cannot receive emails.`);
    }
    logger.warn(`DNS lookup failed for ${domain}`, { message: (err as Error).message });
  }
};
