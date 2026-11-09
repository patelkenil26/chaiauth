import { db, eq, and, or, isNull, count } from "@repo/database";
import {
  clientsTable,
  consentsTable,
  usersTable,
  type InsertClient,
  type SelectClient,
} from "@repo/database/schema";

export const clientRepository = {
  async findByClientId(clientId: string): Promise<SelectClient | undefined> {
    const [client] = await db.select().from(clientsTable).where(eq(clientsTable.clientId, clientId));
    return client;
  },

  async findOwned(clientId: string, developerId: string): Promise<SelectClient | undefined> {
    const [client] = await db
      .select()
      .from(clientsTable)
      .where(and(eq(clientsTable.clientId, clientId), eq(clientsTable.developerId, developerId)));
    return client;
  },

  /** A developer cannot reuse the same name or redirect URI across their apps. */
  async findDuplicate(developerId: string, displayName: string, redirectUri: string) {
    const [client] = await db
      .select()
      .from(clientsTable)
      .where(
        and(
          eq(clientsTable.developerId, developerId),
          or(eq(clientsTable.displayName, displayName), eq(clientsTable.redirectUri, redirectUri)),
        ),
      );
    return client;
  },

  /** Listing never selects `clientSecret`. */
  async listByDeveloper(developerId: string) {
    return db
      .select({
        id: clientsTable.id,
        clientId: clientsTable.clientId,
        displayName: clientsTable.displayName,
        applicationUrl: clientsTable.applicationUrl,
        redirectUri: clientsTable.redirectUri,
        allowedIdps: clientsTable.allowedIdps,
        createdAt: clientsTable.createdAt,
      })
      .from(clientsTable)
      .where(eq(clientsTable.developerId, developerId));
  },

  async create(values: InsertClient): Promise<SelectClient> {
    const [client] = await db.insert(clientsTable).values(values).returning();
    if (!client) throw new Error("Failed to create client");
    return client;
  },

  async update(id: string, values: Partial<InsertClient>) {
    await db.update(clientsTable).set(values).where(eq(clientsTable.id, id));
  },

  async delete(id: string) {
    await db.delete(clientsTable).where(eq(clientsTable.id, id));
  },

  /** Records (or widens) the scopes a user granted to a client. */
  async upsertConsent(userId: string, clientId: string, scopes: string) {
    await db
      .insert(consentsTable)
      .values({ userId, clientId, scopes })
      .onConflictDoUpdate({ target: [consentsTable.userId, consentsTable.clientId], set: { scopes } });
  },

  // ── Users who granted this client access (server API) ──────
  /** Consent joined with the (non-deleted) user. Callers limit the fields exposed to the granted scopes. */
  async listConsentedUsers(clientId: string, limit: number, offset: number) {
    const where = and(eq(consentsTable.clientId, clientId), isNull(usersTable.deletedAt));

    const rows = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        isVerified: usersTable.isVerified,
        scopes: consentsTable.scopes,
        grantedAt: consentsTable.createdAt,
      })
      .from(consentsTable)
      .innerJoin(usersTable, eq(consentsTable.userId, usersTable.id))
      .where(where)
      .orderBy(consentsTable.createdAt, usersTable.id)
      .limit(limit)
      .offset(offset);

    const [total] = await db
      .select({ value: count() })
      .from(consentsTable)
      .innerJoin(usersTable, eq(consentsTable.userId, usersTable.id))
      .where(where);

    return { rows, total: total?.value ?? 0 };
  },

  async findConsentedUser(clientId: string, userId: string) {
    const [row] = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        isVerified: usersTable.isVerified,
        scopes: consentsTable.scopes,
        grantedAt: consentsTable.createdAt,
      })
      .from(consentsTable)
      .innerJoin(usersTable, eq(consentsTable.userId, usersTable.id))
      .where(
        and(eq(consentsTable.clientId, clientId), eq(consentsTable.userId, userId), isNull(usersTable.deletedAt)),
      );
    return row;
  },
};
