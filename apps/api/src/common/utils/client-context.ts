import type { Request } from "express";
import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";
import { getClientIp } from "./request";

export interface DeviceInfo {
  browser: string;
  browserVersion: string | null;
  os: string;
  device: "Desktop" | "Mobile" | "Tablet";
}

export interface GeoInfo {
  /** ISO 3166-1 alpha-2, e.g. "IN". */
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  /** City level at best, country level when the IP is not precisely known. NOT a GPS position. */
  latitude: number | null;
  longitude: number | null;
}

/** Everything we can tell about a sign-in request, from the request alone (no extra permissions asked). */
export interface ClientContext extends DeviceInfo, GeoInfo {
  ip: string | null;
  /** Preferred language from `Accept-Language`, e.g. "en-IN". */
  language: string | null;
}

export const parseUserAgent = (userAgent: string | undefined): DeviceInfo => {
  if (!userAgent) return { browser: "Unknown", browserVersion: null, os: "Unknown", device: "Desktop" };

  const { browser, os, device } = new UAParser(userAgent).getResult();
  return {
    browser: browser.name ?? "Unknown",
    browserVersion: browser.version ?? null,
    os: os.name ? `${os.name}${os.version ? ` ${os.version}` : ""}` : "Unknown",
    device: device.type === "mobile" ? "Mobile" : device.type === "tablet" ? "Tablet" : "Desktop",
  };
};

const NO_GEO: GeoInfo = { country: null, region: null, city: null, timezone: null, latitude: null, longitude: null };

/** Offline lookup (bundled database): the IP is never sent to a third party. Private / unknown IPs give nothing. */
export const lookupGeo = (ip: string | null): GeoInfo => {
  if (!ip) return NO_GEO;
  const hit = geoip.lookup(ip);
  if (!hit) return NO_GEO;
  return {
    country: hit.country || null,
    region: hit.region || null,
    city: hit.city || null,
    timezone: hit.timezone || null,
    latitude: hit.ll?.[0] ?? null,
    longitude: hit.ll?.[1] ?? null,
  };
};

const parseLanguage = (header: string | undefined): string | null => {
  const first = header?.split(",")[0]?.split(";")[0]?.trim();
  return first && /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(first) ? first.slice(0, 35) : null;
};

export const getClientContext = (req: Request): ClientContext => {
  const ip = getClientIp(req);
  return {
    ip,
    ...parseUserAgent(req.headers["user-agent"]),
    ...lookupGeo(ip),
    language: parseLanguage(req.headers["accept-language"]),
  };
};

/** "Pune, MH, IN" / "IN" / null: for emails and UIs. */
export const describeLocation = (geo: Pick<GeoInfo, "city" | "region" | "country">): string | null => {
  const parts = [geo.city, geo.region, geo.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
};
