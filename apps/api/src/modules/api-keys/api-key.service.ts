import crypto from "node:crypto";
import { ApiError } from "../../common/errors/api-error";
import { hashToken } from "../../common/utils/crypto";
import { days } from "../../common/utils/duration";
import { runSafely } from "../../common/utils/safe-async";
import { clientRepository } from "../oidc/client.repository";
import { apiKeyRepository } from "./api-key.repository";
import type { CreateApiKeyInput, ListUsersQuery } from "./api-key.dto";

/** Recognisable prefix so leaked keys are easy to spot (and to scan for) in code and logs. */
const KEY_PREFIX = "ca_live_";
/** Characters of the key kept in clear text for display, e.g. "ca_live_a1b2c3d4". */
const DISPLAY_PREFIX_LENGTH = KEY_PREFIX.length + 8;
export const MAX_ACTIVE_KEYS_PER_APP = 10;

export type KeyStatus = "active" | "expired" | "revoked";

const statusOf = (key: { revokedAt: Date | null; expiresAt: Date | null }): KeyStatus => {
  if (key.revokedAt) return "revoked";
  if (key.expiresAt && key.expiresAt.getTime() <= Date.now()) return "expired";
  return "active";
};

/** Fields a user's consent allows the application to read (same rules as /o/userinfo). */
const toClaims = (row: {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  scopes: string;
  grantedAt: Date;
}) => {
  const scopes = row.scopes.split(" ");
  return {
    sub: row.id,
    ...(scopes.includes("profile") && { name: row.name }),
    ...(scopes.includes("email") && { email: row.email, email_verified: row.isVerified }),
    scope: row.scopes,
    granted_at: row.grantedAt,
  };
};

export const apiKeyService = {
  /** The developer must own the application. 404 (not 403) so ids cannot be probed. */
  async assertOwnsClient(developerId: string, clientId: string): Promise<void> {
    const client = await clientRepository.findOwned(clientId, developerId);
    if (!client) throw ApiError.notFound("Application not found or you don't have permission to manage it.");
  },

  /** The raw key is returned ONCE; only its SHA-256 hash is stored. */
  async create(developerId: string, clientId: string, input: CreateApiKeyInput) {
    await this.assertOwnsClient(developerId, clientId);

    if ((await apiKeyRepository.countActive(clientId)) >= MAX_ACTIVE_KEYS_PER_APP) {
      throw ApiError.conflict(`An application can have at most ${MAX_ACTIVE_KEYS_PER_APP} active API keys. Revoke one first.`);
    }

    const key = `${KEY_PREFIX}${crypto.randomBytes(24).toString("base64url")}`;
    const created = await apiKeyRepository.create({
      clientId,
      name: input.name,
      keyPrefix: key.slice(0, DISPLAY_PREFIX_LENGTH),
      keyHash: hashToken(key),
      expiresAt: input.expiresInDays ? new Date(Date.now() + days(input.expiresInDays)) : null,
    });

    return { ...created, status: statusOf(created), key };
  },

  async list(developerId: string, clientId: string) {
    await this.assertOwnsClient(developerId, clientId);
    const keys = await apiKeyRepository.listByClient(clientId);
    return keys.map((k) => ({ ...k, status: statusOf(k) }));
  },

  async revoke(developerId: string, clientId: string, keyId: string): Promise<void> {
    await this.assertOwnsClient(developerId, clientId);
    const revoked = await apiKeyRepository.revoke(clientId, keyId);
    if (!revoked) throw ApiError.notFound("API key not found or already revoked.");
  },

  /** Resolves a presented key to its application, or throws 401. Never reveals why it failed. */
  async authenticate(rawKey: string): Promise<{ clientId: string; keyId: string }> {
    const invalid = ApiError.unauthorized("Invalid API key");

    const key = await apiKeyRepository.findByHash(hashToken(rawKey));
    if (!key || statusOf(key) !== "active") throw invalid;

    void runSafely("API key touch", apiKeyRepository.touch(key.id));
    return { clientId: key.clientId, keyId: key.id };
  },

  // ── Server API ────────────────────────────────────────────
  async listUsers(clientId: string, { limit, offset }: ListUsersQuery) {
    const { rows, total } = await clientRepository.listConsentedUsers(clientId, limit, offset);
    return { users: rows.map(toClaims), total, limit, offset };
  },

  async getUser(clientId: string, userId: string) {
    const row = await clientRepository.findConsentedUser(clientId, userId);
    // Same answer whether the user does not exist or never granted access to this app
    if (!row) throw ApiError.notFound("User not found");
    return toClaims(row);
  },
};
