import { ApiError } from "../../../../common/errors/api-error";
import { config } from "../../../../common/config/env.config";
import type { OAuthProfile, OAuthProvider } from "../providers.types";

interface GithubUser {
  id: number;
  login: string;
  name: string | null;
}
interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

const githubGet = async <T>(url: string, accessToken: string): Promise<T> => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub API ${url} responded ${res.status}`);
  return (await res.json()) as T;
};

class GithubProvider implements OAuthProvider {
  readonly id = "github";
  readonly displayName = "GitHub";

  isConfigured() {
    return Boolean(config.github.clientId && config.github.clientSecret);
  }

  getAuthUrl(state: string) {
    const params = new URLSearchParams({
      client_id: config.github.clientId,
      redirect_uri: config.github.callbackUrl,
      scope: "read:user user:email",
      state,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async getProfile(code: string): Promise<OAuthProfile> {
    try {
      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          client_id: config.github.clientId,
          client_secret: config.github.clientSecret,
          code,
          redirect_uri: config.github.callbackUrl,
        }),
      });
      const { access_token: accessToken } = (await tokenRes.json()) as { access_token?: string };
      if (!accessToken) throw new Error("GitHub did not return an access token");

      const user = await githubGet<GithubUser>("https://api.github.com/user", accessToken);

      // /user.email is the PUBLIC profile email and is not proof of ownership.
      // Only an entry flagged `verified` in /user/emails counts.
      const emails = await githubGet<GithubEmail[]>("https://api.github.com/user/emails", accessToken);
      const best = emails.find((e) => e.primary && e.verified) ?? emails.find((e) => e.verified);

      return {
        providerAccountId: String(user.id),
        email: best?.email ?? null,
        name: user.name ?? user.login,
        emailVerified: Boolean(best),
      };
    } catch {
      throw ApiError.badRequest("GitHub sign-in failed. Please try again.");
    }
  }
}

export const githubProvider = new GithubProvider();
