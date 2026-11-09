import { db, eq, and, or } from "@repo/database";
import {
  clientsTable,
  consentsTable,
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
};
