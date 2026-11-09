import { db, eq, and, or, gt, sql, type SQL } from "@repo/database";
import { usersTable, type InsertUser, type SelectUser } from "@repo/database/schema";

/**
 * Data-access for the `users` table. Every module that needs a user (auth, mfa,
 * webauthn, providers, oidc) goes through here instead of writing its own queries.
 */
export const userRepository = {
  async findById(id: string): Promise<SelectUser | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user;
  },

  async findByEmail(email: string): Promise<SelectUser | undefined> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    return user;
  },

  /** Matches ANY of the provided unique identifiers (used for duplicate checks). */
  async findByAnyIdentifier(ids: {
    email?: string;
    username?: string;
    phone?: string;
  }): Promise<SelectUser | undefined> {
    const conditions: SQL[] = [];
    if (ids.email) conditions.push(eq(usersTable.email, ids.email));
    if (ids.username) conditions.push(eq(usersTable.username, ids.username));
    if (ids.phone) conditions.push(eq(usersTable.phone, ids.phone));
    if (conditions.length === 0) return undefined;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(or(...conditions));
    return user;
  },

  /** Login lookup: a single identifier may be an email, username or phone number. */
  async findByLoginIdentifier(identifier: string): Promise<SelectUser | undefined> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        or(
          eq(usersTable.email, identifier),
          eq(usersTable.username, identifier),
          eq(usersTable.phone, identifier),
        ),
      );
    return user;
  },

  async findByVerificationToken(tokenHash: string): Promise<SelectUser | undefined> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.verificationToken, tokenHash));
    return user;
  },

  /** Only returns the user if the reset token has not expired. */
  async findByValidResetToken(tokenHash: string): Promise<SelectUser | undefined> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.resetPasswordToken, tokenHash),
          gt(usersTable.resetPasswordExpires, new Date()),
        ),
      );
    return user;
  },

  /**
   * Atomically removes one backup-code hash. Returns false if the code was not present,
   * so two concurrent requests can never both spend the same code.
   */
  async consumeBackupCode(id: string, codeHash: string): Promise<boolean> {
    const rows = await db
      .update(usersTable)
      .set({ backupCodes: sql`array_remove(${usersTable.backupCodes}, ${codeHash})` })
      .where(and(eq(usersTable.id, id), sql`${codeHash} = ANY(${usersTable.backupCodes})`))
      .returning({ id: usersTable.id });
    return rows.length > 0;
  },

  async create(values: InsertUser): Promise<SelectUser> {
    const [user] = await db.insert(usersTable).values(values).returning();
    if (!user) throw new Error("Failed to create user");
    return user;
  },

  async update(id: string, values: Partial<InsertUser>): Promise<SelectUser | undefined> {
    const [user] = await db.update(usersTable).set(values).where(eq(usersTable.id, id)).returning();
    return user;
  },
};
