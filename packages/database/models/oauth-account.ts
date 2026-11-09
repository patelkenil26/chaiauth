import { pgTable, uuid, varchar, timestamp, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const oauthAccountsTable = pgTable(
  "oauth_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    // e.g. "google", "github"
    provider: varchar("provider", { length: 50 }).notNull(),
    // The provider's own unique id for this account
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique("oauth_provider_account_unique").on(t.provider, t.providerAccountId)],
);

export type SelectOAuthAccount = typeof oauthAccountsTable.$inferSelect;
export type InsertOAuthAccount = typeof oauthAccountsTable.$inferInsert;
