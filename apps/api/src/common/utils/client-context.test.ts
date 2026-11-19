import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { Request } from "express";
import { describeLocation, getClientContext, lookupGeo, parseUserAgent } from "./client-context";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
const WINDOWS_CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const fakeReq = (ip: string, headers: Record<string, string>) => ({ ip, headers, socket: {} }) as unknown as Request;

describe("parseUserAgent", () => {
  test("detects a phone", () => {
    const d = parseUserAgent(IPHONE);
    assert.equal(d.device, "Mobile");
    assert.match(d.os, /iOS/);
    assert.equal(d.browser, "Mobile Safari");
  });

  test("detects a desktop browser", () => {
    const d = parseUserAgent(WINDOWS_CHROME);
    assert.equal(d.device, "Desktop");
    assert.equal(d.browser, "Chrome");
    assert.match(d.os, /Windows/);
  });

  test("a missing user agent does not throw", () => {
    assert.deepEqual(parseUserAgent(undefined), { browser: "Unknown", browserVersion: null, os: "Unknown", device: "Desktop" });
  });
});

describe("lookupGeo", () => {
  test("resolves a public IP offline", () => {
    const geo = lookupGeo("8.8.8.8");
    assert.equal(geo.country, "US");
    assert.ok(geo.timezone);
    assert.equal(typeof geo.latitude, "number");
  });

  test("private, loopback and missing IPs give no location", () => {
    for (const ip of ["127.0.0.1", "192.168.1.20", "10.0.0.5", null]) {
      assert.equal(lookupGeo(ip).country, null, String(ip));
    }
  });
});

describe("getClientContext", () => {
  test("combines IP, device, location and language from the request", () => {
    const ctx = getClientContext(fakeReq("::ffff:8.8.8.8", { "user-agent": IPHONE, "accept-language": "en-IN,en;q=0.9" }));
    assert.equal(ctx.ip, "8.8.8.8");
    assert.equal(ctx.device, "Mobile");
    assert.equal(ctx.country, "US");
    assert.equal(ctx.language, "en-IN");
  });

  test("ignores a malformed Accept-Language header", () => {
    assert.equal(getClientContext(fakeReq("8.8.8.8", { "accept-language": "<script>" })).language, null);
  });
});

describe("describeLocation", () => {
  test("joins what is known", () => {
    assert.equal(describeLocation({ city: "Pune", region: "MH", country: "IN" }), "Pune, MH, IN");
    assert.equal(describeLocation({ city: null, region: null, country: "IN" }), "IN");
    assert.equal(describeLocation({ city: null, region: null, country: null }), null);
  });
});
