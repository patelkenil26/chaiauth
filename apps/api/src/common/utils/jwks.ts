import crypto from "node:crypto";
import { getSigningKeys } from "./cert";

export interface PublicJwk {
  kty: string;
  n: string;
  e: string;
  kid: string;
  use: "sig";
  alg: "RS256";
}

let cache: PublicJwk | undefined;

/** Public signing key as a JWK, with an RFC 7638 thumbprint as `kid` (lets clients cache / rotate keys). */
export const getPublicJwk = (): PublicJwk => {
  if (cache) return cache;

  const jwk = crypto.createPublicKey(getSigningKeys().publicKey).export({ format: "jwk" });
  const { kty, n, e } = jwk as { kty: string; n: string; e: string };

  // RFC 7638: SHA-256 over the canonical JSON of the required members, in lexicographic order
  const kid = crypto.createHash("sha256").update(JSON.stringify({ e, kty, n })).digest("base64url");

  cache = { kty, n, e, kid, use: "sig", alg: "RS256" };
  return cache;
};

export const getKeyId = (): string => getPublicJwk().kid;
