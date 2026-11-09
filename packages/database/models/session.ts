import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const sessionsTable = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    // Device / browser fingerprint
    browser: varchar("browser", { length: 100 }),
    browserVersion: varchar("browser_version", { length: 50 }),
    os: varchar("os", { length: 100 }),
    device: varchar("device", { length: 100 }).default("Desktop"),

    // Network info
    ip: varchar("ip", { length: 64 }),
    city: varchar("city", { length: 100 }),
    country: varchar("country", { length: 100 }),

    // SHA-256 of the refresh token this session belongs to
    tokenHash: text("token_hash").notNull(),

    isActive: boolean("is_active").default(true).notNull(),
    lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("sessions_user_id_idx").on(t.userId),
    index("sessions_token_hash_idx").on(t.tokenHash),
  ],
);

export type SelectSession = typeof sessionsTable.$inferSelect;
export type InsertSession = typeof sessionsTable.$inferInsert;
