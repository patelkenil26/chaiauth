import { db, eq, and } from "@repo/database";
import { oauthAccountsTable, type InsertOAuthAccount } from "@repo/database/schema";

export const oauthAccountRepository = {
  async listByUserId(userId: string) {
    return db.select().from(oauthAccountsTable).where(eq(oauthAccountsTable.userId, userId));
  },

  async findByProviderAccount(provider: string, providerAccountId: string) {
    const [account] = await db
      .select()
      .from(oauthAccountsTable)
      .where(
        and(
          eq(oauthAccountsTable.provider, provider),
          eq(oauthAccountsTable.providerAccountId, providerAccountId),
        ),
      );
    return account;
  },

  async create(values: InsertOAuthAccount) {
    const [account] = await db.insert(oauthAccountsTable).values(values).returning();
    return account;
  },
};
