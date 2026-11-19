import {
  pgTable,
  uuid,
  varchar,
  boolean,
  doublePrecision,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

/**
 * One row per successful "Login with ChaiAuth" sign-in to a registered app: who, from which device and
 * (approximate) place. Apps that request the `login_context` scope receive the same data in the ID token,
 * so they never have to collect it themselves.
 */
export const loginEventsTable = pgTable(
  "login_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    /** The app that was signed in to (`clients.client_id`). */
    clientId: varchar("client_id", { length: 255 }).notNull(),
    /** password | email_code | mfa | google | github ... */
    method: varchar("method", { length: 30 }).notNull(),

    // Device
    browser: varchar("browser", { length: 100 }),
    browserVersion: varchar("browser_version", { length: 50 }),
    os: varchar("os", { length: 100 }),
    device: varchar("device", { length: 20 }),
    language: varchar("language", { length: 35 }),

    // Network + approximate location (derived from the IP, city level at best)
    ip: varchar("ip", { length: 64 }),
    country: varchar("country", { length: 2 }),
    region: varchar("region", { length: 100 }),
    city: varchar("city", { length: 100 }),
    timezone: varchar("timezone", { length: 64 }),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),

    /** First time this browser / OS / country combination signed in for this user. */
    isNewDevice: boolean("is_new_device").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("login_events_user_created_idx").on(t.userId, t.createdAt),
    index("login_events_client_idx").on(t.clientId),
  ],
);

export type SelectLoginEvent = typeof loginEventsTable.$inferSelect;
export type InsertLoginEvent = typeof loginEventsTable.$inferInsert;
