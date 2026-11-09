import { db, eq } from "@repo/database";
import { passkeysTable, type InsertPasskey } from "@repo/database/schema";

export const passkeyRepository = {
  async listByUserId(userId: string) {
    return db.select().from(passkeysTable).where(eq(passkeysTable.userId, userId));
  },

  async findById(credentialId: string) {
    const [passkey] = await db.select().from(passkeysTable).where(eq(passkeysTable.id, credentialId));
    return passkey;
  },

  async create(values: InsertPasskey) {
    await db.insert(passkeysTable).values(values);
  },

  async updateCounter(credentialId: string, counter: number) {
    await db.update(passkeysTable).set({ counter }).where(eq(passkeysTable.id, credentialId));
  },
};
