import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";
import { SignJWT, exportJWK, generateKeyPair, type CryptoKey } from "jose";
import { ChaiAuthTokenError, createChaiAuth, getBearerToken } from "./index";

const CLIENT = "client-abc";

let privateKey: CryptoKey;
let jwks: { keys: unknown[] };
let server: http.Server;
let issuer: string;

async function sign(
  claims: Record<string, unknown>,
  opts: { key?: CryptoKey | Uint8Array; alg?: string; iss?: string; exp?: string | number } = {},
) {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: opts.alg ?? "RS256", kid: "test-key" })
    .setIssuer(opts.iss ?? issuer)
    .setIssuedAt()
    .setExpirationTime(opts.exp ?? "5m")
    .sign((opts.key ?? privateKey) as CryptoKey);
}

before(async () => {
  const pair = await generateKeyPair("RS256", { extractable: true });
  privateKey = pair.privateKey;
  const jwk = await exportJWK(pair.publicKey);
  jwks = { keys: [{ ...jwk, kid: "test-key", use: "sig", alg: "RS256" }] };

  // Stands in for the ChaiAuth API: serves the JWKS and userinfo
  server = http.createServer((req, res) => {
    if (req.url === "/.well-known/jwks.json") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(jwks));
    } else if (req.url === "/o/userinfo") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ sub: "user-1", name: "Ada", email: "ada@example.com", email_verified: true }));
    } else {
      res.statusCode = 404;
      res.end();
    }
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  issuer = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => server.close());

describe("getBearerToken", () => {
  it("extracts a Bearer token", () => assert.equal(getBearerToken("Bearer abc.def"), "abc.def"));
  it("is case-insensitive on the scheme", () => assert.equal(getBearerToken("bearer abc"), "abc"));
  it("returns null for missing or non-bearer headers", () => {
    assert.equal(getBearerToken(undefined), null);
    assert.equal(getBearerToken(""), null);
    assert.equal(getBearerToken("Basic dXNlcjpwYXNz"), null);
    assert.equal(getBearerToken("Bearer"), null);
  });
});

describe("verifyToken", () => {
  it("accepts a valid access token fetched via the issuer JWKS", async () => {
    const chaiauth = createChaiAuth({ issuer, clientId: CLIENT });
    const token = await sign({ sub: "user-1", client_id: CLIENT, scope: "openid profile email" });
    const v = await chaiauth.verifyToken(token);
    assert.equal(v.userId, "user-1");
    assert.equal(v.clientId, CLIENT);
    assert.deepEqual(v.scopes, ["openid", "profile", "email"]);
  });

  it("accepts an ID token (aud instead of client_id)", async () => {
    const chaiauth = createChaiAuth({ issuer, clientId: CLIENT });
    const v = await chaiauth.verifyToken(await sign({ sub: "user-2", aud: CLIENT }));
    assert.equal(v.userId, "user-2");
  });

  it("tolerates a trailing slash on the issuer option", async () => {
    const chaiauth = createChaiAuth({ issuer: `${issuer}/`, clientId: CLIENT });
    const v = await chaiauth.verifyToken(await sign({ sub: "u", client_id: CLIENT }));
    assert.equal(v.userId, "u");
  });

  it("rejects a missing token", async () => {
    const chaiauth = createChaiAuth({ issuer });
    await assert.rejects(chaiauth.verifyToken(null), (e: ChaiAuthTokenError) => e.code === "missing_token");
  });

  it("rejects an expired token with token_expired", async () => {
    const chaiauth = createChaiAuth({ issuer, clientId: CLIENT, clockToleranceSec: 0 });
    const token = await sign({ sub: "u", client_id: CLIENT }, { exp: Math.floor(Date.now() / 1000) - 60 });
    await assert.rejects(chaiauth.verifyToken(token), (e: ChaiAuthTokenError) => e.code === "token_expired");
  });

  it("rejects a token from a different issuer", async () => {
    const chaiauth = createChaiAuth({ issuer, clientId: CLIENT });
    const token = await sign({ sub: "u", client_id: CLIENT }, { iss: "https://evil.example.com" });
    await assert.rejects(chaiauth.verifyToken(token), (e: ChaiAuthTokenError) => e.code === "invalid_token");
  });

  it("rejects a token issued to another application", async () => {
    const chaiauth = createChaiAuth({ issuer, clientId: CLIENT });
    const token = await sign({ sub: "u", client_id: "someone-elses-app" });
    await assert.rejects(chaiauth.verifyToken(token), (e: ChaiAuthTokenError) => e.code === "wrong_client");
  });

  it("rejects a token signed with a different key", async () => {
    const chaiauth = createChaiAuth({ issuer, clientId: CLIENT });
    const other = await generateKeyPair("RS256");
    const token = await sign({ sub: "u", client_id: CLIENT }, { key: other.privateKey });
    await assert.rejects(chaiauth.verifyToken(token), (e: ChaiAuthTokenError) => e.code === "invalid_token");
  });

  it("rejects an HS256 token (algorithm confusion)", async () => {
    const chaiauth = createChaiAuth({ issuer, clientId: CLIENT });
    const token = await sign(
      { sub: "u", client_id: CLIENT },
      { alg: "HS256", key: new TextEncoder().encode("a-shared-secret-of-32-chars-minimum!") },
    );
    await assert.rejects(chaiauth.verifyToken(token), (e: ChaiAuthTokenError) => e.code === "invalid_token");
  });

  it("rejects an unsigned (alg: none) token", async () => {
    const chaiauth = createChaiAuth({ issuer, clientId: CLIENT });
    const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const token = `${b64({ alg: "none", typ: "JWT" })}.${b64({ sub: "u", client_id: CLIENT, iss: issuer, exp: 9999999999 })}.`;
    await assert.rejects(chaiauth.verifyToken(token), (e: ChaiAuthTokenError) => e.code === "invalid_token");
  });

  it("rejects garbage", async () => {
    const chaiauth = createChaiAuth({ issuer });
    await assert.rejects(chaiauth.verifyToken("not-a-jwt"), (e: ChaiAuthTokenError) => e.code === "invalid_token");
  });

  it("accepts any app when no clientId is configured", async () => {
    const chaiauth = createChaiAuth({ issuer });
    const v = await chaiauth.verifyToken(await sign({ sub: "u", client_id: "any-app" }));
    assert.equal(v.clientId, "any-app");
  });
});

describe("getUserInfo", () => {
  it("verifies the token, then returns the profile", async () => {
    const chaiauth = createChaiAuth({ issuer, clientId: CLIENT });
    const token = await sign({ sub: "user-1", client_id: CLIENT, scope: "openid profile email" });
    const info = await chaiauth.getUserInfo(token);
    assert.equal(info.email, "ada@example.com");
    assert.equal(info.name, "Ada");
  });

  it("refuses to call userinfo with an invalid token", async () => {
    const chaiauth = createChaiAuth({ issuer, clientId: CLIENT });
    await assert.rejects(chaiauth.getUserInfo("bad"), (e: ChaiAuthTokenError) => e.code === "invalid_token");
  });
});
