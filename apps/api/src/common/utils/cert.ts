import { readFileSync } from "node:fs";
import path from "node:path";

const CERT_DIR = path.join(process.cwd(), "cert");

let cache: { privateKey: string; publicKey: string } | undefined;

/**
 * RSA key pair used to sign/verify OIDC (RS256) tokens.
 * Loaded lazily so the server can boot without keys until OIDC is actually used.
 * Generate with: `bash scripts/generate-keys.sh`
 */
export const getSigningKeys = () => {
  if (cache) return cache;
  try {
    cache = {
      privateKey: readFileSync(path.join(CERT_DIR, "private-key.pem"), "utf-8"),
      publicKey: readFileSync(path.join(CERT_DIR, "public-key.pub"), "utf-8"),
    };
    return cache;
  } catch {
    throw new Error(`OIDC signing keys not found in ${CERT_DIR}. Run: bash scripts/generate-keys.sh`);
  }
};
