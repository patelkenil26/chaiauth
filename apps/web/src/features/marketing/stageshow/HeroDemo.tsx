"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import {
  Avatar,
  Badge,
  Bar,
  Button,
  Collapse,
  Icon,
  LockScreen,
  Notification,
  Phone,
  Stage,
  States,
  Text,
  WALLPAPER,
  Window,
  type Act,
} from "./kit";
import "./kit/stageshow.css";
import "./hero-demo.css";

/**
 * One loop that tells the whole ChaiAuth story:
 *   an app sends the user to ChaiAuth -> they approve on the consent screen ->
 *   they land back signed in, with a passkey -> the phone confirms the sign-in,
 *   and ChaiAuth has blocked a suspicious attempt from somewhere else.
 * Real words only where the story needs them; the rest is filler.
 */

type View = "signin" | "consent" | "app";

type S = {
  view: View;
  approved: boolean;
  blocked: boolean;
};

const initial: S = { view: "signin", approved: false, blocked: false };
const POSTER: S = { view: "app", approved: true, blocked: true };

const URLS: Record<View, string> = {
  signin: "acme.app/login",
  consent: "auth.chaiauth.com/authorize",
  app: "acme.app/dashboard",
};

async function script(a: Act<S>) {
  await a.wait(900);

  // 1. The developer's app: sign in with ChaiAuth
  await a.move("signin");
  await a.wait(350);
  await a.click();
  await a.set({ view: "consent" });
  await a.wait(1600);

  // 2. The user reads what is shared, then approves
  await a.move("allow");
  await a.wait(450);
  await a.click();
  await a.set({ view: "app" });
  await a.wait(1000);

  // 3. The phone confirms it, then ChaiAuth reports what it blocked
  await a.set({ approved: true });
  await a.move("rest");
  await a.wait(1500);
  await a.set({ blocked: true });
  await a.wait(3400);

  // Back to the start, so the loop has no seam
  await a.set({ blocked: false });
  await a.wait(350);
  await a.set({ approved: false });
  await a.wait(500);
  await a.set({ view: "signin" });
  await a.wait(300);
}

const SCOPES = ["Read your name and email", "Verify your identity", "Stay signed in for 30 days"];

const FACTS = [
  { icon: "lock" as const, label: "Passkey", value: "Verified" },
  { icon: "globe" as const, label: "Device", value: "MacBook Pro · Chrome" },
  { icon: "wifi" as const, label: "Location", value: "Ahmedabad, IN" },
];

// The ChaiAuth mark, drawn in white for the notification's app tile.
const MARK_PATH =
  "M0 32A32 32 0 1 0 64 32A32 32 0 1 0 0 32Z M26 35.39A12 12 0 1 1 38 35.39L45.5 48Q46.5 52 42.5 52L21.5 52Q17.5 52 18.5 48Z";
function AppMark() {
  return (
    <svg viewBox="0 0 64 64" width="22" height="22" aria-hidden>
      <path fillRule="evenodd" fill="#fff" d={MARK_PATH} />
    </svg>
  );
}

const subscribeNoop = () => () => {};

export function HeroDemo() {
  const { resolvedTheme } = useTheme();
  // Server and first hydration render dark; the real theme applies once mounted
  // (the Stage reads its theme once, so it is remounted by `key` below).
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const theme = mounted && resolvedTheme === "light" ? "light" : "dark";

  return (
    // Decorative product illustration: hidden from assistive tech and not focusable.
    <div className="cd" aria-hidden inert>
      <Stage
        key={theme}
        width={760}
        height={440}
        compact={{ below: 600, width: 358, height: 640 }}
        theme={theme}
        initial={initial}
        poster={POSTER}
        script={script}
        cursor={{ at: { wide: { x: 330, y: 372 }, compact: { x: 150, y: 300 } } }}
        className="cd-stage"
      >
        {(s, _rect, layout) => (
          <>
            <Window url={URLS[s.view]} className="cd-window">
              <States
                value={s.view}
                states={{
                  signin: (
                    <div className="cd-view cd-view--center">
                      <Text className="cd-brand">Acme</Text>
                      <Text className="cd-sub">Sign in to your workspace</Text>
                      <Button variant="primary" size="large" data-target="signin" data-cursor="pointer" className="cd-sso">
                        Sign in with ChaiAuth
                      </Button>
                      <div className="cd-or">
                        <span />
                        <i>or</i>
                        <span />
                      </div>
                      <div className="cd-field">
                        <Bar w={92} h={6} tone={2} />
                      </div>
                      <div className="cd-field">
                        <Bar w={64} h={6} tone={2} />
                      </div>
                    </div>
                  ),
                  consent: (
                    <div className="cd-view cd-view--center">
                      <Text className="cd-title">Acme wants access to your account</Text>
                      <ul className="cd-scopes">
                        {SCOPES.map((t) => (
                          <li key={t} className="cd-scope">
                            <span className="cd-tick">
                              <Icon name="check" size={12} stroke={2.4} />
                            </span>
                            <Text>{t}</Text>
                          </li>
                        ))}
                      </ul>
                      <div className="cd-actions">
                        <Button variant="secondary" size="large">
                          Deny
                        </Button>
                        <Button variant="primary" size="large" data-target="allow" data-cursor="pointer">
                          Allow access
                        </Button>
                      </div>
                    </div>
                  ),
                  app: (
                    <div className="cd-view cd-view--app">
                      <div className="cd-head">
                        <Avatar name="Maya Shah" size={30} />
                        <Text className="cd-welcome">Welcome back, Maya</Text>
                        <Badge tone="success" dot>
                          Signed in
                        </Badge>
                      </div>
                      <div className="cd-panel">
                        <Text className="cd-panel-title">This sign-in</Text>
                        {FACTS.map((f) => (
                          <div key={f.label} className="cd-fact">
                            <span className="cd-fact-icon">
                              <Icon name={f.icon} size={14} />
                            </span>
                            <Text className="cd-fact-label">{f.label}</Text>
                            <Text className="cd-fact-value">{f.value}</Text>
                          </div>
                        ))}
                      </div>
                      <div className="cd-rows">
                        {[
                          [110, 44],
                          [84, 52],
                        ].map(([n, m], i) => (
                          <div key={i} className="cd-row">
                            <Bar w={14} h={14} r={4} tone={2} />
                            <Bar w={n} h={6} tone={3} />
                            <Bar w={m} h={6} tone={2} style={{ marginLeft: "auto" }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                }}
              />
            </Window>

            <Phone width={240} frame="pro" dark wallpaper={WALLPAPER} className="cd-phone">
              <LockScreen size="satellite" stack="top">
                {layout === "wide" && (
                  <Collapse open={s.blocked} reveal="drop">
                    <Notification
                      icon={<AppMark />}
                      title="Blocked a sign-in attempt"
                      body="Moscow, RU · 2-step verification required"
                    />
                  </Collapse>
                )}
                <Collapse open={s.approved} reveal="drop">
                  <Notification
                    icon={<AppMark />}
                    title="New sign-in to Acme"
                    body="Approved with a passkey · Chrome"
                  />
                </Collapse>
              </LockScreen>
            </Phone>

            <span data-target="rest" className="cd-rest" />
          </>
        )}
      </Stage>
    </div>
  );
}
