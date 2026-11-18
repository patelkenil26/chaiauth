export type AuthMethod = "password" | "google" | "github" | "passkey" | "magic";

const KEY = "chaiauth:last-method";

export function getLastMethod(): AuthMethod | null {
  try {
    return (localStorage.getItem(KEY) as AuthMethod | null) ?? null;
  } catch {
    return null;
  }
}

export function setLastMethod(method: AuthMethod) {
  try {
    localStorage.setItem(KEY, method);
  } catch {
    /* storage unavailable */
  }
}
