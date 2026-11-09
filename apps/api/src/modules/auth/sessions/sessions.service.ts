import type { Request } from "express";
import { UAParser } from "ua-parser-js";
import { db, eq, and, desc } from "@repo/database";
import { sessionsTable, usersTable, type SelectSession } from "@repo/database/schema";
import { ApiError } from "../../../common/errors/api-error";
import { emailService } from "../../../common/email/email.service";
import { hashToken } from "../../../common/utils/crypto";
import { getClientIp } from "../../../common/utils/request";
import { runSafely } from "../../../common/utils/safe-async";

interface DeviceInfo {
  browser: string;
  browserVersion: string | null;
  os: string;
  device: "Desktop" | "Mobile" | "Tablet";
}

const parseUserAgent = (userAgent: string | undefined): DeviceInfo => {
  if (!userAgent) return { browser: "Unknown", browserVersion: null, os: "Unknown", device: "Desktop" };

  const { browser, os, device } = new UAParser(userAgent).getResult();
  return {
    browser: browser.name ?? "Unknown",
    browserVersion: browser.version ?? null,
    os: os.name ? `${os.name}${os.version ? ` ${os.version}` : ""}` : "Unknown",
    device: device.type === "mobile" ? "Mobile" : device.type === "tablet" ? "Tablet" : "Desktop",
  };
};

/** Session as returned to the client: the token hash never leaves the server. */
export type PublicSession = Omit<SelectSession, "tokenHash"> & { isCurrent: boolean };

/** A login from an IP + browser combination the user has never used before. */
const isNewDevice = async (userId: string, ip: string | null, browser: string) => {
  const [anyPrevious] = await db
    .select({ id: sessionsTable.id })
    .from(sessionsTable)
    .where(eq(sessionsTable.userId, userId))
    .limit(1);
  if (!anyPrevious) return false; // first ever login is not "suspicious"

  const conditions = [eq(sessionsTable.userId, userId), eq(sessionsTable.browser, browser)];
  if (ip) conditions.push(eq(sessionsTable.ip, ip));

  const [known] = await db
    .select({ id: sessionsTable.id })
    .from(sessionsTable)
    .where(and(...conditions))
    .limit(1);
  return !known;
};

export const sessionsService = {
  /** Records a new login session and alerts the user if it comes from an unfamiliar device. */
  async createSession(params: { userId: string; refreshToken: string; req: Request }) {
    const { userId, refreshToken, req } = params;
    const device = parseUserAgent(req.headers["user-agent"]);
    const ip = getClientIp(req);

    if (await isNewDevice(userId, ip, device.browser)) {
      const [user] = await db
        .select({ email: usersTable.email })
        .from(usersTable)
        .where(eq(usersTable.id, userId));
      if (user?.email) {
        void runSafely(
          "Suspicious login email",
          emailService.sendSuspiciousLoginEmail(user.email, {
            device: `${device.browser} on ${device.os}`,
            location: ip ?? "Unknown IP",
            time: new Date().toUTCString(),
          }),
        );
      }
    }

    const [session] = await db
      .insert(sessionsTable)
      .values({
        userId,
        browser: device.browser,
        browserVersion: device.browserVersion,
        os: device.os,
        device: device.device,
        ip,
        tokenHash: hashToken(refreshToken),
      })
      .returning();
    if (!session) throw new Error("Failed to create session");
    return session;
  },

  /** Active session bound to this refresh token, if it has not been revoked. */
  async findActiveByRefreshToken(refreshToken: string) {
    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(and(eq(sessionsTable.tokenHash, hashToken(refreshToken)), eq(sessionsTable.isActive, true)));
    return session;
  },

  async findActiveById(sessionId: string) {
    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.isActive, true)));
    return session;
  },

  async touch(sessionId: string) {
    await db.update(sessionsTable).set({ lastActiveAt: new Date() }).where(eq(sessionsTable.id, sessionId));
  },

  /** Ends the session that belongs to this refresh token (logout). */
  async revokeByRefreshToken(userId: string, refreshToken: string) {
    await db
      .update(sessionsTable)
      .set({ isActive: false })
      .where(and(eq(sessionsTable.userId, userId), eq(sessionsTable.tokenHash, hashToken(refreshToken))));
  },

  async revokeById(sessionId: string, userId: string) {
    const [revoked] = await db
      .update(sessionsTable)
      .set({ isActive: false })
      .where(and(eq(sessionsTable.id, sessionId), eq(sessionsTable.userId, userId)))
      .returning({ id: sessionsTable.id });
    if (!revoked) throw ApiError.notFound("Session not found");
  },

  /** Logs the user out of every device. */
  async revokeAll(userId: string) {
    await db
      .update(sessionsTable)
      .set({ isActive: false })
      .where(and(eq(sessionsTable.userId, userId), eq(sessionsTable.isActive, true)));
  },

  /** Every session ever created for the user, active or not (GDPR data export). */
  async listAllForUser(userId: string) {
    const rows = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.userId, userId))
      .orderBy(desc(sessionsTable.createdAt));
    return rows.map(({ tokenHash: _tokenHash, ...session }) => session);
  },

  /** Active sessions, newest activity first, current device pinned to the top. */
  async listForUser(userId: string, currentRefreshToken?: string): Promise<PublicSession[]> {
    const rows = await db
      .select()
      .from(sessionsTable)
      .where(and(eq(sessionsTable.userId, userId), eq(sessionsTable.isActive, true)))
      .orderBy(desc(sessionsTable.lastActiveAt));

    const currentHash = currentRefreshToken ? hashToken(currentRefreshToken) : null;

    return rows
      .map(({ tokenHash, ...session }) => ({ ...session, isCurrent: tokenHash === currentHash }))
      .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));
  },
};
