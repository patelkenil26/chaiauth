import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  index,
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
  (t) => [index("consents_user_client_idx").on(t.userId, t.clientId)],
);

export type SelectClient = typeof clientsTable.$inferSelect;
export type InsertClient = typeof clientsTable.$inferInsert;
export type SelectConsent = typeof consentsTable.$inferSelect;
export type InsertConsent = typeof consentsTable.$inferInsert;
