import assert from "node:assert/strict";
import { before, describe, test } from "node:test";
import type { EmailBrand } from "./brand";

// The email modules read the app config when first imported, so give it harmless test values first.
process.env.DATA_ENCRYPTION_KEY ??= "0".repeat(64);
process.env.JWT_ACCESS_SECRET ??= "test-access-secret-test-access-secret";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-test-refresh-secret";

let brandModule: typeof import("./brand");
let templates: typeof import("./templates/auth.email");

before(async () => {
  brandModule = await import("./brand");
  templates = await import("./templates/auth.email");
});

const APP: EmailBrand = {
  name: "ChaiForm",
  url: "https://chaiform.example",
  logoUrl: "https://chaiform.example/logo.png",
  color: "#65a30d",
  fromName: "ChaiForm",
  isApp: true,
};

/** Every email an app's users can receive, rendered as the app. */
const appEmails = (): Array<[string, string]> => [
  ["verification", templates.verificationEmail("https://chaiform.example/verify-email?token=t", APP)],
  ["reset", templates.resetPasswordEmail("https://chaiform.example/reset-password?token=t", APP)],
  ["welcome", templates.welcomeEmail("Asha", "https://chaiform.example", APP)],
  ["password changed", templates.passwordChangedEmail(APP)],
  ["otp", templates.otpEmail("123456", APP)],
  ["new device", templates.suspiciousLoginEmail({ device: "Chrome on Windows", location: "Pune, MH, IN", time: "now" }, APP)],
];

describe("emails sent as an app", () => {
  test("none of them ever mentions ChaiAuth", () => {
    for (const [name, html] of appEmails()) {
      assert.doesNotMatch(html, /chai\s*auth/i, name);
    }
  });

  test("all of them carry the app's name", () => {
    for (const [name, html] of appEmails()) {
      assert.match(html, /ChaiForm/, name);
    }
  });

  test("buttons use the app's colour instead of ChaiAuth orange", () => {
    const html = templates.verificationEmail("https://chaiform.example/verify-email?token=t", APP);
    assert.match(html, /#65a30d/);
    assert.doesNotMatch(html, /#EA6A1F/i);
  });

  test("links point to the app's own site", () => {
    const html = templates.resetPasswordEmail("https://chaiform.example/reset-password?token=t", APP);
    assert.match(html, /https:\/\/chaiform\.example\/reset-password\?token=t/);
  });

  test("an app name is escaped, never injected as HTML", () => {
    const html = templates.verificationEmail("https://x.example", { ...APP, name: `<script>alert(1)</script>` });
    assert.doesNotMatch(html, /<script>alert/);
  });

  test("without a logo the header is text only", () => {
    const html = templates.verificationEmail("https://x.example", { ...APP, logoUrl: null });
    assert.doesNotMatch(html, /<img/);
  });
});

describe("emails sent as ChaiAuth", () => {
  test("keep the ChaiAuth brand when no app is given", () => {
    const html = templates.verificationEmail("https://auth.example/verify-email?token=t");
    assert.match(html, /Auth<\/span>/);
    assert.match(html, /Welcome to ChaiAuth/);
  });
});

describe("From header", () => {
  test("uses the app name on our verified sending address", () => {
    assert.equal(brandModule.formatFrom("ChaiAuth <noreply@mail.example>", "ChaiForm"), "ChaiForm <noreply@mail.example>");
  });

  test("falls back to the default without an app name", () => {
    assert.equal(brandModule.formatFrom("ChaiAuth <noreply@mail.example>"), "ChaiAuth <noreply@mail.example>");
  });

  test("a hostile name cannot inject headers or extra recipients", () => {
    const from = brandModule.formatFrom("ChaiAuth <noreply@mail.example>", `Evil\r\nBcc: x@y.z <a@b.c>`);
    assert.doesNotMatch(from, /[\r\n]/);
    assert.equal(from.match(/</g)?.length, 1);
    assert.equal(brandModule.safeFromName(`A"B,C;D`), "ABCD");
  });
});
