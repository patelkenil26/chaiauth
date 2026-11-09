import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const passkeysTable = pgTable(
  "passkeys",
  {
    // WebAuthn credentialID (base64url)
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    // base64url-encoded public key bytes
    publicKey: text("public_key").notNull(),
    counter: integer("counter").notNull(),
    deviceType: varchar("device_type", { length: 32 }).notNull(),
    backedUp: boolean("backed_up").notNull(),
    // JSON array of transports
    transports: text("transports"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("passkeys_user_id_idx").on(t.userId)],
);

export type SelectPasskey = typeof passkeysTable.$inferSelect;
export type InsertPasskey = typeof passkeysTable.$inferInsert;
