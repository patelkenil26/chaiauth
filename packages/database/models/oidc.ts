import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

/** A third-party application registered by a developer ("Login with ChaiAuth"). */
export const clientsTable = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    developerId: uuid("developer_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 255 }).notNull().unique(),
    // SHA-256 hash of the secret. The raw secret is shown to the developer once and never stored.
    clientSecret: varchar("client_secret", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    applicationUrl: varchar("application_url", { length: 255 }),
    redirectUri: varchar("redirect_uri", { length: 255 }).notNull(),
    allowedIdps: jsonb("allowed_idps")
      .$type<string[]>()
      .notNull()
      .default(["email", "google"]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("clients_developer_id_idx").on(t.developerId)],
);

/** Scopes a user has granted to a client. */
export const consentsTable = pgTable(
  "consents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 255 }).notNull(),
    scopes: varchar("scopes", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique("consents_user_client_unique").on(t.userId, t.clientId)],
);

/**
 * Server-to-server API keys of a registered application.
 * Only the SHA-256 hash is stored; the raw key is shown to the developer once.
 */
export const apiKeysTable = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: varchar("client_id", { length: 255 })
      .notNull()
      .references(() => clientsTable.clientId, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    // First characters of the key, safe to display so a key can be recognised in a list
    keyPrefix: varchar("key_prefix", { length: 24 }).notNull(),
    keyHash: varchar("key_hash", { length: 64 }).notNull().unique(),
    lastUsedAt: timestamp("last_used_at"),
    expiresAt: timestamp("expires_at"),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("api_keys_client_id_idx").on(t.clientId)],
);

export type SelectClient = typeof clientsTable.$inferSelect;
export type InsertClient = typeof clientsTable.$inferInsert;
export type SelectConsent = typeof consentsTable.$inferSelect;
export type InsertConsent = typeof consentsTable.$inferInsert;
export type SelectApiKey = typeof apiKeysTable.$inferSelect;
export type InsertApiKey = typeof apiKeysTable.$inferInsert;
