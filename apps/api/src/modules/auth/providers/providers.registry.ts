import { ApiError } from "../../../common/errors/api-error";
import { githubProvider } from "./list/github.provider";
import { googleProvider } from "./list/google.provider";
import type { OAuthProvider } from "./providers.types";

/** Single list of supported providers. Add new ones here. */
const providers: readonly OAuthProvider[] = [googleProvider, githubProvider];

export const PROVIDER_IDS = providers.map((p) => p.id) as [string, ...string[]];

export const getProvider = (id: string): OAuthProvider => {
  const provider = providers.find((p) => p.id === id);
  if (!provider || !provider.isConfigured()) {
    throw ApiError.badRequest(`Sign-in with "${id}" is not available`);
  }
  return provider;
};
