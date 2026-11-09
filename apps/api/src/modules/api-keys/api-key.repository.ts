import { db, eq, and, or, isNull, lt, gt, desc, count } from "@repo/database";
import { apiKeysTable, type InsertApiKey, type SelectApiKey } from "@repo/database/schema";

/** `lastUsedAt` is refreshed at most once per window, so busy keys do not cause a write per request. */
const TOUCH_WINDOW_MS = 60_000;

/** Listing never selects `keyHash`. */
const publicColumns = {
  id: apiKeysTable.id,
  name: apiKeysTable.name,
  keyPrefix: apiKeysTable.keyPrefix,
  lastUsedAt: apiKeysTable.lastUsedAt,
  expiresAt: apiKeysTable.expiresAt,
  revokedAt: apiKeysTable.revokedAt,
  createdAt: apiKeysTable.createdAt,
};

export const apiKeyRepository = {
  async create(values: InsertApiKey) {
    const [key] = await db.insert(apiKeysTable).values(values).returning(publicColumns);
    if (!key) throw new Error("Failed to create API key");
    return key;
  },

  async listByClient(clientId: string) {
    return db
      .select(publicColumns)
      .from(apiKeysTable)
      .where(eq(apiKeysTable.clientId, clientId))
      .orderBy(desc(apiKeysTable.createdAt));
  },

  /** Keys that are neither revoked nor expired (used to cap how many an app can hold). */
  async countActive(clientId: string): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(apiKeysTable)
      .where(
        and(
          eq(apiKeysTable.clientId, clientId),
          isNull(apiKeysTable.revokedAt),
          or(isNull(apiKeysTable.expiresAt), gt(apiKeysTable.expiresAt, new Date())),
        ),
      );
    return row?.value ?? 0;
  },

  async findByHash(keyHash: string): Promise<SelectApiKey | undefined> {
    const [key] = await db.select().from(apiKeysTable).where(eq(apiKeysTable.keyHash, keyHash));
    return key;
  },

  /** Returns false if the key does not belong to the client or was already revoked. */
  async revoke(clientId: string, keyId: string): Promise<boolean> {
    const rows = await db
      .update(apiKeysTable)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(apiKeysTable.id, keyId), eq(apiKeysTable.clientId, clientId), isNull(apiKeysTable.revokedAt)),
      )
      .returning({ id: apiKeysTable.id });
    return rows.length > 0;
  },

  async touch(keyId: string): Promise<void> {
    await db
      .update(apiKeysTable)
      .set({ lastUsedAt: new Date() })
      .where(
        and(
          eq(apiKeysTable.id, keyId),
          or(isNull(apiKeysTable.lastUsedAt), lt(apiKeysTable.lastUsedAt, new Date(Date.now() - TOUCH_WINDOW_MS))),
        ),
      );
  },
};
