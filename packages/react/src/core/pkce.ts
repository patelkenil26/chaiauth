const toBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const getCrypto = (): Crypto => {
  const c = globalThis.crypto;
  if (!c?.subtle) {
    throw new Error("ChaiAuth needs the Web Crypto API. Serve your app over HTTPS (localhost is fine for development).");
  }
  return c;
};

/** URL-safe random string. 32 bytes give 43 characters, the minimum RFC 7636 allows for a verifier. */
export const randomString = (byteLength = 32): string =>
  toBase64Url(getCrypto().getRandomValues(new Uint8Array(byteLength)));

/** PKCE S256 challenge: base64url(SHA-256(verifier)). */
export const createCodeChallenge = async (verifier: string): Promise<string> => {
  const digest = await getCrypto().subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return toBase64Url(new Uint8Array(digest));
};
