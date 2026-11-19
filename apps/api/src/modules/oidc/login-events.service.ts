import { and, db, desc, eq, isNull } from "@repo/database";
import { loginEventsTable, usersTable, type SelectLoginEvent } from "@repo/database/schema";
import { logger } from "@repo/logger";
import type { EmailBrand } from "../../common/email/brand";
import { emailService } from "../../common/email/email.service";
import { describeLocation, type ClientContext } from "../../common/utils/client-context";
import { runSafely } from "../../common/utils/safe-async";

/**
 * What an app receives (as the `login_context` claim of the ID token) when it asks for the
 * `login_context` scope: the security facts about this sign-in, so it never has to collect them itself.
 */
export interface LoginContextClaim {
  event_id: string;
  method: string;
  at: string;
  is_new_device: boolean;
  ip: string | null;
  device: { type: string; browser: string; browser_version: string | null; os: string };
  language: string | null;
  location: {
    country: string | null;
    region: string | null;
    city: string | null;
    timezone: string | null;
    /** Approximate (city level at best). Not a GPS position. */
    latitude: number | null;
    longitude: number | null;
  };
}

export const toLoginContextClaim = (event: SelectLoginEvent): LoginContextClaim => ({
  event_id: event.id,
  method: event.method,
  at: event.createdAt.toISOString(),
  is_new_device: event.isNewDevice,
  ip: event.ip,
  device: {
    type: event.device ?? "Desktop",
    browser: event.browser ?? "Unknown",
    browser_version: event.browserVersion,
    os: event.os ?? "Unknown",
  },
  language: event.language,
  location: {
    country: event.country,
    region: event.region,
    city: event.city,
    timezone: event.timezone,
    latitude: event.latitude,
    longitude: event.longitude,
  },
});

/**
 * A sign-in is "new" when this user has signed in before, but never from this browser + OS + country.
 * (The IP alone changes too often on mobile networks to be a useful signal.)
 */
const isNewDevice = async (userId: string, ctx: ClientContext): Promise<boolean> => {
  const [anyPrevious] = await db
    .select({ id: loginEventsTable.id })
    .from(loginEventsTable)
    .where(eq(loginEventsTable.userId, userId))
    .limit(1);
  if (!anyPrevious) return false; // the very first sign-in is not suspicious

  const [known] = await db
    .select({ id: loginEventsTable.id })
    .from(loginEventsTable)
    .where(
      and(
        eq(loginEventsTable.userId, userId),
        eq(loginEventsTable.browser, ctx.browser),
        eq(loginEventsTable.os, ctx.os),
        ctx.country ? eq(loginEventsTable.country, ctx.country) : isNull(loginEventsTable.country),
      ),
    )
    .limit(1);
  return !known;
};

export const loginEventsService = {
  /**
   * Records a sign-in to an app and alerts the user about an unfamiliar device.
   * Best effort: a failure here must never stop the user from signing in, so it resolves to `null`.
   */
  async record(params: {
    userId: string;
    clientId: string;
    clientName: string;
    /** Email as this app, when it has one for this user. */
    brand?: EmailBrand;
    method: string;
    context: ClientContext;
  }): Promise<SelectLoginEvent | null> {
    const { userId, clientId, clientName, brand, method, context } = params;
    try {
      const newDevice = await isNewDevice(userId, context);

      const [event] = await db
        .insert(loginEventsTable)
        .values({
          userId,
          clientId,
          method,
          browser: context.browser,
          browserVersion: context.browserVersion,
          os: context.os,
          device: context.device,
          language: context.language,
          ip: context.ip,
          country: context.country,
          region: context.region,
          city: context.city,
          timezone: context.timezone,
          latitude: context.latitude,
          longitude: context.longitude,
          isNewDevice: newDevice,
        })
        .returning();
      if (!event) return null;

      if (newDevice) {
        const [user] = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.id, userId));
        if (user?.email) {
          void runSafely(
            "Suspicious login email",
            emailService.sendSuspiciousLoginEmail(
              user.email,
              {
                // With an app brand the email already is "from the app"; otherwise name the app
                device: brand
                  ? `${context.browser} on ${context.os}`
                  : `${context.browser} on ${context.os} (signing in to ${clientName})`,
                location: describeLocation(context) ?? context.ip ?? "Unknown location",
                time: new Date().toUTCString(),
              },
              brand,
            ),
          );
        }
      }
      return event;
    } catch (err) {
      logger.error("Could not record login event", { err, userId, clientId });
      return null;
    }
  },

  /** Newest first. Lets the user (or an admin tool) review where they signed in. */
  listForUser(userId: string, limit = 50) {
    return db
      .select()
      .from(loginEventsTable)
      .where(eq(loginEventsTable.userId, userId))
      .orderBy(desc(loginEventsTable.createdAt))
      .limit(limit);
  },
};
