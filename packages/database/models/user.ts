import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const USER_ROLES = ["customer", "seller", "admin", "support"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const roleEnum = pgEnum("role", USER_ROLES);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 50 }).unique(),
  phone: varchar("phone", { length: 20 }).unique(),
  // Nullable: social / passkey-only accounts have no password
  password: text("password"),
  role: roleEnum("role").default("customer").notNull(),

  isVerified: boolean("is_verified").default(false).notNull(),
  verificationToken: text("verification_token"),

  otpCode: varchar("otp_code", { length: 64 }),
  otpExpires: timestamp("otp_expires", { mode: "date" }),

  refreshToken: text("refresh_token"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires", { mode: "date" }),

  mfaEnabled: boolean("mfa_enabled").default(false).notNull(),
  mfaSecret: text("mfa_secret"),
  backupCodes: text("backup_codes").array(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
